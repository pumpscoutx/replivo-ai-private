import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { CommandSigner, ExtensionCommand, CommandResult } from './command-signer';
import { storage } from './storage';

interface ExtensionConnection {
  ws: WebSocket;
  userId: string;
  extensionId: string;
  isAuthenticated: boolean;
  lastSeen: Date;
}

export class ExtensionWebSocketServer {
  private wss: WebSocketServer;
  private connections: Map<string, ExtensionConnection> = new Map();
  private commandSigner: CommandSigner;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server, path: '/extension-ws' });
    this.commandSigner = CommandSigner.getInstance();
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws, request) => {
      console.log('Extension WebSocket connection attempted');
      
      // Extract token from query parameters
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      this.authenticateConnection(ws, token);
    });
  }

  private async authenticateConnection(ws: WebSocket, token: string) {
    try {
      // Verify JWT token (should contain userId and extensionId)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
      const { userId, extensionId } = decoded;

      // Verify extension pairing exists in database
      const pairings = await storage.getExtensionPairings(userId);
      const pairing = pairings.find(p => p.extensionId === extensionId && p.isActive);
      
      if (!pairing) {
        ws.close(1008, 'Extension not paired or inactive');
        return;
      }

      // Create connection
      const connectionId = `${userId}-${extensionId}`;
      const connection: ExtensionConnection = {
        ws,
        userId,
        extensionId,
        isAuthenticated: true,
        lastSeen: new Date()
      };

      this.connections.set(connectionId, connection);
      
      // Update last seen in database
      await storage.updateExtensionLastSeen(pairing.id);

      console.log(`Extension authenticated: ${connectionId}`);
      
      // Setup message handlers for this connection
      this.setupConnectionHandlers(connection);

      // Send authentication success
      ws.send(JSON.stringify({
        type: 'auth_success',
        public_key: this.commandSigner.getPublicKey()
      }));

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private setupConnectionHandlers(connection: ExtensionConnection) {
    const { ws, userId, extensionId } = connection;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(connection, message);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      const connectionId = `${userId}-${extensionId}`;
      this.connections.delete(connectionId);
      console.log(`Extension disconnected: ${connectionId}`);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        connection.lastSeen = new Date();
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);
  }

  private async handleMessage(connection: ExtensionConnection, message: any) {
    const { ws, userId } = connection;

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      case 'command_result':
        await this.handleCommandResult(userId, message);
        break;

      case 'permission_request':
        await this.handlePermissionRequest(connection, message);
        break;

      case 'status_update':
        await this.handleStatusUpdate(connection, message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleCommandResult(userId: string, message: any) {
    const { request_id, status, result, error } = message;
    
    // Log command execution result
    await storage.updateCommandResult(request_id, {
      status,
      result,
      error,
      executedAt: new Date().toISOString()
    });

    console.log(`Command ${request_id} ${status}: ${error || 'success'}`);
  }

  private async handlePermissionRequest(connection: ExtensionConnection, message: any) {
    // Handle dynamic permission requests from extension
    const { domain, scope } = message;
    
    // For now, log the request - in production this would trigger user consent flow
    console.log(`Permission requested: ${scope} for ${domain} by user ${connection.userId}`);
    
    // Send response back to extension
    connection.ws.send(JSON.stringify({
      type: 'permission_response',
      request_id: message.request_id,
      granted: false, // Default to false until user grants
      reason: 'User consent required'
    }));
  }

  private async handleStatusUpdate(connection: ExtensionConnection, message: any) {
    // Update extension status (idle, working, error)
    console.log(`Extension status update: ${message.status}`);
  }

  // Send command to extension
  async sendCommand(userId: string, command: ExtensionCommand): Promise<boolean> {
    const connections = Array.from(this.connections.values()).filter(
      conn => conn.userId === userId && conn.isAuthenticated
    );

    if (connections.length === 0) {
      console.error(`No active extension connections for user ${userId}`);
      return false;
    }

    // Sign the command
    const signedCommand = this.commandSigner.signCommand(command);

    // Log command in database
    await storage.createCommandLog({
      userId,
      agentId: command.agent_id,
      requestId: command.request_id,
      capability: command.capability,
      args: command.args,
      signature: signedCommand,
      status: 'pending'
    });

    // Send to all active connections for this user
    const message = JSON.stringify({
      type: 'command',
      signed_command: signedCommand
    });

    let sent = false;
    for (const connection of connections) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(message);
        sent = true;
      }
    }

    return sent;
  }

  // Get active connections for a user
  getActiveConnections(userId: string): ExtensionConnection[] {
    return Array.from(this.connections.values()).filter(
      conn => conn.userId === userId && conn.isAuthenticated
    );
  }

  // Broadcast to all connections
  broadcast(message: any) {
    const data = JSON.stringify(message);
    this.connections.forEach(connection => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(data);
      }
    });
  }
}