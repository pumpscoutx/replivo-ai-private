import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Agent } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(0)}`;
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

  const getAgentImage = (agentName: string) => {
    const imageMap: { [key: string]: string } = {
      "Marketing Agent": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Data Analyst": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Customer Support": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    };
    return imageMap[agentName] || "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300";
  };

  const getSubagentNames = (agentName: string) => {
    const subagentMap: Record<string, string> = {
      "Marketing Agent": "Social Media Specialist • Email Marketing Expert • Content Creator • Analytics Analyst • SEO Specialist • Campaign Manager",
      "Development Team": "Frontend Developer • Backend Developer • Database Expert • DevOps Engineer • UI/UX Designer • QA Specialist",
      "Customer Support": "Live Chat Agent • Ticket Manager • Knowledge Base Manager • Social Support Agent • Phone Support Agent • Escalation Specialist",
      "Data Analytics": "Data Scientist • Business Intelligence Analyst • Reporting Specialist • Predictive Modeler • Data Visualizer • Statistical Analyst",
      "Sales Team": "Lead Generator • Sales Qualifier • Demo Specialist • Follow-up Agent • Deal Closer • Account Manager"
    };
    return subagentMap[agentName] || "AI Specialist • Task Automator • Process Manager • Data Handler • Communication Expert • Quality Controller";
  };

  return (
    <motion.div
      className="agent-card bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-700 group overflow-hidden cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={() => window.location.href = '/marketplace'}
    >
      {/* Agent Image Header */}
      <div className="relative h-48 overflow-hidden">
        <motion.img 
          src={getAgentImage(agent.name)}
          alt={agent.name}
          className="w-full h-full object-cover"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <motion.div 
          className="absolute top-4 left-4 w-16 h-16 bg-gray-800/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-gray-600/50"
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <i className={`${agent.icon} text-gray-300 text-2xl`}></i>
        </motion.div>
        
        {/* Featured Badge */}
        {agent.featured && (
          <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 rounded-full px-3 py-1 text-xs font-bold border border-gray-600">
            <i className="fas fa-crown mr-1"></i>
            FEATURED
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-neiko font-bold text-white mb-3">{agent.name.toUpperCase()}</h3>
        <p className="text-gray-400 mb-4 leading-relaxed">{agent.description}</p>
        
        {/* Moving Subagent Names */}
        <div className="mb-4 overflow-hidden bg-gray-700/30 rounded-lg p-2 border border-gray-600/30">
          <div className="text-xs text-gray-500 mb-1 font-neiko">INCLUDES:</div>
          <div className="relative h-4 overflow-hidden">
            <div className="subagent-text-slide text-sm text-gray-400 font-medium whitespace-nowrap">
              {getSubagentNames(agent.name)}
            </div>
          </div>
        </div>
      
      {/* Ratings */}
      <div className="flex items-center mb-4">
        <div className="flex mr-2">
          {renderStars(agent.rating)}
        </div>
        <span className="text-sm text-gray-400">
          ({formatRating(agent.rating)}) • {agent.reviewCount} reviews
        </span>
      </div>
      
      {/* Task Preview (animated on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="bg-gray-700/50 rounded-lg p-3 text-sm space-y-1 border border-gray-600/30">
              {agent.tasks?.slice(0, 3).map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-gray-300"
                >
                  <i className={`fas fa-${index === 0 ? 'check-circle text-gray-400' : index === 1 ? 'clock text-gray-400' : 'chart-line text-gray-400'} mr-2`}></i>
                  <span>{task}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
        <div className="flex justify-between items-center">
          <Button 
            asChild
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-neiko font-bold text-lg shadow-lg transition-all transform hover:scale-105 border border-gray-700"
          >
            <Link href="/marketplace">
              <i className="fas fa-shopping-cart mr-2"></i>
              VIEW AGENTS
            </Link>
          </Button>
          <div className="text-right">
            <span className="text-3xl font-neiko font-black text-white">{formatPrice(agent.price)}</span>
            <span className="text-gray-400 font-medium">/mo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
