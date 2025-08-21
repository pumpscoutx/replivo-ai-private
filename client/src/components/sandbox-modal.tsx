import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, User, Bot, Sparkles, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  const [error, setError] = useState<string | null>(null);

  // Map sub-agent categories to agent types for API calls
  const getAgentType = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "content": "business-growth",
      "analytics": "operations", 
      "support": "people-finance"
    };
    return categoryMap[category] || "business-growth";
  };

  // Agent hire mutation for real AI responses
  const agentMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("/api/agents/hire", "POST", {
        agentType: getAgentType(subAgent.category),
        subAgent: subAgent.name,
        task: userMessage,
        context: `This is a demo interaction in the Try Me sandbox. User is testing the ${subAgent.name} agent.`,
        userId: "demo-user"
      });
      return response;
    },
    onError: (error) => {
      console.error("Agent API error:", error);
      setError("Unable to connect to AI agent. Please try again.");
      setIsTyping(false);
    }
  });

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

  // Fallback responses for when API is unavailable
  const getFallbackResponse = (category: string): string => {
    const responses: Record<string, string> = {
      "content": "I'm your Content Creator agent! I can help you create engaging blog posts, social media content, and marketing copy. For full functionality, please hire me to access real-time AI capabilities.",
      "analytics": "I'm your Data Analyst agent! I can analyze patterns, generate reports, and provide insights. For full functionality with real data processing, please hire me.",
      "support": "I'm your Customer Support agent! I can help resolve issues and provide assistance. For full functionality with real customer interactions, please hire me."
    };
    return responses[category] || "I'm ready to help! For full AI capabilities, please hire me to access real-time responses.";
  };

  const handleSend = async () => {
    if (!input.trim() || agentMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      // Try real AI response first
      const result: any = await agentMutation.mutateAsync(currentInput);
      
      let agentContent: string;
      if (result?.response) {
        // Try to parse JSON response from agent
        try {
          const parsedResponse = JSON.parse(result.response);
          agentContent = parsedResponse.explain || result.response;
        } catch {
          agentContent = result.response;
        }
      } else {
        agentContent = getFallbackResponse(subAgent.category);
      }

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent", 
        content: agentContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      // Use fallback response if API fails
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        content: getFallbackResponse(subAgent.category),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } finally {
      setIsTyping(false);
    }
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
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>This is a real AI demo. Hire for full capabilities and Chrome extension integration.</span>
              {error && (
                <div className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  <span>API Error</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}