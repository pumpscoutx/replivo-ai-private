# 🌐 Replivo Browser Extension Architecture

## Overview
Browser-first implementation using Chrome extension + cloud orchestrator for immediate web automation capabilities. This approach provides real value while building toward full device control.

## Architecture Components

### 1. Frontend Web UI
- Enhanced hiring flow with extension installation
- Permission screens with per-domain consent
- "Your Hired Agents" dashboard with live status
- Voice control interface for conversational commands
- Kill switch and audit log viewer

### 2. Cloud Orchestrator (Server)
- LLM planner using private API keys (server-side only)
- Policy engine for permission checking
- Command signer with JWT/asymmetric signing
- WebSocket server for real-time communication
- Audit logging and user account management

### 3. Browser Extension (Chrome MV3)
- Background service worker for command handling
- Content scripts for DOM manipulation
- Popup for status and quick controls
- Options page for per-domain permissions
- Secure pairing with server authentication

## User Experience Flow

### Hiring Process
```
1. User clicks "Hire Now" on sub-agent
2. Login/Signup (if needed)
3. Company details form (minimal)
4. Permission screen with examples:
   
   [AgentName] is requesting:
   • Browse on your behalf (open pages, click links)
     Example: "Open CRM dashboard and search ticket #123"
   • Fill and submit forms on allowed domains
     Example: "Log into CRM page and update ticket"
   • Read page content (DOM) on allowed domains
     Example: "Extract order ID and status"
   • Download/upload files (browser downloads)
     Example: "Download invoice.pdf and attach to email"
   • Capture screenshots (optional)
     Example: "Take screenshot of confirmation page"
   
   Choose autonomy: [Suggest] [Confirm] [Autonomous]
   
   [Run Safe Demo] [Accept & Install Extension]

5. Extension installation and pairing
6. Per-site consent for specific domains
7. Safe demo execution
8. Agent activated and working
```

## Command Schema

### Signed Command Structure
```json
{
  "request_id": "req-abc-123",
  "agent_id": "ops.customer_success_manager", 
  "issued_at": "2025-08-21T12:00:00Z",
  "capability": "fill_and_submit",
  "args": {
    "tabId": 123,
    "url": "https://crm.example.com/ticket/428",
    "selectors": { 
      "replyBox": "#reply", 
      "submitBtn": ".send" 
    },
    "values": { 
      "replyBox": "Thanks — we've scheduled your shipment." 
    },
    "submit": true
  },
  "expiry": "2025-08-21T12:05:00Z",
  "signature": "BASE64_SIGNATURE"
}
```

## Extension Capabilities

### Core Actions
- **open_url**: Create new tabs, navigate to URLs
- **fill_form**: Fill input fields using CSS selectors
- **click_selector**: Click buttons, links, elements
- **extract_content**: Read DOM content and data
- **take_screenshot**: Capture page visuals (with consent)
- **download_file**: Save files to user's downloads
- **upload_file**: Select and upload files from local system

### Security Features
- Command signature verification
- Per-domain permission enforcement  
- Expiry-based replay attack prevention
- Rate limiting and session management
- Audit logging of all actions

## Voice Integration

### Voice Command Flow
```
1. User speaks: "Hey Replivo, update ticket #123 with shipment info"
2. WebRTC streams audio to server STT
3. LLM interprets intent and plans actions:
   - Open CRM ticket page
   - Extract shipment details
   - Fill update form
   - Submit changes
4. Server asks for confirmation (voice/visual)
5. User approves: "Yes, do it"
6. Commands sent to extension for execution
7. Agent reports back: "Ticket updated successfully"
```

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Enhanced server with command signing
- [ ] Basic Chrome extension with pairing
- [ ] Permission system and consent UI
- [ ] WebSocket communication channel

### Phase 2: Core Actions (Week 3-4) 
- [ ] DOM manipulation capabilities
- [ ] Form filling and submission
- [ ] Content extraction and reading
- [ ] Screenshot capture (optional)

### Phase 3: Voice & Intelligence (Week 5-6)
- [ ] WebRTC voice interface
- [ ] LLM planning and command generation
- [ ] Conversational interaction
- [ ] Advanced error handling

### Phase 4: Production Ready (Week 7-8)
- [ ] Chrome Web Store publication
- [ ] Enterprise security features
- [ ] Comprehensive audit logging
- [ ] Beta user testing and feedback

## Security Requirements

### Server-Side Security
- LLM API keys stored as environment variables only
- Asymmetric command signing (RS256)
- JWT-based extension authentication
- Rate limiting and abuse detection
- Comprehensive audit trails

### Extension Security
- Minimal host permissions (user-granted only)
- Command signature verification
- Per-domain consent enforcement
- Local storage encryption for sensitive data
- Automatic token expiry and refresh

### User Safety
- Explicit consent for every capability
- Per-domain permission granularity
- Immediate kill switch in popup and web UI
- Transparency in planned actions
- Rollback capability where possible

## Example Scenario: Customer Success Manager

```
1. User hires "Customer Success Manager" agent
2. Grants permissions for CRM domain (crm.example.com)
3. Agent receives task: "Follow up on overdue invoice"
4. LLM plans steps:
   - Open customer record
   - Check payment status
   - Draft follow-up email
   - Schedule reminder call
5. Extension executes commands:
   - chrome.tabs.create({url: "crm.example.com/customer/123"})
   - Fill email template with customer details
   - Create calendar event for follow-up
6. Agent reports: "Follow-up sent, call scheduled for tomorrow 2pm"
```

This browser-first approach provides immediate value while maintaining security and building toward full device automation capabilities.