import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare, Zap, Star, Play, Clock, TrendingUp, CheckCircle, Sparkles, ArrowRight, Target, Users, Activity, Shield, Globe, Zap as ZapIcon, Award, Eye, Heart, ThumbsUp } from "lucide-react";

interface TryMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  capabilities?: string[];
  samplePrompts?: string[];
  onHire: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface PerformanceMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function TryMeModal({ isOpen, onClose, agent, capabilities = [], samplePrompts = [], onHire }: TryMeModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'processing' | 'available'>('online');
  const [currentStep, setCurrentStep] = useState(1);
  const [demoQuality, setDemoQuality] = useState({ readability: 95, engagement: 92, seo: 89 });

  // Sample prompts if none provided
  const defaultPrompts = [
    "Write a blog post about AI trends in 2024",
    "Create SEO product descriptions",
    "Draft a newsletter for tech company",
    "Generate viral social media content",
    "Analyze customer feedback data"
  ];

  const prompts = samplePrompts.length > 0 ? samplePrompts : defaultPrompts;

  // Enhanced performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { label: "Projects Completed", value: "2,847", icon: <CheckCircle className="w-5 h-5" />, color: "text-green-400", trend: 'up' },
    { label: "Average Rating", value: "4.9/5", icon: <Star className="w-5 h-5" />, color: "text-yellow-400", trend: 'stable' },
    { label: "Response Time", value: "2.3s", icon: <Clock className="w-5 h-5" />, color: "text-blue-400", trend: 'up' },
    { label: "Success Rate", value: "97%", icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-400", trend: 'up' }
  ];

  // Agent specializations
  const specializations = [
    "Blog posts & articles",
    "SEO optimization", 
    "Social media content",
    "Email campaigns",
    "Brand voice consistency"
  ];

  // Integration capabilities
  const integrations = [
    { name: "WordPress", status: "connected", color: "bg-blue-500" },
    { name: "Shopify", status: "connected", color: "bg-green-500" },
    { name: "Mailchimp", status: "available", color: "bg-orange-500" },
    { name: "Google Analytics", status: "connected", color: "bg-purple-500" }
  ];

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message
      setMessages([{
        id: '1',
        type: 'agent',
        content: `Hi! I'm your ${agent.name} AI assistant. I'm here to help you with ${agent.specialty || 'your business needs'}. What would you like to work on today?`,
        timestamp: new Date()
      }]);
      setAgentStatus('online');
      setShowMetrics(false);
      setGenerationProgress(0);
      setCurrentStep(1);
    }
  }, [isOpen, agent]);

  const handleSamplePrompt = async (prompt: string) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate agent processing
    setAgentStatus('processing');
    setIsTyping(true);
    setGenerationProgress(0);
    
    // Simulate progressive generation with realistic timing
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // More realistic progress
      });
    }, 150);

    // Simulate AI response with typing animation
    setTimeout(() => {
      const responses = [
        "I've analyzed your request and created a comprehensive solution. Here's what I've prepared for you based on current best practices and market trends...",
        "Perfect! I've generated a strategic approach that will maximize your results. Let me break this down with actionable insights and data-driven recommendations...",
        "Excellent choice! I've crafted a solution that leverages the latest industry insights and proven methodologies. Here's my detailed analysis...",
        "Great question! I've prepared a detailed response with actionable insights and real-world examples. Let me walk you through the strategy..."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Add typing indicator
      const typingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: randomResponse,
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Simulate typing completion
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === typingMessage.id 
            ? { ...msg, isTyping: false }
            : msg
        ));
        setIsTyping(false);
        setAgentStatus('available');
        setShowMetrics(true);
        setCurrentStep(2);
      }, 3000);
      
    }, 2000);
  };

  const handleCustomPrompt = async () => {
    if (!inputValue.trim()) return;
    
    await handleSamplePrompt(inputValue);
    setInputValue('');
  };

  const handleHire = () => {
    onHire();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-7xl h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="w-3 h-3 bg-yellow-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {agent.name} - Try Me Demo
              </span>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content - Two Panel Layout */}
          <div className="flex h-full">
            {/* Left Panel - Agent Information (40%) */}
            <div className="w-2/5 p-6 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              {/* Agent Profile Section */}
              <div className="text-center mb-8">
                <motion.div
                  className="relative mx-auto w-24 h-24 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${agent.color || 'from-blue-500 to-purple-600'} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                    {agent.icon}
                  </div>
                  {/* Live Status Indicator */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {agent.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {agent.specialty}
                </p>
                
                {/* Star Rating */}
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(agent.rating || 4.9) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {agent.rating || 4.9} ({agent.reviews || 1247} reviews)
                  </span>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Live & Available</span>
                </div>
              </div>

              {/* Key Metrics Dashboard */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Performance Stats
                </h3>
                <div className="space-y-3">
                  {performanceMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`${metric.color}`}>
                          {metric.icon}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {metric.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {metric.value}
                        </span>
                        {metric.trend && (
                          <motion.div
                            className={`w-4 h-4 ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-500" />
                  Specializations
                </h3>
                <div className="space-y-2">
                  {specializations.map((spec, index) => (
                    <motion.div
                      key={spec}
                      className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{spec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Integration Capabilities */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                  Integrations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {integrations.map((integration, index) => (
                    <motion.div
                      key={integration.name}
                      className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-3 h-3 ${integration.color} rounded-full`} />
                      <span className="text-gray-600 dark:text-gray-300">
                        {integration.name}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        integration.status === 'connected' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        {integration.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Interactive Demo (60%) */}
            <div className="w-3/5 p-6 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
              {/* Demo Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Live Demo Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try me with sample prompts or ask your own question
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Sample Prompts
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {prompts.map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      onClick={() => handleSamplePrompt(prompt)}
                      className="text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {prompt}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Interface */}
              <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}>
                        {message.isTyping ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Generation Progress */}
                {generationProgress > 0 && generationProgress < 100 && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Generating response...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Custom Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomPrompt()}
                  />
                  <Button
                    onClick={handleCustomPrompt}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quality Metrics */}
              {showMetrics && (
                <motion.div
                  className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Response Quality Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{demoQuality.readability}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Readability</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{demoQuality.engagement}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">{demoQuality.seo}%</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">SEO Score</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Trust Building Section */}
              <div className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trust & Security
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Enterprise-grade security</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">1,247+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Businesses using this agent</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">99.9%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Uptime guarantee</div>
                  </div>
                </div>
              </div>

              {/* Call-to-Action */}
              <div className="text-center">
                <Button
                  onClick={handleHire}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <ZapIcon className="w-5 h-5 mr-2" />
                  Hire This Agent
                </Button>
                
                <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
                  <button className="text-blue-500 hover:text-blue-600 transition-colors">
                    Start Free Trial
                  </button>
                  <span className="text-gray-400">•</span>
                  <button className="text-blue-500 hover:text-blue-600 transition-colors">
                    View Full Capabilities
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 