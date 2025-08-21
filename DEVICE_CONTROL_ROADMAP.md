# 🤖 Replivo Device Control Roadmap

## Phase 1: Current State ✅
- ✅ AI Agent Marketplace with discovery and hiring
- ✅ Interactive UI with live previews and sandbox testing
- ✅ Enhanced visual effects and animations
- ✅ Modern tech stack (React + Express + TypeScript)
- ✅ Professional design and user experience

## Phase 2: Foundation for Device Control 🚧

### 2.1 Cloud Orchestrator Enhancement
- [ ] **LLM Planner Integration**: Task planning and decomposition
- [ ] **Policy Engine**: Granular permission management system
- [ ] **Secure Command API**: mTLS WebSocket for helper communication
- [ ] **Audit System**: Immutable action logging with timestamps
- [ ] **User Account System**: Enhanced user management and company profiles

### 2.2 Permission & Scope System
- [ ] **Permission Model**: Granular scopes (email:send, calendar:create, browser:fill, files:read, system.input)
- [ ] **Autonomy Levels**: 
  - Suggest (propose actions only)
  - Confirm (batch approval)
  - Autonomous (scoped auto-execution)
- [ ] **Time-limited Tokens**: Automatic expiration and daily/weekly limits
- [ ] **Permission UI**: Clear consent screens with examples

### 2.3 Enhanced Hiring Flow
```
User clicks "Hire Now" 
→ Login/Signup (if needed)
→ Company Details Form
→ Permissions & Scope Screen (MANDATORY)
  - Show requested capabilities with examples
  - Autonomy level selection
  - Demo action button
→ Helper Installation (if not installed)
→ Payment & Confirmation
→ Agent added to dashboard
```

## Phase 3: Local Device Control 🔄

### 3.1 Local Helper Development
**Core Requirements:**
- [ ] **Cross-Platform Support**: macOS, Windows, Linux implementations
- [ ] **Code Signing**: Notarized packages for security
- [ ] **System Integration**: Keyboard, mouse, files, applications
- [ ] **Browser Extension**: Web-only automation companion
- [ ] **Secure Communication**: mTLS WebSocket with client certificates

**Platform-Specific Implementation:**
- [ ] **macOS**: Notarized .pkg/.app, Accessibility API, AppleScript/AXUI
- [ ] **Windows**: Signed installer, UAC elevation, UIAutomation/PowerShell
- [ ] **Linux**: Packaged snaps/debs, desktop environment compatibility
- [ ] **Browser Extension**: Chrome/Edge/Firefox with native messaging

### 3.2 Security & Hardening
- [ ] **Command Whitelisting**: Helper executes only signed command types
- [ ] **Rate Limiting**: Per-session and per-action limits
- [ ] **Local Sandbox**: ACL-style path selections for file operations
- [ ] **Auto-Updates**: Signature verification for helper updates
- [ ] **Privacy Controls**: Encrypted local logs, optional screenshot consent

## Phase 4: Voice-First Interaction 🎤

### 4.1 Voice Engine
- [ ] **STT Pipeline**: Speech-to-text (cloud or local for privacy)
- [ ] **TTS Pipeline**: Text-to-speech with low latency
- [ ] **WebRTC Integration**: Real-time audio streaming
- [ ] **Conversational Engine**: LLM-based intent parsing

### 4.2 Voice UX
- [ ] **Push-to-Talk**: Microphone activation system
- [ ] **Live Transcription**: Real-time speech display
- [ ] **Action Preview**: Show planned actions before execution
- [ ] **Voice Confirmation**: Spoken approval for actions

**Example Flow:**
```
User: "Hey Replivo, call the customer and confirm shipment"
→ STT converts to text
→ LLM plans: "I will call John at 2pm and send follow-up email"
→ User confirms via voice or click
→ Orchestrator issues commands to helper
```

## Phase 5: Advanced Features 🚀

### 5.1 Enhanced Dashboard
- [ ] **Live Action Feed**: Streaming text log with optional screenshots
- [ ] **Agent Status**: Idle / Running / Needs Approval / Paused
- [ ] **Kill Switch**: Immediate stop for all agents (UI + system tray)
- [ ] **Permission Panel**: Real-time scope management per agent

### 5.2 Integration Layer
- [ ] **OAuth Integrations**: Gmail, Calendar, Drive, Slack, HubSpot
- [ ] **API Adapters**: Standardized interfaces for external services
- [ ] **Webhook Support**: Real-time notifications and triggers
- [ ] **Custom Connectors**: User-defined integration points

## Phase 6: Enterprise & Compliance 📋

### 6.1 Safety & Audit
- [ ] **Immutable Audit Log**: All actions with hash verification
- [ ] **Screenshot System**: Opt-in visual confirmation
- [ ] **Action Rollback**: Revert capability where possible
- [ ] **Anomaly Detection**: Automatic stopping for suspicious behavior

### 6.2 Compliance
- [ ] **GDPR/CCPA Compliance**: Data minimization and user rights
- [ ] **Consent Management**: Timestamped permission records
- [ ] **Critical Action Gates**: Manual confirmation for payments, mass emails
- [ ] **Insurance & Liability**: Legal framework for automated actions

## Command Schema Example

```json
{
  "request_id": "req-123",
  "agent_id": "growth.campaign_master", 
  "capability": "browser.fill_and_submit",
  "args": {
    "url": "https://ads.example.com/campaign",
    "selectors": {"title":"#title","budget":"#budget"}, 
    "values": {"title":"Promo","budget":"500"}
  },
  "policy": {
    "autonomy": "confirm",
    "expiry": "2025-09-01T12:00:00Z"
  }
}
```

## Permission Screen Copy

```
Replivo requests permission to help you automatically. Please review:

• Email (send/draft): Replivo will draft and send emails on your behalf. 
  Example: "Send invoice to client@company.com"

• Calendar (create/update): Replivo can schedule and modify meetings. 
  Example: "Book follow-up call at 10am"

• Browser control (open pages, fill forms): Replivo can perform actions in browser tabs you approve

• Files (read/write) only in folders you select

Choose Autonomy: [Suggest] [Confirm] [Autonomous (critical actions need approval)]

[Run safe demo] [I Understand & Install Helper]
```

## MVP Implementation Strategy

### Start with OAuth + Browser Extension
1. Implement OAuth integrations (Gmail, Calendar, etc.)
2. Build browser extension for web automation
3. Add voice interface for conversational control
4. Test flows with simulated actions
5. Gradually introduce local helper capabilities

### Development Phases
1. **Foundation** (4-6 weeks): Enhanced orchestrator, permission system
2. **Browser Extension** (3-4 weeks): Web automation capabilities
3. **Voice Interface** (3-4 weeks): STT/TTS integration
4. **Local Helper** (6-8 weeks): Cross-platform device control
5. **Enterprise Features** (4-6 weeks): Audit, compliance, advanced security

## Security Priorities

1. **Signed Code**: All helpers must be code-signed and notarized
2. **Granular Permissions**: Never request more access than needed
3. **User Consent**: Explicit approval for every capability
4. **Kill Switch**: Always available emergency stop
5. **Audit Trail**: Complete action logging for accountability
6. **Time Limits**: Automatic expiration of permissions

## Next Immediate Steps

1. **Update Current Codebase**: Add permission system foundation
2. **Design Database Schema**: Store user permissions and audit logs  
3. **Build Permission UI**: Implement consent screens
4. **OAuth Integration**: Start with Gmail/Calendar APIs
5. **Voice Prototype**: Basic STT/TTS implementation

This roadmap transforms Replivo from a marketplace into a comprehensive AI automation platform with real device control capabilities while maintaining security and user trust.