import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: Array<{
    title: string;
    description: string;
    agentId: string;
  }>;
}

export default function AgentRecommender() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm here to help you find the perfect AI agents for your business. What type of tasks are you looking to automate?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Call the agent advisor API
      const response = await apiRequest("POST", "/api/agents/advisor", {
        query: messageToSend,
        userId: "demo-user"
      });

      const responseData = await response.json();

      if (responseData.success) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responseData.advice,
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            {
              title: "Business Growth Agent",
              description: "Scale your revenue with smart automation and lead generation.",
              agentId: "business-growth"
            },
            {
              title: "Operations Agent",
              description: "Streamline workflows and boost efficiency with process automation.",
              agentId: "operations"
            },
            {
              title: "People & Finance Agent",
              description: "Manage teams and finances effortlessly with AI assistance.",
              agentId: "people-finance"
            }
          ]
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Fallback response
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I understand you're looking for AI agents to help with your business. Based on your needs, I recommend starting with our Business Growth Agent bundle, which includes specialized sub-agents for lead generation, sales qualification, and campaign management.",
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            {
              title: "Business Growth Agent",
              description: "Scale your revenue with smart automation and lead generation.",
              agentId: "business-growth"
            }
          ]
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Agent advisor error:", error);
      // Fallback response on error
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're looking for AI agents to help with your business. Based on your needs, I recommend starting with our Business Growth Agent bundle, which includes specialized sub-agents for lead generation, sales qualification, and campaign management.",
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          {
            title: "Business Growth Agent",
            description: "Scale your revenue with smart automation and lead generation.",
            agentId: "business-growth"
          }
        ]
      };
      
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-20 bg-white relative">
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-50 to-purple-50"></div>
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-4xl font-bold text-dark mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Agent Recommender
          </motion.h2>
          <motion.p 
            className="text-xl text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Not sure which agents you need? Chat with our AI to get personalized recommendations
          </motion.p>
        </div>
        
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
            <div className="flex items-center">
              <motion.div 
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <i className="fas fa-robot"></i>
              </motion.div>
              <div>
                <h3 className="font-semibold">AI Agent Advisor</h3>
                <p className="text-sm opacity-90">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Online
                  </motion.span>
                  • Ready to help
                </p>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-6 space-y-4 bg-gray-50 h-80 overflow-y-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start ${message.isBot ? "" : "justify-end"}`}
                >
                  {message.isBot && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-4 shadow-sm max-w-md ${
                    message.isBot ? "bg-white" : "bg-primary text-white"
                  }`}>
                    <p className={message.isBot ? "text-dark" : "text-white"}>
                      {message.text}
                    </p>
                    
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="bg-blue-50 p-3 rounded-lg"
                          >
                            <h4 className="font-semibold text-dark">{suggestion.title}</h4>
                            <p className="text-sm text-secondary mb-2">{suggestion.description}</p>
                            <Button 
                              asChild
                              size="sm" 
                              className="bg-primary text-white"
                            >
                              <Link href={`/agent/${suggestion.agentId}`}>View Agent</Link>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                      <i className="fas fa-user text-gray-600 text-xs"></i>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-start"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-robot text-white text-xs"></i>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            delay: i * 0.2 
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary-dark text-white p-3 rounded-lg transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
