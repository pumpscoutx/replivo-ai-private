import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, MessageSquare, Zap, Star, Play, Clock, TrendingUp, CheckCircle, Sparkles, ArrowRight, Target, Users, Activity, Shield, Globe, Zap as ZapIcon, Award, Eye, Heart, ThumbsUp, FileText, Hash, Mail, Share2, Edit3, RefreshCw, Volume2, Download, Copy } from "lucide-react";

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

interface PromptCard {
  id: string;
  title: string;
  description: string;
  type: 'blog' | 'social' | 'email' | 'seo' | 'analytics';
  estimatedTime: string;
  wordCount: string;
  icon: React.ReactNode;
  color: string;
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
  const [selectedPrompt, setSelectedPrompt] = useState<PromptCard | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'processing' | 'available'>('online');
  const [currentStep, setCurrentStep] = useState(1);
  const [demoQuality, setDemoQuality] = useState({ readability: 95, engagement: 92, seo: 89 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [outputLength, setOutputLength] = useState(50);
  const [tone, setTone] = useState('professional');
  const [style, setStyle] = useState('engaging');

  // Sample prompt cards
  const promptCards: PromptCard[] = [
    {
      id: 'blog',
      title: 'Blog Post',
      description: 'AI trends in 2024',
      type: 'blog',
      estimatedTime: '15s',
      wordCount: '~800 words',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'social',
      title: 'Social Media',
      description: 'Product launch announcement',
      type: 'social',
      estimatedTime: '8s',
      wordCount: '3 posts',
      icon: <Share2 className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'email',
      title: 'Email Campaign',
      description: 'Newsletter for tech startup',
      type: 'email',
      estimatedTime: '12s',
      wordCount: '~400 words',
      icon: <Mail className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'seo',
      title: 'SEO Content',
      description: 'Product descriptions',
      type: 'seo',
      estimatedTime: '10s',
      wordCount: '~300 words',
      icon: <Hash className="w-6 h-6" />,
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    { label: 'Completions', value: '2,847', icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', trend: 'up' },
    { label: 'Rating', value: '4.9', icon: <Star className="w-4 h-4" />, color: 'text-yellow-400', trend: 'stable' },
    { label: 'Response Time', value: '<2s', icon: <Zap className="w-4 h-4" />, color: 'text-blue-400', trend: 'up' },
    { label: 'Success Rate', value: '97%', icon: <TrendingUp className="w-4 h-4" />, color: 'text-purple-400', trend: 'up' }
  ];

  // Skills floating around avatar
  const floatingSkills = ['Content Writing', 'SEO', 'Social Media', 'Email Marketing', 'Analytics', 'Brand Voice'];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedPrompt(null);
      setIsExpanded(false);
      setGenerationProgress(0);
    }
  }, [isOpen]);

  const handlePromptSelect = (prompt: PromptCard) => {
    setSelectedPrompt(prompt);
    setIsExpanded(true);
    setCurrentStep(2);
    
    // Simulate generation
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCurrentStep(3);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setSelectedPrompt(null);
    setCurrentStep(1);
    setGenerationProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)`
          }} />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Hero Section - Agent Showcase */}
            <div className="relative px-8 py-12">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-t-3xl" />
              
              {/* Floating Skills */}
              <div className="absolute inset-0 overflow-hidden">
                {floatingSkills.map((skill, index) => (
                  <motion.div
                    key={skill}
                    className="absolute text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50"
                    style={{
                      left: `${20 + (index * 12)}%`,
                      top: `${30 + Math.sin(index) * 20}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 flex items-center space-x-8">
                {/* Agent Avatar */}
                <motion.div
                  className="relative"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 p-1 shadow-2xl">
                    <div className="w-full h-full rounded-3xl bg-slate-800 flex items-center justify-center text-4xl">
                      {agent.icon}
                    </div>
                </div>
                  
                  {/* Status Indicator */}
                  <motion.div
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                </motion.div>

                {/* Agent Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-4xl font-black text-white">
                      {agent.name}
                    </h2>
                  <div className="flex items-center space-x-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold text-white">4.9</span>
                    </div>
                  </div>
                  
                  <div className="text-xl text-slate-300 mb-6">
                    The Content Specialist That Never Sleeps
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex space-x-8">
                    {performanceMetrics.map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className={metric.color}>
                          {metric.icon}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-white">{metric.value}</div>
                          <div className="text-sm text-slate-400">{metric.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Section */}
            <div className="px-8 pb-8">
              {!isExpanded ? (
                /* Prompt Selection Grid */
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Choose a sample prompt to see the magic
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {promptCards.map((card, index) => (
                        <motion.div
                        key={card.id}
                        className="group cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handlePromptSelect(card)}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-500/20">
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                          
                          <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                              {card.icon}
                            </div>
                            
                            <h4 className="text-lg font-bold text-white mb-2">{card.title}</h4>
                            <p className="text-slate-400 text-sm mb-4">{card.description}</p>
                            
                            <div className="flex justify-between items-center text-xs text-slate-500">
                              <span>{card.wordCount}</span>
                              <span></span>
                              <span>{card.estimatedTime}</span>
                            </div>
                          </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ) : (
                /* Expanded Demo Mode */
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  {/* Selected Prompt Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPrompt?.color} flex items-center justify-center text-white`}>
                        {selectedPrompt?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedPrompt?.title}</h3>
                        <p className="text-slate-400">{selectedPrompt?.description}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsExpanded(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Another
                    </Button>
                  </div>

                  {/* Live Demo Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Customize Your Request</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Output Length: {outputLength}%
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={outputLength}
                            onChange={(e) => setOutputLength(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
                          <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          >
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="friendly">Friendly</option>
                            <option value="authoritative">Authoritative</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Style</label>
                          <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                          >
                            <option value="engaging">Engaging</option>
                            <option value="informative">Informative</option>
                            <option value="persuasive">Persuasive</option>
                            <option value="creative">Creative</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-white">Live Output</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-sm text-slate-400">Generating...</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 min-h-[300px]">
                        {currentStep === 2 ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-slate-400">Analyzing requirements...</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${generationProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="text-sm text-slate-500">
                              {generationProgress}% complete
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-slate-300 leading-relaxed">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                              >
                                <h5 className="text-lg font-semibold text-white mb-3">
                                  AI Trends in 2024: The Future is Now
                                </h5>
                                <p className="mb-3">
                                  As we navigate through 2024, artificial intelligence continues to reshape industries at an unprecedented pace. From generative AI tools that create content in seconds to autonomous systems that make complex decisions, the landscape of technology is evolving rapidly.
                                </p>
                                <p className="mb-3">
                                  The most significant trend this year is the democratization of AI. No longer confined to tech giants, AI tools are now accessible to small businesses, content creators, and individual professionals. This shift is creating new opportunities for innovation and efficiency across all sectors.
                                </p>
                                <p>
                                  Looking ahead, we can expect to see even more integration of AI into our daily workflows, with tools becoming more intuitive and powerful. The key to success in this AI-driven world will be learning to work alongside these technologies rather than being replaced by them.
                                </p>
                        </motion.div>
                    </div>

                            {/* Quality Metrics */}
                            <div className="flex space-x-4 pt-4 border-t border-slate-700">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-400">{demoQuality.readability}%</div>
                                <div className="text-xs text-slate-500">Readability</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-400">{demoQuality.engagement}%</div>
                                <div className="text-xs text-slate-500">Engagement</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-400">{demoQuality.seo}%</div>
                                <div className="text-xs text-slate-500">SEO Score</div>
                              </div>
                      </div>
                    </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
                            </div>

            {/* Bottom Action Zone */}
            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-400">12 people hired this agent today</span>
                          </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-900" />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">Trusted by 1,247+ businesses</span>
              </div>
            </div>

                <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                    <Eye className="w-4 h-4 mr-2" />
                    View Portfolio
              </Button>
                  
              <Button
                onClick={onHire}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                    <Zap className="w-5 h-5 mr-2" />
                    Hire This Agent
              </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
