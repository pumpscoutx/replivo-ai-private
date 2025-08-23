// Replivo Helper Content Script - Enhanced AI-Driven Browser Automation
(function() {
  'use strict';

  // Prevent multiple injections
  if (window.replivoHelperInjected) {
    return;
  }
  window.replivoHelperInjected = true;

  console.log('Replivo Helper Enhanced AI content script loaded');

  // Smart Element Detection System
  class SmartElementFinder {
    constructor() {
      this.selectionStrategies = [
        'byDataTestId',
        'byAriaLabel', 
        'byPlaceholder',
        'byText',
        'byRole',
        'byPosition',
        'byContext'
      ];
    }

    // AI-generated smart element detection with fallback strategies
    findElement(description, context = {}) {
      console.log(`Finding element: ${description}`, context);
      
      // Try multiple strategies until one succeeds
      for (const strategy of this.selectionStrategies) {
        try {
          const element = this[strategy](description, context);
          if (element) {
            console.log(`Found element using ${strategy}:`, element);
            return element;
          }
        } catch (error) {
          console.log(`Strategy ${strategy} failed:`, error.message);
        }
      }
      
      throw new Error(`Could not find element: ${description}`);
    }

    byDataTestId(description) {
      // Look for test IDs that match the description
      const keywords = description.toLowerCase().split(' ');
      const testIdElements = document.querySelectorAll('[data-testid], [data-test], [data-cy]');
      
      for (const element of testIdElements) {
        const testId = (element.getAttribute('data-testid') || 
                       element.getAttribute('data-test') || 
                       element.getAttribute('data-cy') || '').toLowerCase();
        
        if (keywords.some(keyword => testId.includes(keyword))) {
          return element;
        }
      }
      return null;
    }

    byAriaLabel(description) {
      const keywords = description.toLowerCase();
      const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby]');
      
      for (const element of ariaElements) {
        const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
        if (ariaLabel.includes(keywords) || keywords.includes(ariaLabel)) {
          return element;
        }
      }
      return null;
    }

    byPlaceholder(description) {
      const keywords = description.toLowerCase();
      const placeholderElements = document.querySelectorAll('[placeholder]');
      
      for (const element of placeholderElements) {
        const placeholder = element.getAttribute('placeholder').toLowerCase();
        if (placeholder.includes(keywords) || keywords.includes(placeholder)) {
          return element;
        }
      }
      return null;
    }

    byText(description) {
      // Find by visible text content
      const keywords = description.toLowerCase();
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let textNode;
      while (textNode = walker.nextNode()) {
        const text = textNode.textContent.trim().toLowerCase();
        if (text && (text.includes(keywords) || keywords.includes(text))) {
          // Return the parent element that's likely clickable
          let element = textNode.parentElement;
          while (element && !this.isInteractable(element)) {
            element = element.parentElement;
          }
          if (element) return element;
        }
      }
      return null;
    }

    byRole(description) {
      const roleMap = {
        'button': ['button', 'submit'],
        'link': ['link'],
        'input': ['textbox', 'searchbox'],
        'dropdown': ['combobox', 'listbox'],
        'checkbox': ['checkbox'],
        'radio': ['radio']
      };

      for (const [type, roles] of Object.entries(roleMap)) {
        if (description.toLowerCase().includes(type)) {
          for (const role of roles) {
            const element = document.querySelector(`[role="${role}"]`);
            if (element) return element;
          }
        }
      }
      return null;
    }

    byPosition(description, context) {
      // Find elements by relative position (near other elements)
      if (context.nearElement) {
        const referenceElement = document.querySelector(context.nearElement);
        if (referenceElement) {
          const rect = referenceElement.getBoundingClientRect();
          return this.findNearestClickableElement(rect.x, rect.y, description);
        }
      }
      return null;
    }

    byContext(description, context = {}) {
      // Use page context to make smarter selections
      const pageType = this.detectPageType();
      
      if (pageType === 'gmail' && description.includes('compose')) {
        return document.querySelector('[data-tooltip="Compose"], .T-I.T-I-KE.L3');
      }
      
      if (pageType === 'linkedin' && description.includes('message')) {
        return document.querySelector('[data-control-name="messaging"]');
      }
      
      if (pageType === 'form' && description.includes('submit')) {
        return document.querySelector('input[type="submit"], button[type="submit"], button:contains("submit")');
      }
      
      return null;
    }

    detectPageType() {
      const url = window.location.href.toLowerCase();
      const title = document.title.toLowerCase();
      
      if (url.includes('mail.google.com')) return 'gmail';
      if (url.includes('linkedin.com')) return 'linkedin';
      if (url.includes('slack.com')) return 'slack';
      if (document.forms.length > 0) return 'form';
      if (document.querySelectorAll('input').length > 3) return 'form';
      
      return 'general';
    }

    isInteractable(element) {
      const interactableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
      const interactableRoles = ['button', 'link', 'textbox', 'checkbox', 'radio'];
      
      return interactableTags.includes(element.tagName) ||
             interactableRoles.includes(element.getAttribute('role')) ||
             element.hasAttribute('onclick') ||
             element.style.cursor === 'pointer';
    }

    findNearestClickableElement(x, y, description) {
      const elements = document.elementsFromPoint(x, y);
      for (const element of elements) {
        if (this.isInteractable(element)) {
          return element;
        }
      }
      return null;
    }
  }

  // AI Task Planner for breaking down complex commands
  class AITaskPlanner {
    constructor() {
      this.taskTemplates = {
        'send_email': [
          { action: 'navigate', target: 'gmail' },
          { action: 'click', target: 'compose button' },
          { action: 'fill', target: 'recipient field', value: '{{recipient}}' },
          { action: 'fill', target: 'subject field', value: '{{subject}}' },
          { action: 'fill', target: 'message body', value: '{{body}}' },
          { action: 'click', target: 'send button' }
        ],
        'schedule_meeting': [
          { action: 'navigate', target: 'calendar' },
          { action: 'click', target: 'create event' },
          { action: 'fill', target: 'event title', value: '{{title}}' },
          { action: 'fill', target: 'attendees', value: '{{attendees}}' },
          { action: 'set_time', target: 'datetime', value: '{{datetime}}' },
          { action: 'click', target: 'save event' }
        ],
        'post_linkedin': [
          { action: 'navigate', target: 'linkedin' },
          { action: 'click', target: 'start post' },
          { action: 'fill', target: 'post content', value: '{{content}}' },
          { action: 'click', target: 'post button' }
        ]
      };
    }

    planTask(naturalLanguageRequest) {
      console.log('Planning task:', naturalLanguageRequest);
      
      // Simple NLP to extract intent and parameters
      const intent = this.extractIntent(naturalLanguageRequest);
      const parameters = this.extractParameters(naturalLanguageRequest, intent);
      
      if (this.taskTemplates[intent]) {
        return this.taskTemplates[intent].map(step => ({
          ...step,
          value: this.replaceTemplate(step.value, parameters)
        }));
      }
      
      // Generate dynamic plan for unknown tasks
      return this.generateDynamicPlan(naturalLanguageRequest);
    }

    extractIntent(text) {
      const intentKeywords = {
        'send_email': ['send email', 'email', 'compose', 'mail'],
        'schedule_meeting': ['schedule', 'meeting', 'calendar', 'appointment'],
        'post_linkedin': ['post', 'linkedin', 'share', 'publish'],
        'fill_form': ['fill', 'form', 'submit', 'register'],
        'search': ['search', 'find', 'look for'],
        'navigate': ['go to', 'open', 'visit', 'navigate']
      };

      const lowerText = text.toLowerCase();
      for (const [intent, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          return intent;
        }
      }
      
      return 'custom';
    }

    extractParameters(text, intent) {
      const params = {};
      
      // Email extraction
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) params.recipient = emailMatch[0];
      
      // Subject/title extraction (text in quotes)
      const titleMatch = text.match(/"([^"]+)"/);
      if (titleMatch) {
        params.subject = titleMatch[1];
        params.title = titleMatch[1];
      }
      
      // Body/content extraction (everything after "saying" or "about")
      const bodyMatch = text.match(/(?:saying|about|message)\s+"?([^"]+)"?/i);
      if (bodyMatch) {
        params.body = bodyMatch[1];
        params.content = bodyMatch[1];
      }
      
      return params;
    }

    replaceTemplate(template, parameters) {
      if (!template) return undefined;
      
      let result = template;
      for (const [key, value] of Object.entries(parameters)) {
        result = result.replace(`{{${key}}}`, value);
      }
      return result;
    }

    generateDynamicPlan(request) {
      // For unknown tasks, create a basic plan
      return [
        { action: 'analyze_page', target: 'current page' },
        { action: 'find_relevant_elements', target: request },
        { action: 'execute_action', target: 'best_guess', value: request }
      ];
    }
  }

  // Enhanced Context Awareness System
  class ContextAwareness {
    constructor() {
      this.pageState = {
        url: window.location.href,
        title: document.title,
        readyState: document.readyState,
        lastUpdate: Date.now()
      };
      this.startMonitoring();
    }

    startMonitoring() {
      // Monitor URL changes
      let lastUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          this.updatePageState();
          this.notifyPageChange();
        }
      }, 1000);

      // Monitor DOM changes
      const observer = new MutationObserver((mutations) => {
        if (mutations.length > 5) { // Significant changes
          this.updatePageState();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
    }

    updatePageState() {
      this.pageState = {
        url: window.location.href,
        title: document.title,
        readyState: document.readyState,
        lastUpdate: Date.now(),
        forms: this.analyzeForms(),
        inputs: this.analyzeInputs(),
        buttons: this.analyzeButtons(),
        links: this.analyzeLinks()
      };
    }

    analyzeForms() {
      return Array.from(document.forms).map(form => ({
        action: form.action,
        method: form.method,
        fields: Array.from(form.elements).map(el => ({
          type: el.type,
          name: el.name,
          required: el.required
        }))
      }));
    }

    analyzeInputs() {
      return Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        ariaLabel: input.getAttribute('aria-label'),
        required: input.required,
        visible: input.offsetParent !== null
      }));
    }

    analyzeButtons() {
      return Array.from(document.querySelectorAll('button, input[type="submit"], [role="button"]')).map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.type,
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }));
    }

    analyzeLinks() {
      return Array.from(document.querySelectorAll('a[href]')).map(link => ({
        href: link.href,
        text: link.textContent?.trim(),
        visible: link.offsetParent !== null
      }));
    }

    getPageContext() {
      return {
        ...this.pageState,
        pageType: this.detectPageType(),
        isLoggedIn: this.detectLoginStatus(),
        availableActions: this.getAvailableActions()
      };
    }

    detectPageType() {
      const url = window.location.href.toLowerCase();
      if (url.includes('mail.google.com')) return 'gmail';
      if (url.includes('linkedin.com')) return 'linkedin';
      if (url.includes('slack.com')) return 'slack';
      if (url.includes('calendar.google.com')) return 'calendar';
      if (url.includes('drive.google.com')) return 'drive';
      return 'general';
    }

    detectLoginStatus() {
      // Look for common login indicators
      const logoutElements = document.querySelectorAll('[href*="logout"], [onclick*="logout"], .logout');
      const profileElements = document.querySelectorAll('.profile, [data-testid*="profile"], .user-menu');
      return logoutElements.length > 0 || profileElements.length > 0;
    }

    getAvailableActions() {
      const actions = [];
      
      if (this.pageState.forms.length > 0) actions.push('fill_form');
      if (this.pageState.buttons.length > 0) actions.push('click_button');
      if (this.pageState.inputs.length > 0) actions.push('fill_input');
      if (this.pageState.links.length > 0) actions.push('navigate');
      
      // Page-specific actions
      const pageType = this.detectPageType();
      if (pageType === 'gmail') actions.push('compose_email', 'read_email');
      if (pageType === 'linkedin') actions.push('send_message', 'post_update');
      if (pageType === 'calendar') actions.push('create_event', 'schedule_meeting');
      
      return actions;
    }

    notifyPageChange() {
      chrome.runtime.sendMessage({
        type: 'PAGE_CONTEXT_UPDATE',
        context: this.getPageContext()
      });
    }
  }

  // Initialize enhanced systems
  const smartFinder = new SmartElementFinder();
  const taskPlanner = new AITaskPlanner();
  const contextAware = new ContextAwareness();

  // Enhanced message listener with AI planning
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'EXECUTE_AI_COMMAND':
        executeAICommand(message.command)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      case 'EXECUTE_COMMAND':
        executeCommand(message.command)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      case 'EXECUTE_TASK_PLAN':
        executeTaskPlan(message.plan)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true;

      case 'SMART_FIND_ELEMENT':
        try {
          const element = smartFinder.findElement(message.description, message.context);
          const rect = element.getBoundingClientRect();
          sendResponse({ 
            success: true, 
            found: true,
            element: {
              tagName: element.tagName,
              text: element.textContent?.slice(0, 100),
              position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
            }
          });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'GET_PAGE_CONTEXT':
        sendResponse({ 
          success: true, 
          context: contextAware.getPageContext()
        });
        break;

      case 'PLAN_NATURAL_LANGUAGE_TASK':
        try {
          const plan = taskPlanner.planTask(message.request);
          sendResponse({ success: true, plan });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'CHECK_PAGE_READY':
        sendResponse({ 
          ready: document.readyState === 'complete',
          url: window.location.href,
          title: document.title,
          context: contextAware.getPageContext()
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

  // Enhanced AI Command Execution
  async function executeAICommand(command) {
    console.log('Executing AI command:', command);
    
    if (command.naturalLanguage) {
      // Convert natural language to action plan
      const plan = taskPlanner.planTask(command.naturalLanguage);
      return await executeTaskPlan(plan);
    }
    
    // Enhanced command with smart element finding
    const { action, target, value, context = {} } = command;
    
    switch (action) {
      case 'smart_click':
        return await smartClick(target, context);
      case 'smart_fill':
        return await smartFill(target, value, context);
      case 'smart_navigate':
        return await smartNavigate(target, context);
      case 'analyze_and_act':
        return await analyzeAndAct(target, value, context);
      default:
        throw new Error(`Unknown AI action: ${action}`);
    }
  }

  // Execute a complete task plan
  async function executeTaskPlan(plan) {
    const results = [];
    
    for (let i = 0; i < plan.length; i++) {
      const step = plan[i];
      console.log(`Executing step ${i + 1}/${plan.length}:`, step);
      
      try {
        let result;
        
        switch (step.action) {
          case 'navigate':
            result = await smartNavigate(step.target);
            break;
          case 'click':
            result = await smartClick(step.target);
            break;
          case 'fill':
            result = await smartFill(step.target, step.value);
            break;
          case 'wait':
            result = await smartWait(step.target, step.value);
            break;
          case 'analyze_page':
            result = contextAware.getPageContext();
            break;
          default:
            result = await executeCommand({ capability: step.action, args: step });
        }
        
        results.push({ step: i + 1, action: step.action, result, success: true });
        
        // Add delay between steps for stability
        if (i < plan.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Step ${i + 1} failed:`, error);
        results.push({ step: i + 1, action: step.action, error: error.message, success: false });
        
        // Continue with remaining steps or stop based on error type
        if (error.message.includes('critical')) {
          break;
        }
      }
    }
    
    return { planResults: results, completed: results.length };
  }

  // Smart action implementations
  async function smartClick(description, context = {}) {
    try {
      const element = smartFinder.findElement(description, context);
      
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait for scroll to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if element is still clickable
      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      if (!isVisible) {
        throw new Error('Element is not visible after scroll');
      }
      
      // Click the element
      element.click();
      
      return {
        success: true,
        action: 'smart_click',
        element: description,
        tagName: element.tagName,
        text: element.textContent?.slice(0, 100),
        position: { x: rect.left, y: rect.top }
      };
      
    } catch (error) {
      throw new Error(`Smart click failed for "${description}": ${error.message}`);
    }
  }

  async function smartFill(description, value, context = {}) {
    try {
      const element = smartFinder.findElement(description, context);
      
      // Focus on the element
      element.focus();
      
      // Clear existing content
      element.select();
      
      // Fill with new value
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = Boolean(value);
      } else {
        element.value = value;
      }
      
      // Trigger events for frameworks
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
      
      return {
        success: true,
        action: 'smart_fill',
        element: description,
        value: value,
        type: element.type
      };
      
    } catch (error) {
      throw new Error(`Smart fill failed for "${description}": ${error.message}`);
    }
  }

  async function smartNavigate(target, context = {}) {
    if (target === 'gmail') {
      window.location.href = 'https://mail.google.com';
    } else if (target === 'linkedin') {
      window.location.href = 'https://linkedin.com';
    } else if (target === 'calendar') {
      window.location.href = 'https://calendar.google.com';
    } else if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      // Try to find a link with matching text
      const link = smartFinder.findElement(target, { ...context, type: 'link' });
      if (link) {
        link.click();
      } else {
        throw new Error(`Could not navigate to: ${target}`);
      }
    }
    
    return { success: true, action: 'smart_navigate', target };
  }

  async function smartWait(condition, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (condition.includes('element')) {
          const elementDesc = condition.replace('element ', '');
          smartFinder.findElement(elementDesc);
          return { success: true, action: 'smart_wait', condition };
        }
        
        if (condition === 'page_load') {
          if (document.readyState === 'complete') {
            return { success: true, action: 'smart_wait', condition };
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw new Error(`Wait condition not met: ${condition}`);
  }

  async function analyzeAndAct(analysis, action, context = {}) {
    const pageContext = contextAware.getPageContext();
    
    // Use page context to determine best action
    console.log('Analyzing page for action:', analysis, pageContext);
    
    if (analysis.includes('email') && pageContext.pageType === 'gmail') {
      return await smartClick('compose button');
    }
    
    if (analysis.includes('message') && pageContext.pageType === 'linkedin') {
      return await smartClick('messaging');
    }
    
    if (analysis.includes('form') && pageContext.forms.length > 0) {
      // Find and focus on the first input field
      const firstInput = document.querySelector('input[type="text"], input[type="email"], textarea');
      if (firstInput) {
        firstInput.focus();
        return { success: true, action: 'analyze_and_act', result: 'Focused on first input field' };
      }
    }
    
    return { success: true, action: 'analyze_and_act', analysis, context: pageContext };
  }

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
      
      case 'compose_email':
        return composeEmailOnPage(args);
      
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

  // Listen for auto-pairing messages from the web page
  window.addEventListener('message', async (event) => {
    if (event.data.type === 'REPLIVO_AUTO_PAIR' && event.data.source === 'replivo-web') {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'PAIR_EXTENSION',
          code: event.data.pairingCode
        });
        
        // Send response back to web page
        window.postMessage({
          type: 'REPLIVO_PAIR_RESPONSE',
          success: response.success,
          error: response.error
        }, '*');
        
        if (response.success) {
          console.log('Extension auto-paired successfully!');
          
          // Notify the agent to start working
          setTimeout(() => {
            chrome.runtime.sendMessage({
              type: 'START_AGENT_WORK',
              userId: response.userId
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Auto-pairing failed:', error);
        window.postMessage({
          type: 'REPLIVO_PAIR_RESPONSE',
          success: false,
          error: error.message
        }, '*');
      }
    }
  });

  // Email composition function for content script
  function composeEmailOnPage(args) {
    const { recipient, subject, body } = args;
    
    // Check if we're on Gmail
    if (window.location.hostname.includes('mail.google.com')) {
      // Try to find compose button and click it
      const composeButton = document.querySelector('[data-tooltip="Compose"], [data-tooltip*="Compose"], .T-I.T-I-KE.L3');
      if (composeButton) {
        composeButton.click();
        
        // Wait for compose window to appear, then fill it
        setTimeout(() => {
          // Fill recipient
          const toField = document.querySelector('input[aria-label*="To"], textarea[aria-label*="To"], input[name="to"]');
          if (toField) {
            toField.value = recipient;
            toField.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          // Fill subject
          const subjectField = document.querySelector('input[aria-label*="Subject"], input[name="subject"]');
          if (subjectField) {
            subjectField.value = subject;
            subjectField.dispatchEvent(new Event('input', { bubbles: true }));
          }
          
          // Fill body
          const bodyField = document.querySelector('[aria-label*="Message body"], [role="textbox"]');
          if (bodyField) {
            bodyField.innerHTML = body.replace(/\n/g, '<br>');
            bodyField.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, 1000);
        
        return { success: true, message: 'Email compose initiated on Gmail' };
      }
    }
    
    // Fallback: redirect to mailto
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { success: true, message: 'Opened email client with pre-filled data' };
  }

  console.log('Replivo Helper content script initialized');
})();