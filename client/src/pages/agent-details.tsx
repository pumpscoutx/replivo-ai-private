import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SubAgentCard from "@/components/sub-agent-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Agent, SubAgent } from "@shared/schema";

export default function AgentDetails() {
  const [, params] = useRoute("/agent/:id");
  const [selectedSubAgents, setSelectedSubAgents] = useState<SubAgent[]>([]);
  
  const { data: agent, isLoading } = useQuery<Agent>({
    queryKey: ["/api/agents", params?.id],
    enabled: !!params?.id
  });

  const { data: subAgents } = useQuery<SubAgent[]>({
    queryKey: ["/api/sub-agents"],
    enabled: !!agent?.subAgentIds?.length
  });

  const agentSubAgents = subAgents?.filter(sa => 
    agent?.subAgentIds?.includes(sa.id)
  ) || [];

  const handleAddSubAgent = (subAgent: SubAgent) => {
    setSelectedSubAgents(prev => {
      if (prev.find(sa => sa.id === subAgent.id)) {
        return prev.filter(sa => sa.id !== subAgent.id);
      }
      return [...prev, subAgent];
    });
  };

  const isSubAgentSelected = (subAgentId: string) => {
    return selectedSubAgents.some(sa => sa.id === subAgentId);
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
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
            <p className="text-gray-400">The agent you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Agent Hero Section */}
      <section className="py-20 bg-black relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block bg-gray-800/50 text-gray-300 rounded-full px-6 py-2 mb-6 font-semibold text-sm border border-gray-600/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <i className={`${agent.icon} mr-2`}></i>
              AGENT DETAILS
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-neiko font-black text-white mb-6 leading-tight">
              {agent.name.toUpperCase()}
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
              {agent.description}
            </p>

            {/* Ratings and Reviews */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex mr-3">
                {renderStars(agent.rating)}
              </div>
              <span className="text-lg text-gray-300 mr-4">
                {formatRating(agent.rating)} ({agent.reviewCount} reviews)
              </span>
              {agent.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <i className="fas fa-crown mr-1"></i>
                  Featured
                </Badge>
              )}
            </div>

            {/* Main Hire Button */}
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-800 px-12 py-4 rounded-lg font-neiko font-bold text-xl shadow-xl transition-all transform hover:scale-105 border border-gray-700"
              onClick={() => {
                // TODO: Implement hire flow
                console.log('Hire full agent:', agent.name);
              }}
            >
              <i className="fas fa-handshake mr-3"></i>
              HIRE COMPLETE AGENT
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Sub-Agents Section */}
      <section className="py-20 bg-gray-900 relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-neiko font-black text-white mb-6 leading-tight">
              INCLUDED SUB-AGENTS
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Each sub-agent specializes in specific tasks. You can hire the complete bundle or select individual agents.
            </p>
          </motion.div>

          {agentSubAgents.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {agentSubAgents.map((subAgent, index) => (
                <motion.div
                  key={subAgent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className={`${isSubAgentSelected(subAgent.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <SubAgentCard 
                      subAgent={subAgent} 
                      onAdd={handleAddSubAgent}
                      showAddButton={true}
                    />
                  </div>
                  {isSubAgentSelected(subAgent.id) && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <i className="fas fa-check text-white text-xs"></i>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-400">
              <p>No sub-agents available for this agent.</p>
            </div>
          )}

          {/* Selected Sub-Agents Cart */}
          <AnimatePresence>
            {selectedSubAgents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 z-50 max-w-md w-full mx-4"
              >
                <h4 className="font-bold text-gray-900 mb-3">
                  Selected Sub-Agents ({selectedSubAgents.length})
                </h4>
                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {selectedSubAgents.map((subAgent) => (
                    <div key={subAgent.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{subAgent.name}</span>
                      <span className="font-medium text-gray-900">
                        ${(subAgent.price / 100).toFixed(0)}/mo
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">
                    Total: ${selectedSubAgents.reduce((sum, sa) => sum + sa.price, 0) / 100}/mo
                  </span>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // TODO: Implement checkout flow
                      console.log('Checkout selected sub-agents:', selectedSubAgents);
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}