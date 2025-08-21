# 🤖 Replivo - Advanced AI Agent Marketplace

**Transform your business with intelligent agents that work 24/7**

Replivo is a cutting-edge web application for discovering and hiring AI agents for business automation. Built with modern technologies and featuring advanced interactive elements including live previews, companion avatars, sandbox testing, and stunning visual effects.

![Replivo Demo](https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop)

## ✨ Key Features

### 🎯 **Smart Agent Discovery**
- **Pre-built Agent Bundles**: Complete business automation packages
- **Individual Specialist Marketplace**: Mix and match specialized AI agents
- **Custom Agent Requests**: Get tailored solutions for unique business needs
- **Intelligent Recommendations**: AI-powered suggestions based on your requirements

### 🖥️ **Advanced Interactive UI**
- **Live Agent Previews**: Hover to see real-time agent demonstrations
- **Companion Avatars**: Visual representation of each AI agent
- **Interactive Sandbox**: "Try Me" feature with realistic chat demos
- **Advanced Visual Effects**: Animated backgrounds and cursor interactions
- **Real-time Status Indicators**: See what agents are currently working on

### 📊 **Analytics & Insights**
- **Performance Ratings**: Community-driven reviews and ratings
- **Usage Analytics**: Track agent performance and ROI
- **Recent Updates**: Stay informed about agent improvements
- **Integration Tracking**: Monitor connected services and tools

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for lightning-fast development and building
- **Framer Motion** for smooth animations and interactions
- **TanStack Query** for efficient data fetching and caching
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with custom design system
- **shadcn/ui** component library built on Radix UI primitives

### Backend
- **Express.js** with TypeScript for robust API development
- **PostgreSQL** with Neon serverless for scalable data storage
- **Drizzle ORM** for type-safe database operations
- **Passport.js** for authentication (prepared for implementation)

### Development & Deployment
- **TypeScript** across the entire stack
- **ESBuild** for production optimization
- **Path aliases** for clean imports
- **Hot module replacement** for instant development feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use the included in-memory storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/replivo.git
   cd replivo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-based page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── routes/             # API route handlers
│   ├── storage/            # Data access layer
│   └── middleware/         # Express middleware
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── package.json            # Project dependencies and scripts
```

## 🎨 Design Features

### Visual Effects
- **Dynamic Background**: Mouse-reactive gradient animations
- **Floating Particles**: Ambient animated elements
- **Interactive Cursors**: Context-aware hover effects
- **Smooth Transitions**: Framer Motion-powered animations

### Component Highlights
- **Enhanced Agent Cards**: Live previews with companion avatars
- **Sandbox Modal**: Interactive agent testing environment
- **Smart Filters**: Category-based agent discovery
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint

## 🌟 Recent Enhancements

### Version 2.0 Features
- ✅ Enhanced sub-agent cards with live previews
- ✅ Interactive "Try Me" sandbox functionality  
- ✅ Advanced visual effects and animations
- ✅ Companion avatar system
- ✅ Real-time status indicators
- ✅ Improved rating and review system
- ✅ Enhanced data model with analytics

### Migration Completed
- ✅ Successfully migrated from Replit Agent to standard environment
- ✅ Proper client/server separation implemented
- ✅ Enhanced security practices established
- ✅ Modern development workflow optimized

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ for the future of business automation**

*Replivo - Where AI meets productivity*