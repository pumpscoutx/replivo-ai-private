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
  try {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const activeTab = tabs[0];
    if (activeTab && activeTab.url.includes('replit')) {
      const url = new URL(activeTab.url);
      return url.origin;
    }
  } catch (error) {
    console.log('Could not get active tab, using fallback');
  }
  return 'http://localhost:5000'; // Fallback for local development
}

// Extension pairing flow
async function handlePairing(code) {
  try {
    const baseUrl = await getReplicaUrl();
    const response = await fetch(`${baseUrl}/api/extension/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        extensionId: chrome.runtime.id 
      })
    });

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

// WebSocket connection for real-time commands
async function connectWebSocket() {
  try {
    const baseUrl = await getReplicaUrl();
    const wsUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/extension-ws';
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