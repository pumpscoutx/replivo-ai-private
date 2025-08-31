import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare, Zap, Star, Play, Clock, TrendingUp, CheckCircle, Sparkles, ArrowRight, Target, Users, Activity } from "lucide-react";

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
}

interface PerformanceMetric {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export default function TryMeModal({ isOpen, onClose, agent, capabilities = [], samplePrompts = [], onHire }: TryMeModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'processing' | 'available'>('online');

  // Sample prompts if none provided
  const defaultPrompts = [
    "Create a viral social media post",
    "Write a compelling email sequence",
    "Analyze customer feedback data",
    "Generate content ideas for Q4",
    "Optimize landing page copy"
  ];

  const prompts = samplePrompts.length > 0 ? samplePrompts : defaultPrompts;

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { label: "Response Time", value: "1.2s", icon: <Clock className="w-4 h-4" />, color: "text-green-400" },
    { label: "Quality Score", value: "98%", icon: <Star className="w-4 h-4" />, color: "text-yellow-400" },
    { label: "Success Rate", value: "99.7%", icon: <CheckCircle className="w-4 h-4" />, color: "text-blue-400" },
    { label: "User Satisfaction", value: "4.9/5", icon: <Users className="w-4 h-4" />, color: "text-purple-400" }
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
    }
  }, [isOpen, agent]);

  const handleSamplePrompt = async (prompt: string) => {
    setSelectedPrompt(prompt);
    setInputValue(prompt);
    
    // Simulate agent processing
    setAgentStatus('processing');
    setIsTyping(true);
    setGenerationProgress(0);
    
    // Simulate progressive generation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your request and created a comprehensive solution. Here's what I've prepared for you...",
        "Perfect! I've generated a strategic approach that will maximize your results. Let me break this down...",
        "Excellent choice! I've crafted a solution that leverages the latest best practices. Here's my analysis...",
        "Great question! I've prepared a detailed response with actionable insights. Let me walk you through..."
      ];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        content: prompt,
        timestamp: new Date()
      }, agentMessage]);
      
      setIsTyping(false);
      setAgentStatus('available');
      setShowMetrics(true);
      setGenerationProgress(100);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setAgentStatus('processing');
    setGenerationProgress(0);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I'd be happy to help with that! Let me create a comprehensive solution for you.",
        "Great question! Here's how I can assist you with this task.",
        "Perfect! I'll analyze this and provide you with the best approach.",
        "Excellent! Let me break this down into actionable steps for you."
      ];
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
      setAgentStatus('available');
      setShowMetrics(true);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Glassmorphism Backdrop */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-blue-900/80 to-black/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Particle Effects */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Full Screen Modal */}
          <motion.div
            className="relative w-full h-full max-w-7xl max-h-[95vh] bg-gradient-to-br from-navy-800/40 via-blue-900/30 to-black/60 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Split Screen Layout */}
            <div className="flex h-full">
              {/* Left Side - Agent Info */}
              <div className="w-1/2 p-8 border-r border-white/10 relative overflow-hidden">
                {/* Agent Avatar Section */}
                <div className="text-center mb-8">
                  <motion.div
                    className="relative mx-auto mb-6"
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center text-4xl shadow-2xl relative">
                      {agent.icon || '🤖'}
                      
                      {/* Breathing/Pulse Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-purple-400/30"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </div>
                    
                    {/* Status Indicator */}
                    <motion.div
                      className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-navy-800 flex items-center justify-center ${
                        agentStatus === 'online' ? 'bg-green-500' :
                        agentStatus === 'processing' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    className="text-3xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {agent.name}
                  </motion.h2>
                  
                  <p className="text-gray-300 text-lg mb-4">{agent.specialty}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(agent.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-gray-400 ml-2">({agent.reviews || 1000}+ reviews)</span>
                  </div>
                </div>

                {/* Agent Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {performanceMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                    >
                      <div className={`${metric.color} mb-2 flex justify-center`}>
                        {metric.icon}
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                      <div className="text-sm text-gray-400">{metric.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Skill Tags */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                                         {(agent.skills || ['AI', 'Automation', 'Analytics', 'Content Creation']).map((skill: string, index: number) => (
                       <motion.span
                         key={skill}
                         className="px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-full text-sm text-cyan-300"
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.5 + index * 0.1 }}
                         whileHover={{ 
                           scale: 1.05,
                           backgroundColor: "rgba(6, 182, 212, 0.3)",
                           borderColor: "rgba(6, 182, 212, 0.6)"
                         }}
                       >
                         {skill}
                       </motion.span>
                     ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="absolute bottom-8 left-8 right-8 space-y-3">
                  <Button
                    onClick={onHire}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 group"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Hire This Agent
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-full bg-white/5 hover:bg-white/10 border-white/20 text-white hover:text-white transition-all duration-300"
                    size="lg"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              </div>

              {/* Right Side - Interactive Demo */}
              <div className="w-1/2 p-8 relative">
                {/* Demo Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Try Me Now</h3>
                  <p className="text-gray-400">Experience the power of AI-driven automation</p>
                </div>

                {/* Sample Prompts */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-4">Quick Start Prompts</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {prompts.map((prompt, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleSamplePrompt(prompt)}
                        className={`p-4 text-left rounded-xl border transition-all duration-300 ${
                          selectedPrompt === prompt
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/50 shadow-lg shadow-cyan-500/25'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-400/30'
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{prompt}</span>
                          <Play className="w-4 h-4 text-cyan-400" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Generation Progress */}
                {isTyping && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">Generating Response...</span>
                      <span className="text-cyan-400 font-mono">{Math.round(generationProgress)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Chat Interface */}
                <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 h-64 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        className="flex justify-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="bg-white/10 text-white border border-white/20 p-3 rounded-2xl">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-cyan-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-cyan-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-cyan-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Custom Input */}
                <div className="mt-6">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Or ask me anything custom..."
                      className="flex-1 bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    />
                                          <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isTyping}
                          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 px-6 py-3 rounded-xl shadow-lg"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </motion.div>
                  </div>
                </div>

                {/* Performance Metrics Display */}
                {showMetrics && (
                  <motion.div
                    className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-white">Performance</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Response: 1.2s • Quality: 98% • Success: 99.7%
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 