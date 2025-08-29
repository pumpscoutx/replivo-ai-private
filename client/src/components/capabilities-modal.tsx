import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Zap, Star, Users, TrendingUp } from "lucide-react";
import type { SubAgent } from "@shared/schema";

interface CapabilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  subAgent: SubAgent | null;
  capabilities?: {
    tasks: string[];
    description: string;
    image: string;
  };
}

export default function CapabilitiesModal({ 
  isOpen, 
  onClose, 
  subAgent, 
  capabilities 
}: CapabilitiesModalProps) {
  if (!subAgent) return null;

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(0)}`;
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-gray-700">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-neiko font-black text-white mb-2">
                    {subAgent.name}
                  </h2>
                  <p className="text-gray-400 mb-3">
                    {capabilities?.description || subAgent.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(subAgent.rating)}
                      </div>
                      <span className="text-sm text-gray-400">
                        {(subAgent.rating / 10).toFixed(1)} ({subAgent.reviewCount} reviews)
                      </span>
                    </div>
                    
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                      <Users className="w-3 h-3 mr-1" />
                      {subAgent.reviewCount} users
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Tasks */}
                <div>
                  <h3 className="text-xl font-neiko font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    What This Agent Can Do
                  </h3>
                  
                  <div className="space-y-3">
                    {capabilities?.tasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
                      >
                        <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {task}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Features & Pricing */}
                <div className="space-y-6">
                  {/* Key Features */}
                  <div>
                    <h3 className="text-xl font-neiko font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                      Key Features
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">24/7 Availability</p>
                          <p className="text-gray-400 text-xs">Works around the clock</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">Real-time Processing</p>
                          <p className="text-gray-400 text-xs">Instant responses and actions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">AI-Powered</p>
                          <p className="text-gray-400 text-xs">Advanced machine learning</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-neiko font-bold text-white mb-4">
                      Pricing
                    </h3>
                    
                    <div className="text-center mb-4">
                      <div className="text-4xl font-neiko font-black text-white mb-2">
                        {formatPrice(subAgent.price)}
                      </div>
                      <p className="text-gray-400 text-sm">per month</p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Unlimited tasks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Priority support</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Advanced analytics</span>
                      </div>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-neiko font-bold py-3 rounded-lg transition-all transform hover:scale-105"
                      onClick={() => {
                        // Navigate to hiring page
                        window.location.href = `/hire/${subAgent.id}`;
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Hire This Agent
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 