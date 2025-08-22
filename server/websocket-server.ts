import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { CommandSigner } from './command-signer';

interface ExtensionConnection {
  ws: WebSocket;
  extensionId: string;
  userId: string;
  isAuthenticated: boolean;
  lastSeen: Date;
}

export class ExtensionWebSocketServer {
  private wss: WebSocketServer;
  private connections: Map<string, ExtensionConnection> = new Map();
  private commandSigner: CommandSigner;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/extension-ws',
      verifyClient: (info: any) => {
        // Basic verification - could add more sophisticated checks
        return true;
      }
    });

    this.commandSigner = new CommandSigner();
    this.setupWebSocketServer();
    
    console.log('Extension WebSocket server initialized on /extension-ws');
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws, request) => {
      console.log('New extension connection attempt');

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection(ws);
      });

      // Send initial ping to verify connection
      ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    });
  }

  private async handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'authenticate':
        await this.handleAuthentication(ws, message);
        break;

      case 'dashboard_connect':
        // Handle dashboard WebSocket connection
        console.log('Dashboard connected for user:', message.userId);
        break;

      case 'pong':
        this.handlePong(ws, message);
        break;

      case 'command_result':
        await this.handleCommandResult(message);
        break;

      case 'task_result':
        await this.handleTaskResult(message);
        break;

      case 'execute_task':
        await this.handleTaskExecution(ws, message);
        break;

      case 'heartbeat':
        this.handleHeartbeat(ws, message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private async handleAuthentication(ws: WebSocket, message: any) {
    const { extensionId, userId } = message;

    if (!extensionId || !userId) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Missing extensionId or userId'
      }));
      return;
    }

    // Verify the extension is paired with this user
    const pairings = await storage.getExtensionPairings(userId);
    const validPairing = pairings.find(p => 
      p.extensionId === extensionId && p.isActive
    );

    if (!validPairing) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Extension not paired with this user'
      }));
      return;
    }

    // Store connection
    const connectionId = `${userId}_${extensionId}`;
    this.connections.set(connectionId, {
      ws,
      extensionId,
      userId,
      isAuthenticated: true,
      lastSeen: new Date()
    });

    // Update last seen in storage
    await storage.updateExtensionLastSeen(validPairing.id);

    ws.send(JSON.stringify({
      type: 'auth_success',
      message: 'Extension authenticated successfully'
    }));

    console.log(`Extension authenticated: ${extensionId} for user ${userId}`);
  }

  private handlePong(ws: WebSocket, message: any) {
    // Update last seen for this connection
    const entries = Array.from(this.connections.entries());
    for (const [connectionId, connection] of entries) {
      if (connection.ws === ws) {
        connection.lastSeen = new Date();
        break;
      }
    }
  }

  private async handleCommandResult(message: any) {
    const { request_id, status, result, error } = message;

    if (!request_id) {
      console.warn('Command result missing request_id');
      return;
    }

    // Update command result in storage
    await storage.updateCommandResult(request_id, {
      status,
      result,
      error,
      executedAt: new Date().toISOString()
    });

    console.log(`Command result received: ${request_id} - ${status}`);
  }

  private handleHeartbeat(ws: WebSocket, message: any) {
    // Update connection last seen and respond
    const entries = Array.from(this.connections.entries());
    for (const [connectionId, connection] of entries) {
      if (connection.ws === ws) {
        connection.lastSeen = new Date();
        ws.send(JSON.stringify({
          type: 'heartbeat_ack',
          timestamp: new Date().toISOString()
        }));
        break;
      }
    }
  }

  private handleDisconnection(ws: WebSocket) {
    // Remove connection from active connections
    const entries = Array.from(this.connections.entries());
    for (const [connectionId, connection] of entries) {
      if (connection.ws === ws) {
        this.connections.delete(connectionId);
        console.log(`Extension disconnected: ${connectionId}`);
        break;
      }
    }
  }

  // Public methods for sending commands to extensions
  public async sendCommand(userId: string, command: any): Promise<boolean> {
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isAuthenticated);

    if (userConnections.length === 0) {
      console.warn(`No active extensions for user: ${userId}`);
      return false;
    }

    // Sign the command
    const signedCommand = this.commandSigner.signCommand(command);

    // Send to all user's extensions
    const promises = userConnections.map(connection => {
      return new Promise<boolean>((resolve) => {
        try {
          connection.ws.send(JSON.stringify({
            type: 'command',
            signed_command: signedCommand
          }));
          resolve(true);
        } catch (error) {
          console.error('Error sending command:', error);
          resolve(false);
        }
      });
    });

    const results = await Promise.all(promises);
    return results.some(success => success);
  }

  public async broadcastToExtensions(message: any): Promise<void> {
    const activeConnections = Array.from(this.connections.values())
      .filter(conn => conn.isAuthenticated);

    const promises = activeConnections.map(connection => {
      return new Promise<void>((resolve) => {
        try {
          connection.ws.send(JSON.stringify(message));
          resolve();
        } catch (error) {
          console.error('Error broadcasting message:', error);
          resolve();
        }
      });
    });

    await Promise.all(promises);
  }

  public getActiveConnections(): ExtensionConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.isAuthenticated);
  }

  public getUserConnections(userId: string): ExtensionConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isAuthenticated);
  }

  public isUserConnected(userId: string): boolean {
    return this.getUserConnections(userId).length > 0;
  }

  // Cleanup inactive connections
  private startCleanupTimer() {
    setInterval(() => {
      const now = new Date();
      const timeout = 5 * 60 * 1000; // 5 minutes

      const entries = Array.from(this.connections.entries());
      for (const [connectionId, connection] of entries) {
        if (now.getTime() - connection.lastSeen.getTime() > timeout) {
          console.log(`Cleaning up inactive connection: ${connectionId}`);
          connection.ws.terminate();
          this.connections.delete(connectionId);
        }
      }
    }, 60 * 1000); // Check every minute
  }

  private async handleTaskExecution(ws: WebSocket, message: any) {
    try {
      const { agentType, action, taskId } = message;
      
      console.log(`Executing task ${taskId} for agent ${agentType}: ${action}`);
      
      // Forward task to browser extension for actual execution
      const signedTask = this.commandSigner.signCommand({
        request_id: `task-${taskId}`,
        agent_id: agentType,
        capability: action,
        args: { timestamp: new Date().toISOString() }
      });

      ws.send(JSON.stringify({
        type: 'execute_task',
        signed_task: signedTask
      }));
      
    } catch (error) {
      console.error('Error handling task execution:', error);
    }
  }

  private async handleTaskResult(message: any) {
    try {
      const { taskId, success, result, error, userId, agentType } = message;
      
      console.log(`Task ${taskId} result:`, {
        success,
        result: success ? result : error,
        userId,
        agentType
      });

      // Broadcast task completion to dashboard
      await this.broadcastToExtensions({
        type: 'task_completed',
        taskId,
        success,
        result: success ? result : error,
        agentType,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling task result:', error);
    }
  }
}