// Replivo Helper Background Service Worker
let wsConnection = null;
let pairedAccount = null;
let isAuthenticated = false;

// Extension installation and setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Replivo Helper installed');
});

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'PAIR_EXTENSION':
      handlePairing(message.code)
        .then(result => {
          sendResponse(result);
          // Update popup if it's open by broadcasting status change
          broadcastStatusUpdate();
        })
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep channel open for async response

    case 'GET_STATUS':
      sendResponse({
        isAuthenticated,
        pairedAccount,
        connectionStatus: wsConnection ? wsConnection.readyState : 'disconnected',
        wsConnected: wsConnection && wsConnection.readyState === WebSocket.OPEN
      });
      break;

    case 'DISCONNECT':
      handleDisconnect();
      sendResponse({ success: true });
      break;

    case 'EXECUTE_COMMAND':
      executeCommand(message.command, sender.tab)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'START_AGENT_WORK':
      handleAgentStartWork(message.userId);
      sendResponse({ success: true });
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Get the current Replit URL dynamically
async function getReplicaUrl() {
  // First, try stored URL
  try {
    const data = await chrome.storage.local.get(['lastReplicaUrl']);
    if (data.lastReplicaUrl) {
      console.log('Using stored Replit URL:', data.lastReplicaUrl);
      return data.lastReplicaUrl;
    }
  } catch (error) {
    console.log('No stored URL found');
  }

  // Try to detect from active tab
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activeTab = tabs[0];
    if (activeTab && (activeTab.url.includes('replit') || activeTab.url.includes('.dev') || activeTab.url.includes('repl.co'))) {
      const url = new URL(activeTab.url);
      console.log('Detected Replit URL:', url.origin);
      await chrome.storage.local.set({ lastReplicaUrl: url.origin });
      return url.origin;
    }
  } catch (error) {
    console.log('Could not get active tab, using fallback');
  }
  
  // Test known working URLs - get current Replit URL dynamically  
  const testUrls = [
    'http://localhost:5000'  // Start with localhost for development
  ];
  
  for (const testUrl of testUrls) {
    try {
      console.log('Testing URL:', testUrl);
      const response = await fetch(`${testUrl}/api/agents/featured`, {
        method: 'GET',
        mode: 'cors'
      });
      if (response.ok) {
        console.log('Found working URL:', testUrl);
        await chrome.storage.local.set({ lastReplicaUrl: testUrl });
        
        // Automatically scan for browser tools after connecting
        scanBrowserTools(testUrl);
        
        return testUrl;
      }
    } catch (e) {
      console.log(`Failed to connect to ${testUrl}:`, e.message);
      continue;
    }
  }
  
  return 'http://localhost:5000'; // Fallback for local development
}

// Extension pairing flow
async function handlePairing(code) {
  try {
    const baseUrl = await getReplicaUrl();
    console.log('Pairing with base URL:', baseUrl);
    
    // Store the URL for future use
    await chrome.storage.local.set({ lastReplicaUrl: baseUrl });
    
    const response = await fetch(`${baseUrl}/api/extension/pair`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        code, 
        extensionId: chrome.runtime.id 
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pairing response error:', response.status, errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Store account info
      pairedAccount = result.userId;
      await chrome.storage.local.set({ 
        pairedAccount: result.userId,
        lastPaired: Date.now()
      });

      // Connect WebSocket
      connectWebSocket();
      
      // Update icon to show connected state
      updateIcon('connected');
      
      return { success: true, userId: result.userId };
    } else {
      throw new Error(result.error || 'Pairing failed');
    }
  } catch (error) {
    console.error('Pairing error:', error);
    throw error;
  }
}

// Automatically scan browser for available tools
async function scanBrowserTools(baseUrl) {
  try {
    console.log('Scanning browser for available tools...');
    
    // Get all open tabs to detect services
    const tabs = await chrome.tabs.query({});
    const detectedTools = [];
    
    // Common services to check for
    const services = [
      { name: 'Gmail', domain: 'mail.google.com', permissions: ['email:send', 'email:read'] },
      { name: 'Google Calendar', domain: 'calendar.google.com', permissions: ['calendar:create', 'calendar:read'] },
      { name: 'Google Drive', domain: 'drive.google.com', permissions: ['file:read', 'file:write'] },
      { name: 'LinkedIn', domain: 'linkedin.com', permissions: ['message:send', 'profile:read'] },
      { name: 'Slack', domain: 'slack.com', permissions: ['message:send', 'channel:read'] },
      { name: 'Trello', domain: 'trello.com', permissions: ['board:edit', 'card:create'] },
      { name: 'Asana', domain: 'asana.com', permissions: ['task:create', 'project:edit'] },
      { name: 'Salesforce', domain: 'salesforce.com', permissions: ['contact:edit', 'lead:create'] }
    ];
    
    // Check which services are open/logged in
    for (const service of services) {
      const serviceTabs = tabs.filter(tab => 
        tab.url && tab.url.includes(service.domain)
      );
      
      if (serviceTabs.length > 0) {
        detectedTools.push({
          name: service.name,
          category: service.name.includes('Google') ? 'productivity' : 
                   service.name === 'LinkedIn' ? 'social' : 'productivity',
          isLoggedIn: true, // If tab is open, assume logged in
          permissions: service.permissions
        });
      }
    }
    
    // Send detected tools to server
    if (detectedTools.length > 0) {
      await fetch(`${baseUrl}/api/device-tools/demo-user/browser-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools: detectedTools })
      });
      
      console.log('Detected browser tools:', detectedTools);
    }
    
  } catch (error) {
    console.error('Error scanning browser tools:', error);
  }
}

// WebSocket connection for real-time commands
async function connectWebSocket() {
  try {
    const baseUrl = await getReplicaUrl();
    let wsUrl;
    
    if (baseUrl.startsWith('https://')) {
      wsUrl = baseUrl.replace('https://', 'wss://') + '/extension-ws';
    } else if (baseUrl.startsWith('http://')) {
      wsUrl = baseUrl.replace('http://', 'ws://') + '/extension-ws';
    } else {
      // Fallback: assume http for localhost
      wsUrl = `ws://${baseUrl}/extension-ws`;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    wsConnection = new WebSocket(wsUrl);
    
    wsConnection.onopen = () => {
      console.log('Connected to Replivo orchestrator');
      isAuthenticated = true;
      
      // Send authentication
      wsConnection.send(JSON.stringify({
        type: 'authenticate',
        extensionId: chrome.runtime.id,
        userId: pairedAccount
      }));
      
      updateIcon('connected');
    };

    wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsConnection.onclose = () => {
      console.log('WebSocket connection closed');
      isAuthenticated = false;
      updateIcon('disconnected');
      
      // Attempt reconnection after delay
      setTimeout(() => {
        if (pairedAccount) {
          connectWebSocket();
        }
      }, 5000);
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      isAuthenticated = false;
      updateIcon('error');
    };

  } catch (error) {
    console.error('WebSocket connection failed:', error);
  }
}

// Handle incoming WebSocket messages
async function handleWebSocketMessage(message) {
  switch (message.type) {
    case 'auth_success':
      console.log('Authentication successful');
      break;

    case 'command':
      await handleSignedCommand(message.signed_command);
      break;

    case 'ping':
      wsConnection.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      console.warn('Unknown WebSocket message type:', message.type);
  }
}

// Execute signed commands from orchestrator
async function handleSignedCommand(signedCommand) {
  try {
    // Verify command signature (simplified for demo)
    const command = JSON.parse(atob(signedCommand.split('.')[1]));
    
    // Check expiry
    if (new Date(command.expiry) < new Date()) {
      throw new Error('Command expired');
    }

    // Execute command based on capability
    const result = await executeCapability(command);
    
    // Send result back to orchestrator
    wsConnection.send(JSON.stringify({
      type: 'command_result',
      request_id: command.request_id,
      status: 'success',
      result
    }));

  } catch (error) {
    console.error('Command execution failed:', error);
    
    wsConnection.send(JSON.stringify({
      type: 'command_result',
      request_id: command.request_id,
      status: 'failed',
      error: error.message
    }));
  }
}

// Execute specific capability
async function executeCapability(command) {
  const { capability, args } = command;

  switch (capability) {
    case 'open_url':
      return await openUrl(args);
    
    case 'compose_email':
      return await composeEmail(args);
    
    case 'fill_form':
      return await fillForm(args);
    
    case 'click_selector':
      return await clickSelector(args);
    
    case 'extract_content':
      return await extractContent(args);
    
    case 'take_screenshot':
      return await takeScreenshot(args);
    
    default:
      throw new Error(`Unknown capability: ${capability}`);
  }
}

// Capability implementations
async function openUrl(args) {
  const tab = await chrome.tabs.create({ url: args.url });
  return { tabId: tab.id, url: args.url };
}

async function composeEmail(args) {
  // Open Gmail compose window with pre-filled content
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(args.recipient)}&subject=${encodeURIComponent(args.subject)}&body=${encodeURIComponent(args.body)}`;
  const tab = await chrome.tabs.create({ url: gmailUrl });
  
  // Wait a moment for Gmail to load, then attempt to send
  setTimeout(async () => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Try to find and click the send button in Gmail
          const sendButtons = document.querySelectorAll('[data-tooltip="Send ⌘+Enter, Ctrl+Enter"], [aria-label*="Send"], [data-testid="send-button"], .T-I.J-J5-Ji.aoO.v7.T-I-atl.L3');
          if (sendButtons.length > 0) {
            sendButtons[0].click();
            return 'Email sent successfully';
          }
          return 'Gmail compose window opened - please review and send manually';
        }
      });
    } catch (error) {
      console.log('Could not auto-send email, user needs to send manually');
    }
  }, 3000);
  
  return { 
    tabId: tab.id, 
    recipient: args.recipient, 
    subject: args.subject,
    status: 'Email composed and ready to send'
  };
}

async function fillForm(args) {
  const tabId = args.tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id;
  
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: fillFormInPage,
    args: [args.selectors, args.values, args.submit]
  });
  
  return result[0].result;
}

async function clickSelector(args) {
  const tabId = args.tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id;
  
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: clickElementInPage,
    args: [args.selector, args.waitFor]
  });
  
  return result[0].result;
}

async function extractContent(args) {
  const tabId = args.tabId || (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id;
  
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: extractContentFromPage,
    args: [args.selectors, args.includeText, args.includeAttributes]
  });
  
  return result[0].result;
}

async function takeScreenshot(args) {
  const screenshot = await chrome.tabs.captureVisibleTab(null, {
    format: 'png',
    quality: args.quality || 90
  });
  
  return { screenshot, timestamp: new Date().toISOString() };
}

// Injected functions for page manipulation
function fillFormInPage(selectors, values, submit) {
  const results = {};
  
  for (const [field, selector] of Object.entries(selectors)) {
    const element = document.querySelector(selector);
    if (element) {
      element.value = values[field] || '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      results[field] = 'filled';
    } else {
      results[field] = 'not_found';
    }
  }
  
  if (submit && selectors.submitBtn) {
    const submitBtn = document.querySelector(selectors.submitBtn);
    if (submitBtn) {
      submitBtn.click();
      results.submitted = true;
    }
  }
  
  return results;
}

function clickElementInPage(selector, waitFor = 0) {
  const element = document.querySelector(selector);
  
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  if (waitFor > 0) {
    setTimeout(() => element.click(), waitFor);
  } else {
    element.click();
  }
  
  return { 
    clicked: true, 
    element: selector,
    tagName: element.tagName,
    text: element.textContent?.slice(0, 100)
  };
}

function extractContentFromPage(selectors, includeText = true, includeAttributes = []) {
  const results = {};
  
  for (const [key, selector] of Object.entries(selectors)) {
    const element = document.querySelector(selector);
    
    if (element) {
      const data = {};
      
      if (includeText) {
        data.text = element.textContent?.trim();
        data.innerHTML = element.innerHTML;
      }
      
      for (const attr of includeAttributes || []) {
        data[attr] = element.getAttribute(attr);
      }
      
      results[key] = data;
    } else {
      results[key] = null;
    }
  }
  
  return results;
}

// Utility functions
function updateIcon(status) {
  // Skip icon updates since we don't have custom icons
  console.log(`Status changed to: ${status}`);
}

function handleDisconnect() {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  
  isAuthenticated = false;
  pairedAccount = null;
  
  chrome.storage.local.clear();
  updateIcon('disconnected');
}

function showStatus() {
  chrome.action.openPopup();
}

// Broadcast status updates to popup and other parts of extension
function broadcastStatusUpdate() {
  // Force popup refresh if it's open
  chrome.runtime.sendMessage({
    type: 'STATUS_UPDATED',
    status: {
      isAuthenticated,
      pairedAccount,
      wsConnected: wsConnection && wsConnection.readyState === WebSocket.OPEN
    }
  }).catch(() => {
    // Popup might not be open, ignore error
  });
}

// Handle agent start work signal
async function handleAgentStartWork(userId) {
  console.log('Agent starting work for user:', userId);
  
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    // Send a signal to the server that the agent should start working
    wsConnection.send(JSON.stringify({
      type: 'agent_ready',
      userId: userId,
      message: 'Extension connected and ready for automation tasks'
    }));
    
    // Simulate some initial automation tasks
    setTimeout(() => {
      simulateAgentWork();
    }, 2000);
  }
}

// Simulate agent performing initial tasks
function simulateAgentWork() {
  console.log('Agent starting automated tasks...');
  
  // Example: Check current page and perform basic analysis
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          // Simple page analysis that an agent might do
          const pageInfo = {
            title: document.title,
            url: window.location.href,
            hasforms: document.forms.length > 0,
            hasInputs: document.querySelectorAll('input').length,
            links: document.links.length
          };
          
          console.log('Agent analyzed page:', pageInfo);
          return pageInfo;
        }
      }, (results) => {
        if (results && results[0]) {
          console.log('Agent page analysis complete:', results[0].result);
          
          // Send analysis back to server
          if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            wsConnection.send(JSON.stringify({
              type: 'agent_analysis',
              data: results[0].result,
              message: 'Page analysis completed successfully'
            }));
          }
        }
      });
    }
  });
}

// Load saved account on startup
chrome.runtime.onStartup.addListener(async () => {
  const data = await chrome.storage.local.get(['pairedAccount']);
  if (data.pairedAccount) {
    pairedAccount = data.pairedAccount;
    connectWebSocket();
  }
});