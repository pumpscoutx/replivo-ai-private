# Replivo Helper Chrome Extension

## Overview
The Replivo Helper is a secure Chrome extension that enables AI agents to interact with web pages on behalf of users. It provides browser automation capabilities while maintaining strict security and user consent protocols.

## Features

### 🔒 Security-First Design
- **Code Signing**: All commands are cryptographically signed by the server
- **Permission Scoping**: Granular permissions per domain and capability
- **User Consent**: Explicit approval required for all actions
- **Audit Trail**: Complete logging of all executed commands

### 🤖 Browser Automation Capabilities
- **Form Filling**: Automatically fill and submit web forms
- **Element Interaction**: Click buttons, links, and page elements  
- **Content Extraction**: Read and parse page content
- **Navigation**: Open tabs and navigate between pages
- **Screenshot Capture**: Take page screenshots (with consent)

### 🔗 Real-Time Communication
- **WebSocket Connection**: Live communication with Replivo orchestrator
- **Command Verification**: Server-signed command validation
- **Status Monitoring**: Real-time connection and execution status

## Installation

### For Development
1. Clone the Replivo repository
2. Navigate to the `chrome-extension` directory
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `chrome-extension` folder

### For Production
1. Download from Chrome Web Store (coming soon)
2. Click "Add to Chrome" to install
3. Pin the extension to your toolbar for easy access

## Usage

### 1. Initial Setup
1. Install the Replivo Helper extension
2. Visit the Replivo web app and hire an AI agent
3. Follow the pairing flow to connect your extension
4. Grant permissions for the domains the agent will work with

### 2. Pairing Process
1. When hiring an agent, you'll receive a pairing code
2. Click the Replivo Helper extension icon
3. Enter the pairing code to establish connection
4. The extension will show "Connected" status when successful

### 3. Agent Operations
- Agents will send commands through the secure WebSocket connection
- All commands are verified and executed automatically
- You can monitor activity through the extension popup
- Use the kill switch to stop all operations immediately

## Security Model

### Command Verification
```javascript
// All commands are signed with RS256
{
  "request_id": "req-123",
  "agent_id": "customer_success_manager",
  "capability": "fill_form",
  "args": { ... },
  "expiry": "2025-08-21T12:05:00Z",
  "signature": "BASE64_SIGNATURE"
}
```

### Permission System
- **browser:navigate** - Open and navigate web pages
- **browser:fill** - Fill forms on specified domains
- **browser:read** - Extract content from approved domains
- **browser:click** - Interact with page elements
- **browser:screenshot** - Capture page images (optional)

### Safety Features
- Commands expire after 5 minutes to prevent replay attacks
- All actions are logged for audit purposes
- Emergency disconnect available at any time
- Domain restrictions prevent unauthorized access

## API Reference

### Background Script Events
```javascript
// Pairing with server
chrome.runtime.sendMessage({
  type: 'PAIR_EXTENSION',
  code: 'ABC123XY'
});

// Check connection status
chrome.runtime.sendMessage({
  type: 'GET_STATUS'
});

// Disconnect from server
chrome.runtime.sendMessage({
  type: 'DISCONNECT'
});
```

### Content Script Functions
```javascript
// Fill form fields
fillForm({
  selectors: { email: '#email', name: '#name' },
  values: { email: 'user@example.com', name: 'John Doe' },
  submit: true
});

// Click page element
clickElement({
  selector: '#submit-button',
  waitFor: 1000
});

// Extract page content
extractContent({
  selectors: { title: 'h1', price: '.price' },
  includeText: true
});
```

## Development

### Building
```bash
# No build step required for Chrome MV3
# Extension files are served directly
```

### Testing
```bash
# Load extension in developer mode
# Test with Replivo development server
# Monitor console for debug information
```

### Architecture
```
├── manifest.json       # Extension configuration
├── background.js       # Service worker for commands
├── popup.html/js       # Extension popup interface  
├── content.js          # Page interaction script
├── options.html        # Settings page (future)
└── icons/             # Extension icons
```

## Troubleshooting

### Connection Issues
- Ensure Replivo server is running on localhost:5000
- Check if pairing code is valid and not expired
- Verify WebSocket connection in browser DevTools

### Permission Errors
- Confirm extension has permissions for target domains
- Check if user granted necessary permissions during setup
- Verify agent has proper scopes for requested actions

### Command Failures
- Commands may fail if page elements change
- Check browser console for detailed error messages
- Verify selectors are correct for target page

## Privacy & Data

### Data Collection
- Only executes commands explicitly sent by paired agents
- No automatic data collection or background monitoring
- All activity logs stored locally with user consent

### Data Storage
- Extension stores minimal pairing information locally
- No sensitive data transmitted to external servers
- User can clear all data by disconnecting extension

## Support

For issues with the Replivo Helper extension:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Contact Replivo support with debugging information
4. Report bugs through the GitHub repository

## License

This extension is part of the Replivo project and follows the same licensing terms.