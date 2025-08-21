# 🚀 Replivo - Advanced AI Agent Marketplace with Browser Automation

Replivo is a cutting-edge AI agent marketplace that enables users to discover, hire, and manage AI agents capable of real-world browser automation. Built with a security-first approach, Replivo combines modern web technologies with innovative device control capabilities.

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Express](https://img.shields.io/badge/Express-4.18-green) ![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🤖 AI Agent Marketplace
- **Interactive Agent Discovery** - Browse AI agents with live previews and capabilities
- **Sandbox Testing** - Test agents safely before hiring with real-time demonstrations
- **Companion Avatars** - Dynamic visual companions with voice interaction foundations
- **Professional UI/UX** - Modern interface built with shadcn/ui and Tailwind CSS

### 🌐 Browser Automation Platform
- **Chrome Extension** - Secure browser helper for real device control
- **Cryptographic Security** - JWT-signed commands with verification
- **Permission System** - Granular domain-based access controls
- **Real-time Communication** - WebSocket connections for instant command execution

### 🔒 Enterprise Security
- **Code Signing** - Cryptographically verified extension commands
- **Audit Trail** - Complete logging of all agent actions
- **Kill Switch** - Emergency stop for all operations
- **Domain Restrictions** - Precise control over agent access

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management
- **Framer Motion** for smooth animations
- **Tailwind CSS** with custom design system

### Backend Infrastructure
- **Express.js** with TypeScript
- **WebSocket Server** for real-time extension communication
- **In-Memory Storage** with PostgreSQL readiness
- **RESTful API** design with modular architecture

### Browser Extension
- **Chrome Manifest V3** for modern extension standards
- **Service Worker** for background command processing
- **Content Scripts** for page manipulation
- **Secure Communication** with server verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Chrome browser for extension testing

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/replivo.git
cd replivo

# Install dependencies
npm install

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Browser Extension Setup
```bash
# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select chrome-extension/ folder
```

## 🎯 Usage

### 1. Explore Agents
Visit the marketplace to browse available AI agents. Each agent shows:
- Live capability demonstrations
- Sandbox testing environment
- Pricing and performance metrics
- User reviews and ratings

### 2. Hire an Agent
1. Click "Hire Now" on any agent
2. Provide company details
3. Review requested permissions
4. Install the Replivo Helper extension
5. Complete the pairing process

### 3. Agent Automation
Once paired, agents can:
- Fill web forms automatically
- Extract data from pages
- Click buttons and navigate sites
- Take screenshots (with permission)
- Generate reports and insights

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utilities and configs
├── server/                # Express.js backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data management
│   ├── websocket-server.ts # Extension communication
│   └── command-signer.ts  # Security layer
├── chrome-extension/      # Browser extension
│   ├── manifest.json      # Extension configuration
│   ├── background.js      # Service worker
│   ├── popup.html/js      # Extension interface
│   └── content.js         # Page interaction
└── shared/               # Shared schemas and types
```

### Environment Variables
Create `.env` for production:
```bash
# Database
DATABASE_URL=your_postgresql_url

# Security
JWT_SECRET=your_jwt_secret
COMMAND_PRIVATE_KEY=your_rsa_private_key

# External APIs
OPENAI_API_KEY=your_openai_key
```

### Testing Extension Commands
```bash
# Generate pairing code
curl -X POST "http://localhost:5000/api/extension/generate-code" \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo-user"}'

# Check extension status
curl "http://localhost:5000/api/extension/status/demo-user"

# Test capabilities
curl -X POST "http://localhost:5000/api/extension/test/form_filling" \
  -H "Content-Type: application/json" \
  -d '{"userId": "demo-user"}'
```

## 🔐 Security Model

### Command Verification
All extension commands are signed with RS256:
```javascript
{
  "request_id": "req-123",
  "agent_id": "customer_success_manager", 
  "capability": "fill_form",
  "args": { /* command parameters */ },
  "expiry": "2025-08-21T12:05:00Z",
  "signature": "BASE64_RSA_SIGNATURE"
}
```

### Permission Scopes
- `browser:navigate` - Open and navigate web pages
- `browser:fill` - Fill forms on specified domains
- `browser:read` - Extract content from approved pages
- `browser:click` - Interact with page elements
- `browser:screenshot` - Capture page images (optional)

### Safety Features
- Commands expire after 5 minutes
- All actions logged for audit
- Emergency disconnect available
- Domain whitelist enforcement

## 📊 Agent Capabilities

### Form Automation
```javascript
// Fill customer support form
{
  capability: 'fill_form',
  args: {
    selectors: {
      name: '#customer-name',
      email: '#customer-email',
      issue: '#issue-description'
    },
    values: {
      name: 'John Smith',
      email: 'john@example.com', 
      issue: 'Billing inquiry'
    }
  }
}
```

### Data Extraction
```javascript
// Extract customer information
{
  capability: 'extract_content',
  args: {
    selectors: {
      customerName: '.customer-name',
      accountStatus: '.account-status',
      orderHistory: '.order-item'
    },
    includeText: true
  }
}
```

### Page Interaction
```javascript
// Click approval button
{
  capability: 'click_selector',
  args: {
    selector: '#approve-button',
    waitFor: 1000
  }
}
```

## 🚢 Deployment

### Production Build
```bash
npm run build
npm start
```

### Platform Options
- **Vercel**: `vercel --prod`
- **Netlify**: Deploy `dist/` folder
- **Docker**: Use included Dockerfile
- **Replit**: Already configured for deployment

### Chrome Web Store
```bash
# Package extension
cd chrome-extension/
zip -r replivo-helper.zip *

# Submit to Chrome Web Store Developer Console
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage
- Document new features
- Follow security protocols

## 📚 Documentation

- **[Browser Extension Spec](BROWSER_EXTENSION_SPEC.md)** - Technical specifications
- **[Device Control Roadmap](DEVICE_CONTROL_ROADMAP.md)** - Future development plans
- **[Implementation Plan](IMPLEMENTATION_PLAN.md)** - Detailed architecture guide
- **[Deployment Guide](DEPLOY_TO_GITHUB.md)** - Platform deployment instructions

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- Modern AI agent marketplace
- Browser extension platform
- Secure command system
- Interactive UI with effects

### Phase 2: Advanced Features 🚧
- Voice-first interaction
- OAuth service integrations  
- Advanced agent capabilities
- Enterprise security features

### Phase 3: Scale & Growth 📈
- Multi-platform support
- Advanced analytics
- Team collaboration
- Enterprise deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check the `/docs` folder
- **Community**: Join our Discord server
- **Email**: support@replivo.com

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the future of AI automation
- Designed for security and user trust
- Powered by the open source community

---

**Ready to revolutionize your workflow with AI agents?** 

[🚀 Start Building](https://github.com/yourusername/replivo) | [📖 Read Docs](IMPLEMENTATION_PLAN.md) | [🎮 Try Demo](http://localhost:5000)