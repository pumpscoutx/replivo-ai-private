import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BackgroundEffects from "@/components/background-effects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Play, 
  Zap, 
  Users, 
  TrendingUp, 
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Activity,
  Sparkles
} from "lucide-react";

// Agent data for rotating cards
const AGENT_TYPES = [
  {
    id: "marketing",
    name: "Marketing Specialist",
    specialty: "Content Creation & Lead Generation",
    description: "Creates engaging blog posts, articles, and web copy with SEO optimization and brand voice consistency.",
    icon: "🎯",
    color: "from-pink-500 to-rose-600",
    task: "Writing viral blog post...",
    progress: 75,
    rating: 4.9,
    reviews: 1247,
    price: 99,
    commands: [
      "$ npm install replivo-ai",
      "✓ Installed successfully",
      "$ replivo --deploy-agent content-creator",
      "✓ Agent deployed and ready",
      "$ replivo --create-content blog-post",
      "✓ Content generated successfully"
    ]
  },
  {
    id: "support",
    name: "Support Expert",
    specialty: "Customer Success & Ticket Resolution",
    description: "Handles customer inquiries, resolves tickets, and provides 24/7 support across multiple channels.",
    icon: "💬",
    color: "from-blue-500 to-cyan-600",
    task: "Resolving customer inquiry...",
    progress: 45,
    rating: 4.8,
    reviews: 892,
    price: 79,
    commands: [
      "$ npm install replivo-ai",
      "✓ Installed successfully",
      "$ replivo --deploy-agent support-expert",
      "✓ Agent deployed and ready",
      "$ replivo --resolve-ticket #1234",
      "✓ Ticket resolved successfully"
    ]
  },
  {
    id: "analytics",
    name: "Data Analyst",
    specialty: "Insights & Performance Tracking",
    description: "Analyzes data, generates insights, and creates comprehensive reports for data-driven decisions.",
    icon: "📊",
    color: "from-green-500 to-emerald-600",
    task: "Processing user behavior data...",
    progress: 90,
    rating: 4.9,
    reviews: 1563,
    price: 119,
    commands: [
      "$ npm install replivo-ai",
      "✓ Installed successfully",
      "$ replivo --deploy-agent data-analyst",
      "✓ Agent deployed and ready",
      "$ replivo --analyze-data user-behavior",
      "✓ Analysis completed successfully"
    ]
  },
  {
    id: "sales",
    name: "Sales Closer",
    specialty: "Revenue & Conversion Optimization",
    description: "Qualifies leads, follows up with prospects, and closes deals with personalized sales strategies.",
    icon: "💰",
    color: "from-purple-500 to-indigo-600",
    task: "Following up with hot leads...",
    progress: 60,
    rating: 4.7,
    reviews: 734,
    price: 149,
    commands: [
      "$ npm install replivo-ai",
      "✓ Installed successfully",
      "$ replivo --deploy-agent sales-closer",
      "✓ Agent deployed and ready",
      "$ replivo --follow-up-lead #5678",
      "✓ Follow-up completed successfully"
    ]
  }
];

// Company logos for trusted by section
const COMPANY_LOGOS = [
  { name: "TechCorp", logo: "🚀" },
  { name: "InnovateLab", logo: "🔬" },
  { name: "FutureFlow", logo: "⚡" },
  { name: "DataVault", logo: "🗄️" },
  { name: "CloudScale", logo: "☁️" },
  { name: "AIVision", logo: "🤖" },
  { name: "GrowthHub", logo: "📈" },
  { name: "SmartOps", logo: "⚙️" },
  { name: "DigitalFirst", logo: "💻" },
  { name: "NextGen", logo: "🌟" }
];

// Marketplace agents data
const MARKETPLACE_AGENTS = [
  {
    id: "content-creator",
    name: "Content Creator Pro",
    specialty: "Blogs, Articles & Social Media",
    description: "Creates engaging content that drives traffic and conversions. SEO-optimized writing with brand voice consistency.",
    icon: "✍️",
    color: "from-pink-500 to-rose-600",
    rating: 4.9,
    reviews: 2847,
    price: 129,
    skills: ["Content Writing", "SEO", "Social Media", "Brand Voice"],
    hiringCount: 1247,
    responseTime: "2.3s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop"
  },
  {
    id: "social-manager",
    name: "Social Media Manager",
    specialty: "Platform Management & Engagement",
    description: "Manages all social platforms, creates engaging posts, and builds authentic community relationships.",
    icon: "📱",
    color: "from-blue-500 to-cyan-600",
    rating: 4.8,
    reviews: 1956,
    price: 149,
    skills: ["Social Media", "Community", "Analytics", "Trending"],
    hiringCount: 892,
    responseTime: "1.8s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1611162617213-9d7c0c1f0f1c?w=400&h=300&fit=crop"
  },
  {
    id: "business-assistant",
    name: "Business Assistant",
    specialty: "Productivity & Operations",
    description: "Handles emails, scheduling, document management, and operational tasks to streamline your workflow.",
    icon: "💼",
    color: "from-green-500 to-emerald-600",
    rating: 4.7,
    reviews: 1634,
    price: 99,
    skills: ["Email Management", "Scheduling", "Documents", "Operations"],
    hiringCount: 756,
    responseTime: "3.1s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop"
  },
  {
    id: "data-analyst",
    name: "Data Analyst Expert",
    specialty: "Insights & Performance",
    description: "Transforms raw data into actionable insights with comprehensive analytics and predictive modeling.",
    icon: "📊",
    color: "from-purple-500 to-indigo-600",
    rating: 4.9,
    reviews: 2189,
    price: 179,
    skills: ["Data Analysis", "Predictive Models", "Reporting", "Visualization"],
    hiringCount: 634,
    responseTime: "4.2s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
  },
  {
    id: "customer-support",
    name: "Customer Support Hero",
    specialty: "24/7 Support & Resolution",
    description: "Provides exceptional customer service with quick response times and comprehensive issue resolution.",
    icon: "🦸",
    color: "from-orange-500 to-red-600",
    rating: 4.8,
    reviews: 3421,
    price: 89,
    skills: ["Customer Service", "Problem Solving", "Multi-language", "CRM"],
    hiringCount: 1892,
    responseTime: "1.5s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
  },
  {
    id: "sales-accelerator",
    name: "Sales Accelerator",
    specialty: "Lead Generation & Closing",
    description: "Identifies prospects, nurtures relationships, and closes deals with proven sales methodologies.",
    icon: "🚀",
    color: "from-yellow-500 to-orange-600",
    rating: 4.6,
    reviews: 1278,
    price: 199,
    skills: ["Lead Generation", "Sales Process", "CRM", "Follow-up"],
    hiringCount: 445,
    responseTime: "2.8s",
    availability: "24/7",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
  }
];

// Enhanced Agent Card Component with full styling
const AgentCard = ({ agent, isActive }: { 
  agent: typeof AGENT_TYPES[0]; 
  isActive: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTryMeModal, setShowTryMeModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);

  const getAgentSkills = (name: string) => {
    switch (name.toLowerCase()) {
      case 'marketing specialist':
        return ['✍ Writing', '📈 SEO', '📊 Analytics'];
      case 'support expert':
        return ['💬 Chat', '📋 Tickets', '🔍 Research'];
      case 'data analyst':
        return ['📊 Data', '📈 Insights', '📋 Reports'];
      case 'sales closer':
        return ['💰 Leads', '📞 Follow-up', '📊 CRM'];
      default:
        return ['⚡ AI', '🚀 Growth', '💼 Business'];
    }
  };

  const getAgentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'marketing specialist':
        return '✍️';
      case 'support expert':
        return '💬';
      case 'data analyst':
        return '📊';
      case 'sales closer':
        return '💰';
      default:
        return '🤖';
    }
  };

  const getAgentColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'marketing specialist':
        return 'from-pink-500 to-rose-600';
      case 'support expert':
        return 'from-blue-500 to-cyan-600';
      case 'data analyst':
        return 'from-green-500 to-emerald-600';
      case 'sales closer':
        return 'from-purple-500 to-indigo-600';
      default:
        return 'from-gray-500 to-slate-600';
    }
  };

  const skills = getAgentSkills(agent.name);
  const icon = getAgentIcon(agent.name);
  const color = getAgentColor(agent.name);

  return (
    <>
      <motion.div
        className="group relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 h-full flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02,
          y: -8,
          boxShadow: "0 25px 50px rgba(6, 182, 212, 0.15)"
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-6">
          <motion.div
            className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg`}
            animate={isHovered ? { rotate: 5, scale: 1.1 } : {}}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          
          {/* Active Status */}
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400 font-medium">Active</span>
          </div>
        </div>

        {/* Agent Name - Larger and Bolder */}
        <h3 className="text-2xl font-black text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
          {agent.name}
        </h3>

        {/* Description - Shortened to 1 strong sentence */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
          {agent.description}
        </p>

        {/* Skills Badges - Top 3 key skills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(6, 182, 212, 0.1)",
                borderColor: "rgba(6, 182, 212, 0.3)"
              }}
            >
              {skill}
            </motion.span>
          ))}
        </div>

        {/* Rating Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.i
                  key={i}
                  className={`fas fa-star text-sm ${i < Math.floor(agent.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                  animate={{ 
                    scale: i < Math.floor(agent.rating) ? [1, 1.1, 1] : 1,
                    rotate: i < Math.floor(agent.rating) ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">
              {agent.rating}
            </span>
            <span className="text-xs text-gray-400">
              ({agent.reviews.toLocaleString()})
            </span>
          </div>

          {/* Real-time Activity */}
          <div className="text-xs text-gray-400">
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {Math.floor(Math.random() * 10) + 1} hired today
            </motion.span>
          </div>
        </div>

        {/* CTA Buttons - Consistent bottom alignment */}
        <div className="flex gap-3 mt-auto">
          {/* Try Me Button - Ghost style */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowTryMeModal(true)}
              variant="outline"
              className="w-full bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-cyan-400/50 transition-all duration-300"
              size="sm"
            >
              <motion.i
                className="fas fa-play mr-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Try Me
            </Button>
          </motion.div>

          {/* Hire Now Button - Primary gradient */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setShowHireModal(true)}
              className={`w-full bg-gradient-to-r ${color} hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 font-semibold`}
              size="sm"
            >
              <motion.i
                className="fas fa-rocket mr-2"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              Hire Now
            </Button>
          </motion.div>
        </div>

        {/* Price Display */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xs text-gray-400">Starting at</span>
          <div className="text-lg font-bold text-white">
            ${agent.price}/month
          </div>
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ 
            x: ["-100%", "100%"],
            opacity: [0, 0.3, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Try Me Modal */}
      <AnimatePresence>
        <TryMeModal 
          isOpen={showTryMeModal}
          onClose={() => setShowTryMeModal(false)}
          agent={agent}
          onHire={() => {
            setShowTryMeModal(false);
            setShowHireModal(true);
          }}
        />
      </AnimatePresence>

      {/* Hire Modal */}
      <AnimatePresence>
        <HireModal 
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          agent={agent}
        />
      </AnimatePresence>
    </>
  );
};

// Enhanced Terminal Component
const Terminal = ({ agent, isActive }: { 
  agent: typeof AGENT_TYPES[0]; 
  isActive: boolean;
}) => {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    const typeCommands = async () => {
      for (let i = 0; i < agent.commands.length; i++) {
        setIsTyping(true);
        setCurrentCommandIndex(i);
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsTyping(false);
        
        // Wait before next command
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };

    typeCommands();
  }, [agent, isActive]);

  return (
    <motion.div
      className="w-80 h-64 bg-black/90 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 50,
        scale: isActive ? 1 : 0.9
      }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
      }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700/30">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-xs text-gray-400 font-mono">replivo-ai-terminal</span>
      </div>

      {/* Terminal Content */}
      <div className="p-4 font-mono text-xs space-y-2 h-full overflow-hidden">
        {agent.commands.map((command, index) => (
          <motion.div
            key={index}
            className={`transition-colors duration-300 ${
              index === currentCommandIndex && isTyping 
                ? 'text-green-400' 
                : index <= currentCommandIndex 
                  ? 'text-green-400' 
                  : 'text-gray-600'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: index <= currentCommandIndex ? 1 : 0,
              x: index <= currentCommandIndex ? 0 : -20
            }}
            transition={{ delay: index * 0.1 }}
          >
            {command}
            {index === currentCommandIndex && isTyping && (
              <motion.span
                className="ml-1 text-green-400"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                |
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-green-400/10"
            style={{ top: `${i * 5}%` }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Try Me Modal Component
const TryMeModal = ({ isOpen, onClose, agent, onHire }: {
  isOpen: boolean;
  onClose: () => void;
  agent: typeof AGENT_TYPES[0] | typeof MARKETPLACE_AGENTS[0];
  onHire: () => void;
}) => {
  const [selectedCapability, setSelectedCapability] = useState('content');
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const capabilities = {
    content: ['Blog Writing', 'SEO Optimization', 'Brand Voice', 'Copywriting'],
    seo: ['Keyword Research', 'Meta Tags', 'Content Optimization', 'Analytics'],
    scheduling: ['Content Calendar', 'Social Media', 'Email Campaigns', 'Automation']
  };

  const samplePrompts = [
    "Write a blog post about AI trends in 2024",
    "Create SEO-optimized product descriptions",
    "Draft a newsletter for our tech company"
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => setIsTyping(false), 2000);
    setChatMessage('');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-4xl bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${agent.color} rounded-xl flex items-center justify-center text-xl`}>
              {agent.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{agent.name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={`fas fa-star text-sm ${i < Math.floor(agent.rating) ? 'text-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-400">{agent.rating} ({agent.reviews.toLocaleString()})</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Capabilities Tabs */}
          <div className="flex gap-2 mb-6">
            {Object.keys(capabilities).map((cap) => (
              <button
                key={cap}
                onClick={() => setSelectedCapability(cap)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCapability === cap
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cap.charAt(0).toUpperCase() + cap.slice(1)}
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6 h-64 overflow-y-auto">
            <div className="space-y-4">
              {/* Sample prompts */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">Try these sample prompts:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {samplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setChatMessage(prompt)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs text-gray-300 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat messages would go here */}
              <div className="text-center text-gray-500 text-sm">
                Type a message below to test the agent...
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <Input
              value={chatMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
              placeholder="Ask the agent something..."
              className="flex-1 bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isTyping}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              {isTyping ? 'Typing...' : 'Send'}
            </Button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 bg-gray-800/30 border-t border-white/10">
          <div className="flex gap-3">
            <Button
              onClick={onHire}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold"
              size="lg"
            >
              <i className="fas fa-rocket mr-2" />
              Hire This Agent →
            </Button>
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400"
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Hire Modal Component
const HireModal = ({ isOpen, onClose, agent }: {
  isOpen: boolean;
  onClose: () => void;
  agent: typeof AGENT_TYPES[0] | typeof MARKETPLACE_AGENTS[0];
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);

  const tasks = ['Content Creation', 'SEO Optimization', 'Social Media', 'Email Marketing', 'Analytics'];
  const integrations = ['Google Docs', 'Notion', 'WordPress', 'Mailchimp', 'Slack'];

  const handleTaskToggle = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleIntegrationToggle = (integration: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integration) 
        ? prev.filter(i => i !== integration)
        : [...prev, integration]
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${agent.color} rounded-xl flex items-center justify-center text-xl`}>
              {agent.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">You're hiring the {agent.name} 🚀</h3>
              <p className="text-gray-400 text-sm">Let's get everything set up</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-400'
                }`}>
                  {step < currentStep ? <i className="fas fa-check text-sm" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 ${step < currentStep ? 'bg-green-600' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">What tasks do you want?</h4>
                <div className="grid grid-cols-2 gap-3">
                  {tasks.map((task) => (
                    <button
                      key={task}
                      onClick={() => handleTaskToggle(task)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedTasks.includes(task)
                          ? 'border-green-500 bg-green-600/20 text-green-300'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{task}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">What integrations do you need?</h4>
                <div className="grid grid-cols-2 gap-3">
                  {integrations.map((integration) => (
                    <button
                      key={integration}
                      onClick={() => handleIntegrationToggle(integration)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedIntegrations.includes(integration)
                          ? 'border-green-500 bg-green-600/20 text-green-300'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{integration}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <motion.div
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <i className="fas fa-check text-2xl text-white" />
              </motion.div>
              <div>
                <h4 className="text-2xl font-bold text-white mb-2">Your agent is ready! 🎉</h4>
                <p className="text-gray-400">The {agent.name} has been successfully hired and is ready to help you.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-800/30 border-t border-white/10">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Back
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={
                  (currentStep === 1 && selectedTasks.length === 0) ||
                  (currentStep === 2 && selectedIntegrations.length === 0)
                }
              >
                {currentStep === 1 ? 'Next' : 'Continue'}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onClose();
                  // Navigate to dashboard
                }}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Scrolling Marquee Component
const ScrollingMarquee = () => {
  return (
    <div className="relative overflow-hidden py-8">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Duplicate logos for seamless loop */}
        {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((company, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 text-lg"
            whileHover={{ 
              scale: 1.1,
              filter: "brightness(1.2)"
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="opacity-80">{company.logo}</span>
            <span className="text-white/60 font-medium">{company.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Enhanced Hero Section with sophisticated visual effects
const HeroSection = () => {
  const [, setLocation] = useLocation();
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [textAlternate, setTextAlternate] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentAgentIndex((prev) => (prev + 1) % AGENT_TYPES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Text animation effect
  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextAlternate(prev => !prev);
    }, 1000);
    return () => clearInterval(textInterval);
  }, []);

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Flowing Geometric Shapes */}
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Enhanced Neural Network Visualization */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          
          {/* Connecting Lines Between Nodes */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.svg
              key={`line-${i}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <line
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#neuralGradient)"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </motion.svg>
          ))}
        </div>

        {/* Additional Geometric Shapes */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 border border-cyan-500/20 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-24 h-24 border border-purple-500/20 rotate-45"
          animate={{
            rotate: [45, 405],
            scale: [1, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        {/* Interactive Grid Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          onMouseMove={(e) => {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            target.style.backgroundPosition = `${x * 0.1}px ${y * 0.1}px`;
          }}
        >
          <div className="w-full h-full transition-all duration-300" style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left Side - Enhanced Text Content */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Enhanced Headline with Mixed Font Weights and Text Animation */}
          <motion.h1
            className="text-6xl lg:text-8xl font-black leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.span
              className="text-white font-extralight block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.span
                key={textAlternate ? "hire" : "build"}
                initial={{ opacity: 0, x: textAlternate ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: textAlternate ? 20 : -20 }}
                transition={{ duration: 0.5 }}
                className="inline-block"
              >
                {textAlternate ? "HIRE" : "BUILD"}
              </motion.span>
            </motion.span>
            <motion.span
              className="text-gradient-electric font-black block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              AI AGENTS
            </motion.span>
          </motion.h1>

          {/* Enhanced Subtext with Stagger Animation */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <motion.p
              className="text-xl lg:text-2xl text-gray-300 font-light leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              Skip the traditional hiring. Get specialized agents that work 24/7
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-400 font-medium"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
            >
              Powering 10,000+ teams worldwide
            </motion.p>
          </motion.div>

          {/* Enhanced CTA Buttons with Morphing Effects */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setLocation("/marketplace")}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                size="lg"
              >
                <motion.i
                  className="fas fa-rocket mr-3"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                BROWSE MARKETPLACE
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setLocation("/custom-agent")}
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/20 text-white hover:border-cyan-400/50 hover:bg-white/5 font-semibold text-lg px-8 py-4 rounded-2xl backdrop-blur-xl transition-all duration-300"
                size="lg"
              >
                <motion.i
                  className="fas fa-magic mr-3"
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                CUSTOM BUILD
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Enhanced Dynamic Cards */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {/* Floating Animation Container */}
          <motion.div
            className="relative"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Enhanced Agent Card with Glassmorphism and Magnetic Hover */}
            <motion.div
              className="relative w-80 h-96 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ 
                opacity: isLoaded ? 1 : 0, 
                scale: 1, 
                rotateY: 0 
              }}
              transition={{ duration: 1, delay: 0.8 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                y: -10,
                transition: { duration: 0.3 }
              }}
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
              onClick={() => setCurrentAgentIndex((prev) => (prev + 1) % AGENT_TYPES.length)}
              onHoverStart={(e) => {
                // Magnetic attraction effect - with null safety
                if (e.currentTarget) {
                  const target = e.currentTarget as HTMLElement;
                  try {
                    const rect = target.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const mouseX = e.clientX;
                    const mouseY = e.clientY;
                    
                    const deltaX = (mouseX - centerX) * 0.1;
                    const deltaY = (mouseY - centerY) * 0.1;
                    
                    target.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                  } catch (error) {
                    // Fallback if getBoundingClientRect fails
                    console.log('Hover effect skipped');
                  }
                }
              }}
              onHoverEnd={(e) => {
                if (e.currentTarget) {
                  const target = e.currentTarget as HTMLElement;
                  target.style.transform = '';
                }
              }}
            >
              {/* Card Stacking Effect - Multiple Background Cards */}
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-800/40 to-black/40 backdrop-blur-xl"
                style={{
                  transform: "translateZ(-10px) scale(0.95)",
                  filter: "brightness(0.7)"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gray-700/30 to-black/30 backdrop-blur-lg"
                style={{
                  transform: "translateZ(-20px) scale(0.9)",
                  filter: "brightness(0.5)"
                }}
              />
              
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 rounded-3xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-50">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-0 animate-pulse" />
              </div>

              {/* Enhanced Particle Effects Around Edges */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    style={{
                      left: i < 6 ? `${i * 16.67}%` : `${(i - 6) * 16.67}%`,
                      top: i < 6 ? '0%' : '100%',
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: i < 6 ? [0, -20, 0] : [0, 20, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
                
                {/* Floating Data Particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`data-${i}`}
                    className="absolute text-xs text-cyan-400 font-mono"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + (i % 2) * 40}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    {['AI', 'ML', 'GPT', 'API', 'ML', 'AI'][i]}
                  </motion.div>
                ))}
              </div>

              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Enhanced Agent Icon with Glow Effect */}
                <motion.div
                  className="flex justify-center mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${AGENT_TYPES[currentAgentIndex].color} rounded-3xl flex items-center justify-center text-4xl shadow-2xl relative`}>
                    <motion.span
                      key={currentAgentIndex}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {AGENT_TYPES[currentAgentIndex].icon}
                    </motion.span>
                    
                    {/* Animated Glow Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400 to-purple-400 opacity-30 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Agent Info */}
                <motion.div
                  key={currentAgentIndex}
                  initial={{ opacity: 0, y: 20, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center mb-6"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.h3 
                    className="text-2xl font-black text-white mb-2"
                    key={`name-${currentAgentIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {AGENT_TYPES[currentAgentIndex].name}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-300 text-sm leading-relaxed"
                    key={`desc-${currentAgentIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {AGENT_TYPES[currentAgentIndex].description}
                  </motion.p>
                </motion.div>

                {/* Live Activity Indicators */}
                <motion.div
                  className="bg-gray-800/50 rounded-2xl p-4 mb-6 flex-grow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-cyan-400 font-medium">Live Activity</span>
                    <motion.div
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${AGENT_TYPES[currentAgentIndex].color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${AGENT_TYPES[currentAgentIndex].progress}%` }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-400">
                    {AGENT_TYPES[currentAgentIndex].task}
                  </p>
                </motion.div>

                {/* Dynamic Stats */}
                <motion.div
                  className="flex justify-between items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-lg font-bold text-white"
                      key={currentAgentIndex}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {AGENT_TYPES[currentAgentIndex].rating}
                    </motion.div>
                    <div className="text-xs text-gray-400">Rating</div>
                  </div>
                  
                  <div className="text-center">
                    <motion.div
                      className="text-lg font-bold text-white"
                      key={currentAgentIndex}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      ${AGENT_TYPES[currentAgentIndex].price}
                    </motion.div>
                    <div className="text-xs text-gray-400">Monthly</div>
                  </div>
                  
                  <div className="text-center">
                    <motion.div
                      className="text-lg font-bold text-white"
                      key={currentAgentIndex}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {AGENT_TYPES[currentAgentIndex].reviews.toLocaleString()}
                    </motion.div>
                    <div className="text-xs text-gray-400">Reviews</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Terminal Window */}
            <motion.div
              className="absolute -bottom-8 -right-8 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3 }
              }}
              onClick={() => setCurrentAgentIndex((prev) => (prev + 1) % AGENT_TYPES.length)}
            >
              {/* Terminal Header with Scan Lines and Multiple Tabs */}
              <div className="bg-gray-800/80 p-3 border-b border-white/10 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-xs text-gray-400 font-mono">replivo-ai-terminal</span>
                </div>
                
                {/* Multiple Terminal Tabs */}
                <div className="flex gap-1 mt-2">
                  <div className="px-3 py-1 bg-cyan-600/80 text-white text-xs rounded-t font-mono border-b-2 border-cyan-400">
                    main
                  </div>
                  <div className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-t font-mono hover:bg-gray-600/50 cursor-pointer">
                    logs
                  </div>
                  <div className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-t font-mono hover:bg-gray-600/50 cursor-pointer">
                    monitor
                  </div>
                  <div className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-t font-mono hover:bg-gray-600/50 cursor-pointer">
                    + new
                  </div>
                </div>
                
                {/* Scan Line Animation */}
                <motion.div
                  className="absolute inset-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  animate={{
                    y: [0, 30, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm">
                <motion.div
                  key={currentAgentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2"
                >
                  {/* Enhanced Commands with Realistic Typing */}
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="text-cyan-400">$</span> replivo agent:deploy --type={AGENT_TYPES[currentAgentIndex].id}
                  </motion.div>
                  
                  <motion.div
                    className="text-cyan-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    ⚡ Initializing neural pathways...
                  </motion.div>
                  
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    ✓ Language models loaded (GPT-4 + Custom)
                  </motion.div>
                  
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    ✓ Knowledge base connected (847 documents)
                  </motion.div>
                  
                  <motion.div
                    className="text-cyan-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    ⚡ Agent deployed to production
                  </motion.div>
                  
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    <span className="text-cyan-400">$</span> agent status --live
                  </motion.div>
                  
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    🟢 Handling 12 conversations simultaneously
                  </motion.div>
                  
                  <motion.div
                    className="text-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.1 }}
                  >
                    📊 Response time: 0.3s average
                  </motion.div>

                  {/* Command Suggestions that appear and disappear */}
                  <motion.div
                    className="text-gray-500 italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      delay: 3
                    }}
                  >
                    💡 Tip: Try "agent:optimize --performance" for better results
                  </motion.div>


                </motion.div>

                {/* Blinking Cursor */}
                <motion.div
                  className="inline-block w-2 h-4 bg-green-400 ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Interconnected Lines and Dynamic Lighting */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.path
              d="M 320 200 Q 400 150 480 300"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
            />
            
            {/* Dynamic Lighting Rays */}
            <motion.path
              d="M 320 200 Q 400 150 480 300"
              stroke="url(#lightGradient)"
              strokeWidth="8"
              fill="none"
              opacity="0.3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0], 
                opacity: [0, 0.3, 0] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                delay: 2
              }}
            />
            
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Floating Light Orbs */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-sm"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full blur-sm"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.8, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

// Marketplace Card Component
const MarketplaceCard = ({ agent, index }: { 
  agent: typeof MARKETPLACE_AGENTS[0]; 
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTryMeModal, setShowTryMeModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);

  return (
    <>
      <motion.div
        className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-6 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 h-full flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 30, rotateY: -15 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        whileHover={{ 
          scale: 1.03,
          y: -12,
          rotateY: 5,
          boxShadow: "0 30px 60px rgba(6, 182, 212, 0.25)"
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Floating Animation */}
        <motion.div
          className="absolute inset-0"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 1, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
          <div 
            className="w-full h-full bg-cover bg-center rounded-3xl"
            style={{ backgroundImage: `url(${agent.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center text-3xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {agent.icon}
            </motion.div>
            
            {/* Live Hiring Counter */}
            <motion.div
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-full px-3 py-1 border border-green-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs text-green-400 font-semibold">
                🔥 {agent.hiringCount} hired
              </span>
            </motion.div>
          </div>

          {/* Agent Info */}
          <div className="mb-4">
            <motion.h3 
              className="text-xl font-bold text-white mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {agent.name}
            </motion.h3>
            
            <motion.p 
              className="text-sm text-gray-300 mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {agent.specialty}
            </motion.p>
            
            <motion.p 
              className="text-xs text-gray-400 leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {agent.description}
            </motion.p>
          </div>

          {/* Skills */}
          <div className="mb-4 flex flex-wrap gap-2">
            {agent.skills.map((skill, skillIndex) => (
              <motion.span
                key={skill}
                className="px-2 py-1 bg-white/10 backdrop-blur-xl rounded-full text-xs text-gray-300 border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + skillIndex * 0.1 }}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                {skill}
              </motion.span>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-lg font-bold text-white">{agent.rating}</div>
              <div className="text-xs text-gray-400">Rating</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-lg font-bold text-white">{agent.responseTime}</div>
              <div className="text-xs text-gray-400">Response</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-lg font-bold text-white">{agent.availability}</div>
              <div className="text-xs text-gray-400">Available</div>
            </motion.div>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className={`text-lg ${i < Math.floor(agent.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                whileHover={{ scale: 1.2, color: "#fbbf24" }}
                transition={{ duration: 0.2 }}
              >
                ★
              </motion.div>
            ))}
            <span className="text-sm text-gray-400 ml-2">({agent.reviews} reviews)</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-3">
            {/* Try Me Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setShowTryMeModal(true)}
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white hover:text-white transition-all duration-300"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Try Me
              </Button>
            </motion.div>

            {/* Hire Now Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => setShowHireModal(true)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Hire Now - ${agent.price}/mo
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20"
          animate={{ 
            background: [
              "linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))",
              "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(6, 182, 212, 0.2))"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Connecting Lines Effect */}
        <motion.div
          className="absolute -right-2 top-1/2 w-4 h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent"
          animate={{ 
            scaleX: [0, 1, 0],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      </motion.div>

      {/* Try Me Modal */}
      <AnimatePresence>
        <TryMeModal 
          isOpen={showTryMeModal}
          onClose={() => setShowTryMeModal(false)}
          agent={agent}
          onHire={() => {
            setShowTryMeModal(false);
            setShowHireModal(true);
          }}
        />
      </AnimatePresence>

      {/* Hire Modal */}
      <AnimatePresence>
        <HireModal 
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          agent={agent}
        />
      </AnimatePresence>
    </>
  );
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const agentsRef = useRef(null);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  
  // Marketplace state
  const [sortBy, setSortBy] = useState('rating');
  const [activeFilter, setActiveFilter] = useState('All');
  const [filteredAgents, setFilteredAgents] = useState(MARKETPLACE_AGENTS);

  // Auto-rotate agents every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAgentIndex((prev) => (prev + 1) % AGENT_TYPES.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Handle sorting and filtering
  useEffect(() => {
    let agents = [...MARKETPLACE_AGENTS];
    
    // Apply filter
    if (activeFilter !== 'All') {
      agents = agents.filter(agent => {
        const category = agent.specialty.toLowerCase();
        return category.includes(activeFilter.toLowerCase()) || 
               agent.skills.some(skill => skill.toLowerCase().includes(activeFilter.toLowerCase()));
      });
    }
    
    // Apply sort
    agents.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'hiringCount':
          return b.hiringCount - a.hiringCount;
        default:
          return 0;
      }
    });
    
    setFilteredAgents(agents);
  }, [sortBy, activeFilter]);

  const currentAgent = AGENT_TYPES[currentAgentIndex];

  // Scroll-based transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const agentsY = useTransform(scrollY, [300, 800], [100, 0]);
  const agentsOpacity = useTransform(scrollY, [300, 600], [0, 1]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />
      <BackgroundEffects />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Trusted By Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-black mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-white font-extralight">TRUSTED BY</span>
              <br />
              <span className="text-gradient-electric font-black">FORWARD-THINKING TEAMS</span>
            </motion.h2>
          </motion.div>

          {/* Scrolling Marquee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <ScrollingMarquee />
          </motion.div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-black mb-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-white font-extralight">AI AGENT</span>
              <br />
              <span className="text-gradient-electric font-black">MARKETPLACE</span>
            </motion.h2>
            
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Discover specialized AI agents ready to transform your business. 
              From content creation to customer support, find the perfect AI teammate.
            </motion.p>
          </motion.div>

          {/* Sort and Filter Controls */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 p-6 bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Sort By */}
            <div className="flex items-center gap-3">
              <span className="text-gray-300 font-medium">Sort by:</span>
              <select 
                className="bg-gray-800/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="reviews">Reviews</option>
                <option value="hiringCount">Most Hired</option>
              </select>
            </div>

            {/* Filter By */}
            <div className="flex items-center gap-3">
              <span className="text-gray-300 font-medium">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {['All', 'Content', 'Support', 'Analytics', 'Sales'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      filter === activeFilter 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/20 hover:border-cyan-500/50'
                    }`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Marketplace Grid */}
          {filteredAgents.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {filteredAgents.map((agent, index) => (
                <MarketplaceCard key={agent.id} agent={agent} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No agents found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or browse all agents</p>
              <Button
                onClick={() => setActiveFilter('All')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
              >
                Show All Agents
              </Button>
            </motion.div>
          )}

          {/* View All Agents Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => setLocation("/custom-agent")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-3" />
              View All Agents
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </motion.div>
        </div>
      </section>




    </div>
  );
}