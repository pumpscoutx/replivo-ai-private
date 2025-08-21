import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, User, Bot, Sparkles } from "lucide-react";
import type { SubAgent } from "@shared/schema";

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  subAgent: SubAgent;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export default function SandboxModal({ isOpen, onClose, subAgent }: SandboxModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen) {
      setMessages([{
        id: "welcome",
        role: "agent",
        content: `Hi! I'm your ${subAgent.name}. I'm ready to help you with ${subAgent.category}-related tasks. What would you like me to help you with today?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, subAgent]);

  const getDemoResponses = (category: string, input: string) => {
    const responses: Record<string, string[]> = {
      "content": [
        "I can help you create engaging blog posts, social media content, and marketing copy. Let me draft something for you!",
        "Based on your requirements, I'll create content that resonates with your target audience and drives engagement.",
        "I've analyzed similar successful content in your industry. Here's my recommendation..."
      ],
      "analytics": [
        "I'm analyzing your data patterns now. I can see interesting trends in your user behavior.",
        "Based on the metrics, I recommend focusing on these key performance indicators to optimize your results.",
        "Let me generate a comprehensive report showing your growth opportunities..."
      ],
      "support": [
        "I understand your concern. Let me help you resolve this issue quickly and efficiently.",
        "I've reviewed similar cases and can provide you with the best solution based on our knowledge base.",
        "I'm here to ensure you have the best experience. Let me walk you through the solution step by step."
      ]
    };
    
    const categoryResponses = responses[category] || [
      "I'm ready to help you with this task. Let me process your request and provide the best solution.",
      "I understand what you need. I'll use my specialized knowledge to assist you effectively.",
      "Great question! Let me analyze this and provide you with actionable insights."
    ];
    
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: getDemoResponses(subAgent.category, input),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[700px] bg-gradient-to-b from-gray-900 to-black border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="text-white flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <div className="text-lg font-semibold">Try {subAgent.name}</div>
              <div className="text-sm text-gray-400">Interactive sandbox - No commitments</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "agent" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <Card className={`max-w-[80%] p-3 ${
                    message.role === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-800 text-gray-100 border-gray-700"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </Card>

                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="bg-gray-800 text-gray-100 border-gray-700 p-3">
                  <div className="flex gap-1">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                data-testid="input-sandbox-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              <Button 
                data-testid="button-send-message"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              This is a demo environment. Real functionality requires hiring the agent.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}