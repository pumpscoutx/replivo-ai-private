// Replivo Helper Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    loading: document.getElementById('loading'),
    notPaired: document.getElementById('not-paired'),
    paired: document.getElementById('paired'),
    error: document.getElementById('error'),
    pairingCode: document.getElementById('pairing-code'),
    pairButton: document.getElementById('pair-button'),
    pairingError: document.getElementById('pairing-error'),
    pairedUser: document.getElementById('paired-user'),
    pairedTime: document.getElementById('paired-time'),
    openDashboard: document.getElementById('open-dashboard'),
    disconnectButton: document.getElementById('disconnect-button'),
    retryButton: document.getElementById('retry-button')
  };

  // Initialize popup
  initializePopup();

  // Event listeners
  elements.pairButton.addEventListener('click', handlePairing);
  elements.disconnectButton.addEventListener('click', handleDisconnect);
  elements.openDashboard.addEventListener('click', openDashboard);
  elements.retryButton.addEventListener('click', initializePopup);

  // Enter key handling for pairing code
  elements.pairingCode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handlePairing();
    }
  });

  // Auto-format pairing code as user types
  elements.pairingCode.addEventListener('input', (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    e.target.value = value;
    
    // Clear any previous errors
    hideError();
  });

  async function initializePopup() {
    showState('loading');
    
    try {
      // Get current status from background script
      const status = await sendMessage({ type: 'GET_STATUS' });
      
      if (status.isAuthenticated && status.pairedAccount) {
        showPairedState(status);
      } else {
        showState('notPaired');
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
      showState('error');
    }
  }

  async function handlePairing() {
    const code = elements.pairingCode.value.trim();
    
    if (!code) {
      showError('Please enter a pairing code');
      return;
    }

    if (code.length < 6) {
      showError('Pairing code must be at least 6 characters');
      return;
    }

    elements.pairButton.disabled = true;
    elements.pairButton.textContent = 'Connecting...';
    hideError();

    try {
      const result = await sendMessage({ 
        type: 'PAIR_EXTENSION', 
        code 
      });

      if (result.success) {
        showSuccess('Successfully connected!');
        setTimeout(() => {
          showPairedState({ 
            pairedAccount: result.userId,
            isAuthenticated: true 
          });
        }, 1000);
      } else {
        showError(result.error || 'Pairing failed');
      }
    } catch (error) {
      console.error('Pairing error:', error);
      showError('Connection failed. Please try again.');
    } finally {
      elements.pairButton.disabled = false;
      elements.pairButton.textContent = 'Connect to Replivo';
    }
  }

  async function handleDisconnect() {
    elements.disconnectButton.disabled = true;
    elements.disconnectButton.textContent = 'Disconnecting...';

    try {
      await sendMessage({ type: 'DISCONNECT' });
      showState('notPaired');
      elements.pairingCode.value = '';
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      elements.disconnectButton.disabled = false;
      elements.disconnectButton.textContent = 'Disconnect';
    }
  }

  async function openDashboard() {
    // Get the current Replit URL
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const activeTab = tabs[0];
      let dashboardUrl = 'http://localhost:5000/'; // fallback
      
      if (activeTab && activeTab.url.includes('replit')) {
        const url = new URL(activeTab.url);
        dashboardUrl = url.origin + '/';
      }
      
      chrome.tabs.create({ url: dashboardUrl });
    } catch (error) {
      chrome.tabs.create({ url: 'http://localhost:5000/' });
    }
    window.close();
  }

  function showPairedState(status) {
    elements.pairedUser.textContent = `Connected to ${status.pairedAccount || 'account'}`;
    elements.pairedTime.textContent = `Last seen: ${new Date().toLocaleTimeString()}`;
    showState('paired');
  }

  function showState(state) {
    // Hide all states
    elements.loading.classList.add('hidden');
    elements.notPaired.classList.add('hidden');
    elements.paired.classList.add('hidden');
    elements.error.classList.add('hidden');

    // Show requested state
    switch (state) {
      case 'loading':
        elements.loading.classList.remove('hidden');
        break;
      case 'notPaired':
        elements.notPaired.classList.remove('hidden');
        break;
      case 'paired':
        elements.paired.classList.remove('hidden');
        break;
      case 'error':
        elements.error.classList.remove('hidden');
        break;
    }
  }

  function showError(message) {
    elements.pairingError.textContent = message;
    elements.pairingError.classList.remove('hidden');
  }

  function hideError() {
    elements.pairingError.classList.add('hidden');
  }

  function showSuccess(message) {
    elements.pairingError.textContent = message;
    elements.pairingError.className = 'success-text';
    elements.pairingError.classList.remove('hidden');
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
});