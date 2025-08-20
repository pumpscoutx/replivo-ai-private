import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import SubAgentCard from "@/components/sub-agent-card";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import type { SubAgent } from "@shared/schema";
import { CATEGORIES } from "@/lib/constants";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAgents, setSelectedAgents] = useState<SubAgent[]>([]);

  const { data: subAgents, isLoading } = useQuery<SubAgent[]>({
    queryKey: selectedCategory === "all" ? ["/api/sub-agents"] : ["/api/sub-agents", { category: selectedCategory }]
  });

  const handleAddAgent = (agent: SubAgent) => {
    setSelectedAgents(prev => {
      if (prev.find(a => a.id === agent.id)) {
        return prev.filter(a => a.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  const isAgentSelected = (agentId: string) => {
    return selectedAgents.some(a => a.id === agentId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Marketplace Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block bg-blue-100 text-blue-800 rounded-full px-6 py-2 mb-6 font-semibold text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <i className="fas fa-store mr-2"></i>
              AI Specialist Marketplace
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-gray-900 mb-6 leading-tight">
              Build Your Dream
              <br />
              <span className="text-gradient">AI Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Mix and match specialized AI agents to create the perfect workforce for your business. 
              Each agent excels in specific tasks and integrates seamlessly with others.
            </p>
            
            {/* Filters */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-white"
                      : "bg-white text-secondary hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </motion.div>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              layout
            >
              <AnimatePresence>
                {subAgents?.map((subAgent, index) => (
                  <motion.div
                    key={subAgent.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className={`relative ${isAgentSelected(subAgent.id) ? 'ring-2 ring-primary' : ''}`}>
                      <SubAgentCard 
                        subAgent={subAgent} 
                        onAdd={handleAddAgent}
                      />
                      {isAgentSelected(subAgent.id) && (
                        <motion.div
                          className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <i className="fas fa-check text-white text-xs"></i>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Selected Agents Summary */}
          <AnimatePresence>
            {selectedAgents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 z-50 max-w-md w-full mx-4"
              >
                <h4 className="font-bold text-dark mb-3">Selected Agents ({selectedAgents.length})</h4>
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {selectedAgents.map((agent) => (
                    <div key={agent.id} className="flex justify-between items-center text-sm">
                      <span>{agent.name}</span>
                      <span className="font-medium">${(agent.price / 100).toFixed(0)}/mo</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold">
                    Total: ${selectedAgents.reduce((sum, agent) => sum + agent.price, 0) / 100}/mo
                  </span>
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    Create Bundle
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comparison View Toggle */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              disabled={selectedAgents.length < 2}
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-balance-scale mr-2"></i>
              Compare Selected Agents ({selectedAgents.length})
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
