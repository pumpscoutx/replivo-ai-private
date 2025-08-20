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

  const getSubAgentImage = (category: string) => {
    const imageMap: { [key: string]: string } = {
      "content": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "analytics": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "support": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"
    };
    return imageMap[subAgent.category] || "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-700"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sub-agent Image */}
      <div className="relative h-32 overflow-hidden">
        <motion.img 
          src={getSubAgentImage(subAgent.category)}
          alt={subAgent.name}
          className="w-full h-full object-cover"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <motion.div 
          className={`absolute top-3 left-3 w-10 h-10 bg-gradient-to-br ${getGradientClass()} rounded-xl flex items-center justify-center shadow-lg`}
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          <i className={`${subAgent.icon} text-white text-sm`}></i>
        </motion.div>
      </div>

      <div className="p-5">
        <h4 className="text-lg font-nano font-bold text-white mb-2">{subAgent.name.toUpperCase()}</h4>
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{subAgent.description}</p>
      
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
          <div>
            <span className="text-xl font-nano font-black text-white">{formatPrice(subAgent.price)}</span>
            <span className="text-gray-400 text-sm font-medium">/mo</span>
          </div>
          <Button 
            onClick={() => onAdd?.(subAgent)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-nano font-bold shadow-lg transition-all transform hover:scale-105 border border-gray-700"
          >
            <i className="fas fa-plus mr-1"></i>
            ADD
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
