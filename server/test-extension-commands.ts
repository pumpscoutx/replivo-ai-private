// Test script for demonstrating browser extension commands
import { ExtensionWebSocketServer } from './websocket-server';
import { storage } from './storage';

export class ExtensionTestCommands {
  constructor(private wsServer: ExtensionWebSocketServer) {}

  // Test form filling capability
  async testFormFilling(userId: string) {
    const command = {
      request_id: `test-form-${Date.now()}`,
      agent_id: 'customer_success_manager',
      capability: 'fill_form',
      args: {
        selectors: {
          'customer-name': '#customer-name',
          'customer-email': '#customer-email',
          'issue-type': '#issue-type',
          'issue-description': '#issue-description',
          'priority': '#priority'
        },
        values: {
          'customer-name': 'Sarah Johnson',
          'customer-email': 'sarah.johnson@example.com',
          'issue-type': 'billing',
          'issue-description': 'Customer requesting refund for order #ORD-78901 due to billing error.',
          'priority': 'high'
        },
        submit: false
      },
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    };

    console.log('Sending form filling command...');
    const success = await this.wsServer.sendCommand(userId, command);
    
    if (success) {
      // Log the command in storage
      await storage.createCommandLog({
        requestId: command.request_id,
        userId,
        agentId: command.agent_id,
        capability: command.capability,
        args: command.args as any,
        status: 'sent',
        signature: ''
      });
      console.log('Form filling command sent successfully');
    } else {
      console.log('Failed to send form filling command - no active extensions');
    }

    return success;
  }

  // Test content extraction capability
  async testContentExtraction(userId: string) {
    const command = {
      request_id: `test-extract-${Date.now()}`,
      agent_id: 'data_analyst',
      capability: 'extract_content',
      args: {
        selectors: {
          customerName: '#display-name',
          accountId: '#account-id',
          accountStatus: '#account-status',
          orderNumber: '#order-number',
          orderAmount: '#order-amount',
          orderStatus: '#order-status'
        },
        includeText: true,
        includeAttributes: ['id', 'class']
      },
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    console.log('Sending content extraction command...');
    const success = await this.wsServer.sendCommand(userId, command);
    
    if (success) {
      await storage.createCommandLog({
        requestId: command.request_id,
        userId,
        agentId: command.agent_id,
        capability: command.capability,
        args: command.args as any,
        status: 'sent',
        signature: ''
      });
      console.log('Content extraction command sent successfully');
    } else {
      console.log('Failed to send content extraction command - no active extensions');
    }

    return success;
  }

  // Test element clicking capability
  async testElementClicking(userId: string) {
    const command = {
      request_id: `test-click-${Date.now()}`,
      agent_id: 'customer_success_manager',
      capability: 'click_selector',
      args: {
        selector: '#action-approve',
        waitFor: 1000,
        scrollIntoView: true
      },
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    console.log('Sending click command...');
    const success = await this.wsServer.sendCommand(userId, command);
    
    if (success) {
      await storage.createCommandLog({
        requestId: command.request_id,
        userId,
        agentId: command.agent_id,
        capability: command.capability,
        args: command.args as any,
        status: 'sent',
        signature: ''
      });
      console.log('Click command sent successfully');
    } else {
      console.log('Failed to send click command - no active extensions');
    }

    return success;
  }

  // Test page navigation capability
  async testNavigation(userId: string, url: string) {
    const command = {
      request_id: `test-nav-${Date.now()}`,
      agent_id: 'general_assistant',
      capability: 'open_url',
      args: {
        url,
        focus: true
      },
      expiry: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    console.log(`Sending navigation command to: ${url}`);
    const success = await this.wsServer.sendCommand(userId, command);
    
    if (success) {
      await storage.createCommandLog({
        requestId: command.request_id,
        userId,
        agentId: command.agent_id,
        capability: command.capability,
        args: command.args as any,
        status: 'sent',
        signature: ''
      });
      console.log('Navigation command sent successfully');
    } else {
      console.log('Failed to send navigation command - no active extensions');
    }

    return success;
  }

  // Test comprehensive customer service workflow
  async testCustomerServiceWorkflow(userId: string) {
    console.log('Starting customer service workflow simulation...');
    
    // Step 1: Extract customer information
    await this.testContentExtraction(userId);
    
    // Wait a bit between commands
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Fill support form with extracted data
    await this.testFormFilling(userId);
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Approve the refund request
    await this.testElementClicking(userId);
    
    console.log('Customer service workflow completed');
  }

  // Get command execution status
  async getCommandStatus(userId: string) {
    const commands = await storage.getCommandLog(userId, 10);
    return commands.map(cmd => ({
      requestId: cmd.requestId,
      capability: cmd.capability,
      status: cmd.status,
      createdAt: cmd.createdAt,
      executedAt: cmd.executedAt,
      result: cmd.result
    }));
  }

  // Check if user has active extensions
  isUserConnected(userId: string): boolean {
    return this.wsServer.isUserConnected(userId);
  }

  // Get active extension connections for a user
  getUserConnections(userId: string) {
    return this.wsServer.getUserConnections(userId).map(conn => ({
      extensionId: conn.extensionId,
      lastSeen: conn.lastSeen,
      isAuthenticated: conn.isAuthenticated
    }));
  }
}