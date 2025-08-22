import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SandboxModal from "./sandbox-modal";
import { Star, Play, Zap, Users, TrendingUp, MessageSquare } from "lucide-react";
import type { SubAgent } from "@shared/schema";

interface SubAgentCardProps {
  subAgent: SubAgent;
  onAdd?: (subAgent: SubAgent) => void;
  showAddButton?: boolean;
}

export default function SubAgentCard({ subAgent, onAdd, showAddButton = false }: SubAgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sandboxOpen, setSandboxOpen] = useState(false);

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

  const getCompanionAvatar = (name: string) => {
    const avatarMap: { [key: string]: string } = {
      "Content Creator": "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "Data Analyst": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80", 
      "Customer Support": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    return avatarMap[name] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };

  const getDemoPreview = (category: string) => {
    const previews: { [key: string]: { title: string; preview: string; } } = {
      "content": {
        title: "Creating blog post...",
        preview: "✨ Generating engaging content about market trends with SEO optimization and compelling headlines..."
      },
      "analytics": { 
        title: "Processing data...",
        preview: "📊 Analyzing user behavior patterns, calculating conversion rates, and generating insights from 50K+ data points..."
      },
      "support": {
        title: "Handling inquiry...",
        preview: "💬 Customer asked about refund policy. Providing personalized solution while maintaining brand voice..."
      }
    };
    return previews[category] || {
      title: "Working on task...",
      preview: "⚡ Processing your request with advanced AI capabilities..."
    };
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
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-600" />);
      }
    }
    return stars;
  };

  const preview = getDemoPreview(subAgent.category);

  return (
    <>
      <motion.div
        className="relative bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all overflow-hidden border border-gray-700/50 group"
        onHoverStart={() => { 
          setIsHovered(true);
          setShowPreview(true);
        }}
        onHoverEnd={() => { 
          setIsHovered(false);
          setShowPreview(false);
        }}
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sub-agent Image with Companion Avatar */}
        <div className="relative h-36 overflow-hidden">
          <motion.img 
            src={getSubAgentImage(subAgent.category)}
            alt={subAgent.name}
            className="w-full h-full object-cover"
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Animated Companion Avatar */}
          <motion.div 
            className="absolute top-3 right-3 w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-xl"
            animate={isHovered ? { 
              scale: 1.1, 
              rotate: [0, -3, 3, 0],
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)"
            } : { 
              scale: 1, 
              rotate: 0,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={getCompanionAvatar(subAgent.name)}
              alt={`${subAgent.name} Avatar`}
              className="w-full h-full object-cover"
            />
            <motion.div 
              className="absolute inset-0 bg-green-500/20 rounded-full"
              animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Category Badge with Animation */}
          <motion.div 
            className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${getGradientClass()} rounded-full flex items-center gap-2 shadow-lg`}
            animate={isHovered ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Zap className="w-3 h-3 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              {subAgent.category}
            </span>
          </motion.div>

          {/* Working Status Indicator */}
          {subAgent.currentTask && (
            <motion.div 
              className="absolute bottom-3 left-3 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className={`w-2 h-2 rounded-full ${getStatusColor(subAgent.taskStatus) === 'text-green-500' ? 'bg-green-500' : 
                  getStatusColor(subAgent.taskStatus) === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs text-white/90 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                {subAgent.taskStatus === 'working' ? 'Active' : subAgent.taskStatus === 'completed' ? 'Done' : 'Ready'}
              </span>
            </motion.div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Header with Rating */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                {subAgent.name}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{renderStars(subAgent.rating || 45)}</div>
                <span className="text-sm text-gray-400">
                  {formatRating(subAgent.rating || 45)} ({(subAgent.reviewCount || 128).toLocaleString()})
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              <Users className="w-3 h-3 mr-1" />
              {subAgent.totalHires || Math.floor(Math.random() * 500) + 100}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">
            {subAgent.description}
          </p>

          {/* Recent Updates */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>Updated 2 days ago</span>
                </div>
                <div className="text-xs text-gray-500">
                  + Enhanced response accuracy + New integrations
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Preview */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">{preview.title}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{preview.preview}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              data-testid={`button-try-${subAgent.name.toLowerCase().replace(' ', '-')}`}
              onClick={() => setSandboxOpen(true)}
              variant="outline"
              size="sm"
              className="flex-1 bg-blue-600/10 border-blue-600/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500"
            >
              <MessageSquare className="w-3 h-3 mr-2" />
              Try Me
            </Button>
            
            {showAddButton && (
              <Button
                data-testid={`button-add-${subAgent.name.toLowerCase().replace(' ', '-')}`}
                onClick={() => onAdd?.(subAgent)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
              >
                <span className="text-lg font-bold mr-1">+</span>
                ${formatPrice(subAgent.price).replace('$', '')}/mo
              </Button>
            )}
            
            <Button
              data-testid={`button-hire-${subAgent.name.toLowerCase().replace(' ', '-')}`}
              onClick={() => window.location.href = `/hire/${subAgent.id}`}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg font-semibold"
            >
              <Zap className="w-3 h-3 mr-1" />
              Hire
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sandbox Modal */}
      <SandboxModal 
        isOpen={sandboxOpen}
        onClose={() => setSandboxOpen(false)}
        subAgent={subAgent}
      />
    </>
  );
}
