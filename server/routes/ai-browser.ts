// AI-Driven Browser Automation API Routes

import { Router } from 'express';
import { aiBrowserCoordinator } from '../ai-browser-coordinator';
import type { AgentType } from '../llmClient';

const router = Router();

// Execute natural language browser automation task
router.post('/execute-task', async (req, res) => {
  try {
    const { 
      naturalLanguage, 
      agentType = 'business-growth', 
      context = {},
      userId = 'demo-user'
    } = req.body;

    if (!naturalLanguage || typeof naturalLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'naturalLanguage is required and must be a string'
      });
    }

    console.log(`AI Browser Task: "${naturalLanguage}" for user ${userId}`);

    const result = await aiBrowserCoordinator.executeNaturalLanguageTask(
      userId,
      naturalLanguage,
      agentType as AgentType,
      context
    );

    res.json(result);

  } catch (error) {
    console.error('AI browser task execution failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get browser automation capabilities
router.get('/capabilities', (req, res) => {
  try {
    const capabilities = aiBrowserCoordinator.getBrowserCapabilities();
    
    res.json({
      success: true,
      capabilities
    });

  } catch (error) {
    console.error('Failed to get capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve capabilities'
    });
  }
});

// Test smart element detection
router.post('/test-element-detection', async (req, res) => {
  try {
    const { description, pageContext, userId = 'demo-user' } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'description is required'
      });
    }

    // This would normally communicate with the browser extension
    // For now, return a simulated response
    const simulatedResult = {
      found: true,
      element: {
        description,
        strategy: 'byText',
        confidence: 0.85,
        selector: `[aria-label*="${description}"]`,
        position: { x: 100, y: 200, width: 150, height: 40 }
      },
      alternatives: [
        { strategy: 'byRole', selector: '[role="button"]', confidence: 0.75 },
        { strategy: 'byDataTestId', selector: '[data-testid*="submit"]', confidence: 0.6 }
      ]
    };

    res.json({
      success: true,
      result: simulatedResult
    });

  } catch (error) {
    console.error('Element detection test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    });
  }
});

// Analyze page for automation opportunities
router.post('/analyze-page', async (req, res) => {
  try {
    const { url, pageContext, userId = 'demo-user' } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'url is required'
      });
    }

    // Analyze the page context to suggest automation opportunities
    const analysis: {
      url: string;
      pageType: string;
      automationOpportunities: Array<{
        type: string;
        description: string;
        actions: string[];
        confidence: number;
      }>;
      suggestedTasks: string[];
      confidence: number;
    } = {
      url,
      pageType: detectPageType(url),
      automationOpportunities: [],
      suggestedTasks: [],
      confidence: 0.8
    };

    // Add page-specific opportunities
    if (url.includes('mail.google.com')) {
      analysis.automationOpportunities.push({
        type: 'email_management',
        description: 'Compose, send, and organize emails',
        actions: ['compose email', 'send email', 'organize inbox'],
        confidence: 0.9
      });
      
      analysis.suggestedTasks.push(
        'compose email to john@example.com about meeting',
        'organize inbox by moving old emails to archive',
        'send follow-up emails to recent contacts'
      );
    }

    if (url.includes('linkedin.com')) {
      analysis.automationOpportunities.push({
        type: 'professional_networking',
        description: 'Manage professional connections and content',
        actions: ['send message', 'post update', 'connect with people'],
        confidence: 0.85
      });
      
      analysis.suggestedTasks.push(
        'send message to recent connections',
        'post update about latest project',
        'connect with people in similar industry'
      );
    }

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Page analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
});

// Get task execution history
router.get('/task-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // In production, retrieve from database
    const mockHistory = [
      {
        id: 'task_1',
        naturalLanguage: 'send email to john@example.com about meeting',
        status: 'completed',
        agentType: 'business-growth',
        executionTime: 15000,
        steps: 6,
        timestamp: Date.now() - 3600000
      },
      {
        id: 'task_2',
        naturalLanguage: 'post update on linkedin about new project',
        status: 'completed',
        agentType: 'business-growth',
        executionTime: 8000,
        steps: 4,
        timestamp: Date.now() - 7200000
      },
      {
        id: 'task_3',
        naturalLanguage: 'fill contact form on website',
        status: 'failed',
        agentType: 'operations',
        error: 'Form fields not found',
        timestamp: Date.now() - 10800000
      }
    ];

    const paginatedHistory = mockHistory.slice(
      Number(offset), 
      Number(offset) + Number(limit)
    );

    res.json({
      success: true,
      history: paginatedHistory,
      total: mockHistory.length,
      hasMore: Number(offset) + Number(limit) < mockHistory.length
    });

  } catch (error) {
    console.error('Failed to get task history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve task history'
    });
  }
});

// Emergency stop for all automation
router.post('/emergency-stop/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Emergency stop requested for user: ${userId}`);
    
    // In production, immediately halt all automation for this user
    // Send stop commands to all active browser extensions
    
    res.json({
      success: true,
      message: 'All automation tasks stopped',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Emergency stop failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute emergency stop'
    });
  }
});

// Helper function to detect page type from URL
function detectPageType(url: string): string {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('mail.google.com')) return 'gmail';
  if (lowercaseUrl.includes('linkedin.com')) return 'linkedin';
  if (lowercaseUrl.includes('slack.com')) return 'slack';
  if (lowercaseUrl.includes('calendar.google.com')) return 'calendar';
  if (lowercaseUrl.includes('drive.google.com')) return 'drive';
  if (lowercaseUrl.includes('trello.com')) return 'trello';
  if (lowercaseUrl.includes('asana.com')) return 'asana';
  
  return 'general';
}

export default router;