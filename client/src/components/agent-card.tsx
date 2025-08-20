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

  return (
    <motion.div
      className="agent-card bg-white rounded-xl shadow-lg hover:shadow-2xl p-6 border border-gray-100 group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div 
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 flex items-center justify-center"
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <i className={`${agent.icon} text-white text-2xl`}></i>
      </motion.div>
      
      <h3 className="text-2xl font-bold text-dark mb-3">{agent.name}</h3>
      <p className="text-secondary mb-6 leading-relaxed">{agent.description}</p>
      
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
              {agent.tasks.slice(0, 3).map((task, index) => (
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
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Link href={`/hire/${agent.id}`}>Hire Now</Link>
        </Button>
        <span className="text-2xl font-bold text-dark">{formatPrice(agent.price)}/mo</span>
      </div>
    </motion.div>
  );
}
