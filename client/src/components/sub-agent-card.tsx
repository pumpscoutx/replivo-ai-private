import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { SubAgent } from "@shared/schema";

interface SubAgentCardProps {
  subAgent: SubAgent;
  onAdd?: (subAgent: SubAgent) => void;
}

export default function SubAgentCard({ subAgent, onAdd }: SubAgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(0)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "text-green-500";
      case "idle":
        return "text-yellow-500";
      case "completed":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getGradientClass = () => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-green-500 to-teal-600",
      "from-pink-500 to-rose-600",
      "from-orange-500 to-red-600",
      "from-indigo-500 to-blue-600",
      "from-purple-500 to-pink-600"
    ];
    const hash = subAgent.name.charCodeAt(0) % gradients.length;
    return gradients[hash];
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 transition-all"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className={`w-12 h-12 bg-gradient-to-br ${getGradientClass()} rounded-lg mb-4 flex items-center justify-center`}
        animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.2 }}
      >
        <i className={`${subAgent.icon} text-white`}></i>
      </motion.div>
      
      <h4 className="text-lg font-bold text-dark mb-2">{subAgent.name}</h4>
      <p className="text-sm text-secondary mb-4">{subAgent.description}</p>
      
      {/* Animated task preview */}
      {subAgent.currentTask && (
        <motion.div 
          className="bg-gray-50 rounded-lg p-3 mb-4 text-xs"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0.8 }}
        >
          <div className="flex items-center text-secondary">
            <motion.i 
              className={`fas fa-circle ${getStatusColor(subAgent.taskStatus)} mr-2 text-xs`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span>{subAgent.currentTask}</span>
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-dark">{formatPrice(subAgent.price)}/mo</span>
        <Button 
          onClick={() => onAdd?.(subAgent)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          Add
        </Button>
      </div>
    </motion.div>
  );
}
