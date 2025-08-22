// Configuration for the Replivo Helper Extension
// This file handles dynamic URL detection for different environments

function getBaseUrl() {
  // Try to get the Replit URL from the current context
  if (typeof window !== 'undefined' && window.location.origin.includes('replit')) {
    return window.location.origin;
  }
  
  // For extension context, try to determine from tab URL
  return chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url.includes('replit')) {
      const url = new URL(activeTab.url);
      return url.origin;
    }
    return 'http://localhost:5000'; // Fallback for local development
  });
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getBaseUrl };
} else if (typeof window !== 'undefined') {
  window.ReplicoConfig = { getBaseUrl };
}