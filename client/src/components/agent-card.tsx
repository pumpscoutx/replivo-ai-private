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

  return (
    <motion.div
      className="agent-card bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 group overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
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
          className="absolute top-4 left-4 w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30"
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <i className={`${agent.icon} text-white text-2xl`}></i>
        </motion.div>
        
        {/* Featured Badge */}
        {agent.featured && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 text-xs font-bold">
            <i className="fas fa-crown mr-1"></i>
            FEATURED
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{agent.name}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{agent.description}</p>
      
      {/* Ratings */}
      <div className="flex items-center mb-4">
        <div className="flex mr-2">
          {renderStars(agent.rating)}
        </div>
        <span className="text-sm text-secondary">
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
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              {agent.tasks?.slice(0, 3).map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center text-secondary"
                >
                  <i className={`fas fa-${index === 0 ? 'check-circle text-green-500' : index === 1 ? 'clock text-yellow-500' : 'chart-line text-blue-500'} mr-2`}></i>
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
          >
            <Link href={`/hire/${agent.id}`}>
              <i className="fas fa-rocket mr-2"></i>
              Hire Now
            </Link>
          </Button>
          <div className="text-right">
            <span className="text-3xl font-display font-black text-gray-900">{formatPrice(agent.price)}</span>
            <span className="text-gray-500 font-medium">/mo</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
