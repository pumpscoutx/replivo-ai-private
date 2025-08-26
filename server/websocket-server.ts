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
        // Handle dashboard WebSocket connection - auto-authenticate for demo
        const { userId } = message;
        console.log('Dashboard connected for user:', userId);
        
        if (userId) {
          // Create a temporary connection for demo purposes
          const connectionId = `${userId}_demo_extension`;
          this.connections.set(connectionId, {
            ws,
            userId: userId,
            extensionId: 'demo_extension',
            isAuthenticated: true,
            lastSeen: new Date()
          });
          
          // Send auth success
          ws.send(JSON.stringify({
            type: 'auth_success',
            userId: userId,
            connectionId: connectionId
          }));
          
          console.log(`Dashboard authenticated for user: ${userId}`);
        }
        break;

      case 'pong':
        this.handlePong(ws, message);
        break;

      case 'command_result':
        await this.handleCommandResult(message);
        break;

      case 'ai_task_completed':
        await this.handleAITaskCompleted(message);
        break;

      case 'ai_task_failed':
        await this.handleAITaskFailed(message);
        break;

      case 'page_context_update':
        await this.handlePageContextUpdate(message);
        break;

      case 'smart_element_found':
        await this.handleSmartElementFound(message);
        break;

      case 'automation_opportunity':
        await this.handleAutomationOpportunity(message);
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

    // Broadcast to dashboards for live timeline updates
    await this.broadcastToExtensions({
      type: 'command_result',
      request_id,
      status,
      result,
      error,
      timestamp: new Date().toISOString()
    });
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

  // Enhanced AI task handling methods
  private async handleAITaskCompleted(message: any) {
    try {
      const { taskId, result, context, executionTime } = message;
      
      console.log(`AI Task ${taskId} completed in ${executionTime}ms`);
      
      // Store task result for analytics
      await storage.storeTaskResult({
        taskId,
        status: 'completed',
        result,
        context,
        executionTime,
        completedAt: new Date().toISOString()
      });

      // Broadcast to all connected dashboards
      await this.broadcastToExtensions({
        type: 'ai_task_completed',
        taskId,
        result,
        executionTime,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling AI task completion:', error);
    }
  }

  private async handleAITaskFailed(message: any) {
    try {
      const { taskId, error, context } = message;
      
      console.log(`AI Task ${taskId} failed:`, error);
      
      // Store failure for learning and debugging
      await storage.storeTaskResult({
        taskId,
        status: 'failed',
        error,
        context,
        failedAt: new Date().toISOString()
      });

      // Broadcast failure to dashboards
      await this.broadcastToExtensions({
        type: 'ai_task_failed',
        taskId,
        error,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling AI task failure:', error);
    }
  }

  private async handlePageContextUpdate(message: any) {
    try {
      const { tabId, url, context, timestamp } = message;
      
      console.log(`Page context updated for tab ${tabId}: ${url}`);
      
      // Store context for AI learning
      await storage.storePageContext({
        tabId,
        url,
        context,
        timestamp
      });

      // Send context analysis back to extension if needed
      const intelligence = await this.analyzePageForAutomation(context);
      
      if (intelligence.opportunities.length > 0) {
        // Find the connection for this context update
        const connections = Array.from(this.connections.values());
        const relevantConnection = connections.find(conn => 
          conn.ws.readyState === WebSocket.OPEN
        );

        if (relevantConnection) {
          relevantConnection.ws.send(JSON.stringify({
            type: 'automation_suggestions',
            tabId,
            intelligence,
            timestamp: new Date().toISOString()
          }));
        }
      }

    } catch (error) {
      console.error('Error handling page context update:', error);
    }
  }

  private async handleSmartElementFound(message: any) {
    try {
      const { elementDescription, strategy, confidence, selector } = message;
      
      console.log(`Smart element found: ${elementDescription} (${strategy}, ${confidence})`);
      
      // Store element discovery for improving AI models
      await storage.storeElementDiscovery({
        description: elementDescription,
        strategy,
        confidence,
        selector,
        discoveredAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling smart element discovery:', error);
    }
  }

  private async handleAutomationOpportunity(message: any) {
    try {
      const { opportunity, pageContext, confidence } = message;
      
      console.log(`Automation opportunity detected:`, opportunity);
      
      // Store opportunity for user suggestions
      await storage.storeAutomationOpportunity({
        type: opportunity.type,
        description: opportunity.description,
        actions: opportunity.actions,
        pageContext,
        confidence,
        detectedAt: new Date().toISOString()
      });

      // Broadcast to dashboards for user notification
      await this.broadcastToExtensions({
        type: 'automation_opportunity_detected',
        opportunity,
        confidence,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error handling automation opportunity:', error);
    }
  }

  private async analyzePageForAutomation(context: any): Promise<{
    opportunities: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    suggestions: string[];
  }> {
    const opportunities = [];
    const suggestions = [];

    // Analyze based on page type and available elements
    if (context.pageType === 'gmail' && context.isLoggedIn) {
      opportunities.push({
        type: 'email_automation',
        description: 'Email composition and management',
        confidence: 0.9
      });
      suggestions.push('Compose and send emails automatically');
    }

    if (context.forms && context.forms.length > 0) {
      opportunities.push({
        type: 'form_automation',
        description: 'Form filling and submission',
        confidence: 0.8
      });
      suggestions.push('Fill forms with saved data');
    }

    if (context.buttons && context.buttons.filter((b: any) => b.visible).length > 3) {
      opportunities.push({
        type: 'workflow_automation',
        description: 'Multi-step workflow execution',
        confidence: 0.75
      });
      suggestions.push('Automate repetitive button clicking workflows');
    }

    return { opportunities, suggestions };
  }

  // Enhanced command sending with AI capabilities
  public async sendAICommand(userId: string, aiCommand: any): Promise<boolean> {
    const userConnections = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId && conn.isAuthenticated);

    if (userConnections.length === 0) {
      console.warn(`No active extensions for user: ${userId}`);
      return false;
    }

    // Enhanced command with AI metadata
    const enhancedCommand = {
      ...aiCommand,
      ai_enhanced: true,
      sent_at: new Date().toISOString(),
      user_id: userId
    };

    // Sign the enhanced command
    const signedCommand = this.commandSigner.signCommand(enhancedCommand);

    // Send to all user's extensions
    const promises = userConnections.map(connection => {
      return new Promise<boolean>((resolve) => {
        try {
          connection.ws.send(JSON.stringify({
            type: 'ai_command',
            signed_command: signedCommand
          }));
          resolve(true);
        } catch (error) {
          console.error('Error sending AI command:', error);
          resolve(false);
        }
      });
    });

    const results = await Promise.all(promises);
    return results.some(success => success);
  }
}