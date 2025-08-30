import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Send, 
  Star, 
  MessageSquare, 
  Target, 
  Briefcase,
  Play,
  Eye
} from "lucide-react";
import type { Agent } from "@shared/schema";

interface TryMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onHireNow: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function TryMeModal({ isOpen, onClose, agent, onHireNow }: TryMeModalProps) {
  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: any } = {
      "Content Creator": <Target className="w-6 h-6" />,
      "Social Media Manager": <MessageSquare className="w-6 h-6" />,
      "Business Assistant": <Briefcase className="w-6 h-6" />
    };
    return iconMap[agentName] || <Target className="w-6 h-6" />;
  };

  const getAgentColor = (agentName: string) => {
    const colorMap: { [key: string]: string } = {
      "Content Creator": "from-emerald-500 to-teal-600",
      "Social Media Manager": "from-purple-500 to-pink-600",
      "Business Assistant": "from-blue-500 to-indigo-600"
    };
    return colorMap[agentName] || "from-gray-500 to-gray-600";
  };

  const getAgentCapabilities = (agentName: string) => {
    const capabilitiesMap: { [key: string]: string[] } = {
      "Content Creator": ["Content Writing", "SEO Optimization", "Blog Posts", "Newsletters"],
      "Social Media Manager": ["Post Scheduling", "Caption Writing", "Hashtag Generation", "Analytics"],
      "Business Assistant": ["Email Drafting", "Document Summaries", "Report Generation", "Schedule Management"]
    };
    return capabilitiesMap[agentName] || ["AI Assistance", "Task Automation", "Content Creation"];
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: `Hi! I'm your ${agent.name} AI assistant. I'm here to help you with ${getAgentCapabilities(agent.name).join(', ')}. What would you like to work on today?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

  const getSamplePrompts = (agentName: string) => {
    const promptsMap: { [key: string]: string[] } = {
      "Content Creator": [
        "Write a blog post about AI in business",
        "Create a product description for a tech gadget",
        "Draft a newsletter for our company"
      ],
      "Social Media Manager": [
        "Create a post for Instagram about our new product",
        "Generate hashtags for a fitness campaign",
        "Write a LinkedIn post about industry trends"
      ],
      "Business Assistant": [
        "Draft a professional email to a client",
        "Summarize this meeting transcript",
        "Create a weekly report template"
      ]
    };
    return promptsMap[agentName] || ["How can you help me?", "What are your capabilities?", "Show me an example"];
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 10);
    const hasHalfStar = (rating % 10) >= 5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-500" />);
      }
    }
    return stars;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: getAgentResponse(inputValue, agent.name),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAgentResponse = (userInput: string, agentName: string) => {
    const responses = {
      "Content Creator": [
        "I'd be happy to help you create engaging content! Based on your request, I can craft compelling copy that resonates with your audience and drives results.",
        "Great idea! I can write SEO-optimized content that ranks well in search engines while maintaining readability and engagement.",
        "Perfect! I'll create content that matches your brand voice and connects with your target audience."
      ],
      "Social Media Manager": [
        "Excellent! I can help you create engaging social media content that builds your brand presence and drives engagement.",
        "I'll craft posts that resonate with your audience and include trending hashtags to maximize reach.",
        "Perfect! I can schedule your content and provide analytics to track performance."
      ],
      "Business Assistant": [
        "I'm here to help streamline your business operations! I can draft professional communications and manage your tasks efficiently.",
        "Great! I'll help you stay organized and productive with automated workflows and smart scheduling.",
        "I can assist with document management, email drafting, and creating professional reports."
      ]
    };

    const agentResponses = responses[agentName as keyof typeof responses] || responses["Business Assistant"];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const handleSamplePrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`p-6 bg-gradient-to-r ${getAgentColor(agent.name)} flex items-center justify-between`}>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {getAgentIcon(agent.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{agent.name}</h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(agent.rating)}
                    </div>
                    <span className="text-white/80 text-sm">
                      {formatRating(agent.rating)} ({agent.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('capabilities')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'capabilities' 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Capabilities
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'chat' && (
                <div className="flex flex-col h-full">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 text-gray-200 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Sample Prompts */}
                  <div className="p-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                      {getSamplePrompts(agent.name).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleSamplePrompt(prompt)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'capabilities' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">What I can do for you:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getAgentCapabilities(agent.name).map((capability, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                      >
                        <h4 className="font-medium text-white mb-2">{capability}</h4>
                        <p className="text-sm text-gray-400">
                          {getCapabilityDescription(capability, agent.name)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex space-x-3">
                <Button
                  onClick={onHireNow}
                  className={`flex-1 bg-gradient-to-r ${getAgentColor(agent.name)} hover:opacity-90 text-white font-medium`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Hire This Agent
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getCapabilityDescription(capability: string, agentName: string): string {
  const descriptions: { [key: string]: { [key: string]: string } } = {
    "Content Creator": {
      "Content Writing": "Create engaging blog posts, articles, and web copy",
      "SEO Optimization": "Optimize content for search engines and better rankings",
      "Blog Posts": "Write compelling blog content that drives traffic",
      "Newsletters": "Craft engaging email newsletters that convert"
    },
    "Social Media Manager": {
      "Post Scheduling": "Schedule and publish posts across multiple platforms",
      "Caption Writing": "Create engaging captions that drive engagement",
      "Hashtag Generation": "Generate trending hashtags for maximum reach",
      "Analytics": "Track performance and provide insights"
    },
    "Business Assistant": {
      "Email Drafting": "Draft professional emails and responses",
      "Document Summaries": "Summarize long documents and meetings",
      "Report Generation": "Create comprehensive business reports",
      "Schedule Management": "Manage calendars and set reminders"
    }
  };

  return descriptions[agentName]?.[capability] || "AI-powered assistance for this task";
} 