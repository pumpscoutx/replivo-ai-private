// Replivo Helper Content Script
(function() {
  'use strict';

  // Prevent multiple injections
  if (window.replivoHelperInjected) {
    return;
  }
  window.replivoHelperInjected = true;

  console.log('Replivo Helper content script loaded');

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'EXECUTE_COMMAND':
        executeCommand(message.command)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response

      case 'CHECK_PAGE_READY':
        sendResponse({ 
          ready: document.readyState === 'complete',
          url: window.location.href,
          title: document.title
        });
        break;

      case 'HIGHLIGHT_ELEMENT':
        highlightElement(message.selector);
        sendResponse({ success: true });
        break;

      default:
        console.warn('Unknown content script message:', message.type);
    }
  });

  // Command execution functions
  async function executeCommand(command) {
    const { capability, args } = command;

    switch (capability) {
      case 'fill_form':
        return fillForm(args);
      
      case 'click_selector':
        return clickElement(args);
      
      case 'extract_content':
        return extractContent(args);
      
      case 'wait_for_element':
        return waitForElement(args);
      
      case 'scroll_to_element':
        return scrollToElement(args);
      
      case 'get_page_info':
        return getPageInfo();
      
      default:
        throw new Error(`Unknown capability: ${capability}`);
    }
  }

  function fillForm(args) {
    const { selectors, values, submit = false } = args;
    const results = {};

    for (const [field, selector] of Object.entries(selectors)) {
      const element = document.querySelector(selector);
      
      if (element) {
        const value = values[field] || '';
        
        // Handle different input types
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = Boolean(value);
        } else {
          element.value = value;
        }
        
        // Trigger events to notify frameworks
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));
        
        results[field] = {
          status: 'filled',
          value: element.value,
          type: element.type
        };
      } else {
        results[field] = {
          status: 'not_found',
          selector
        };
      }
    }

    // Submit form if requested
    if (submit) {
      const submitSelector = selectors.submitBtn || 'input[type="submit"], button[type="submit"]';
      const submitButton = document.querySelector(submitSelector);
      
      if (submitButton) {
        submitButton.click();
        results.submitted = true;
      } else {
        // Try to find and submit the parent form
        const form = document.querySelector('form');
        if (form) {
          form.submit();
          results.submitted = true;
        } else {
          results.submitted = false;
          results.submitError = 'No submit button or form found';
        }
      }
    }

    return results;
  }

  function clickElement(args) {
    const { selector, waitFor = 0, scrollIntoView = true } = args;
    
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      
      if (!element) {
        reject(new Error(`Element not found: ${selector}`));
        return;
      }

      // Scroll element into view if requested
      if (scrollIntoView) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }

      const clickAction = () => {
        // Check if element is still visible and clickable
        const rect = element.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (!isVisible) {
          reject(new Error('Element is not visible'));
          return;
        }

        element.click();
        
        resolve({
          clicked: true,
          element: selector,
          tagName: element.tagName,
          text: element.textContent?.slice(0, 100),
          location: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        });
      };

      if (waitFor > 0) {
        setTimeout(clickAction, waitFor);
      } else {
        clickAction();
      }
    });
  }

  function extractContent(args) {
    const { selectors, includeText = true, includeAttributes = [], includeStyles = false } = args;
    const results = {};

    for (const [key, selector] of Object.entries(selectors)) {
      const elements = document.querySelectorAll(selector);
      
      if (elements.length === 0) {
        results[key] = null;
        continue;
      }

      const extractedData = Array.from(elements).map(element => {
        const data = {};

        if (includeText) {
          data.text = element.textContent?.trim();
          data.innerHTML = element.innerHTML;
        }

        // Extract specific attributes
        for (const attr of includeAttributes) {
          data[attr] = element.getAttribute(attr);
        }

        // Extract computed styles if requested
        if (includeStyles) {
          const styles = window.getComputedStyle(element);
          data.styles = {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            position: styles.position
          };
        }

        // Include element position
        const rect = element.getBoundingClientRect();
        data.position = {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        };

        return data;
      });

      results[key] = elements.length === 1 ? extractedData[0] : extractedData;
    }

    return results;
  }

  function waitForElement(args) {
    const { selector, timeout = 10000, visible = true } = args;
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        
        if (element) {
          if (!visible) {
            resolve({ found: true, element: selector });
            return;
          }
          
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          
          if (isVisible) {
            resolve({ 
              found: true, 
              element: selector,
              position: {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
              }
            });
            return;
          }
        }
        
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Element not found within ${timeout}ms: ${selector}`));
          return;
        }
        
        setTimeout(checkElement, 100);
      };
      
      checkElement();
    });
  }

  function scrollToElement(args) {
    const { selector, behavior = 'smooth', block = 'center' } = args;
    
    const element = document.querySelector(selector);
    
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    
    element.scrollIntoView({ behavior, block });
    
    const rect = element.getBoundingClientRect();
    return {
      scrolled: true,
      element: selector,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      }
    };
  }

  function getPageInfo() {
    return {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      },
      forms: Array.from(document.forms).map((form, index) => ({
        index,
        action: form.action,
        method: form.method,
        elements: form.elements.length
      }))
    };
  }

  function highlightElement(selector) {
    // Remove existing highlights
    document.querySelectorAll('.replivo-highlight').forEach(el => {
      el.classList.remove('replivo-highlight');
    });

    const element = document.querySelector(selector);
    if (element) {
      // Add highlight styles
      if (!document.getElementById('replivo-highlight-styles')) {
        const style = document.createElement('style');
        style.id = 'replivo-highlight-styles';
        style.textContent = `
          .replivo-highlight {
            outline: 3px solid #3b82f6 !important;
            outline-offset: 2px !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
            transition: all 0.3s ease !important;
          }
        `;
        document.head.appendChild(style);
      }

      element.classList.add('replivo-highlight');
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        element.classList.remove('replivo-highlight');
      }, 3000);
    }
  }

  // Page monitoring for dynamic content
  let lastUrl = window.location.href;
  
  function checkForNavigation() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      
      // Notify background script of navigation
      chrome.runtime.sendMessage({
        type: 'PAGE_NAVIGATION',
        url: lastUrl,
        title: document.title
      });
    }
  }

  // Monitor for navigation changes
  setInterval(checkForNavigation, 1000);

  // Monitor for DOM changes
  const observer = new MutationObserver((mutations) => {
    // Debounce DOM change notifications
    clearTimeout(window.replivoDomChangeTimeout);
    window.replivoDomChangeTimeout = setTimeout(() => {
      chrome.runtime.sendMessage({
        type: 'DOM_CHANGED',
        url: window.location.href,
        mutations: mutations.length
      });
    }, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });

  console.log('Replivo Helper content script initialized');
})();