import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Eye,
  Play,
  Briefcase
} from "lucide-react";
import TryMeModal from "./try-me-modal";
import HireNowModal from "./hire-now-modal";
import type { Agent } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTryMeOpen, setIsTryMeOpen] = useState(false);
  const [isHireNowOpen, setIsHireNowOpen] = useState(false);

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating / 10);
    const hasHalfStar = (rating % 10) >= 5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-500" />);
      }
    }
    return stars;
  };

  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: any } = {
      "Content Creator": <Target className="w-8 h-8" />,
      "Social Media Manager": <MessageSquare className="w-8 h-8" />,
      "Business Assistant": <Briefcase className="w-8 h-8" />
    };
    return iconMap[agentName] || <Zap className="w-8 h-8" />;
  };

  const getAgentColor = (agentName: string) => {
    const colorMap: { [key: string]: string } = {
      "Content Creator": "from-emerald-500 to-teal-600",
      "Social Media Manager": "from-purple-500 to-pink-600",
      "Business Assistant": "from-blue-500 to-indigo-600"
    };
    return colorMap[agentName] || "from-gray-500 to-gray-600";
  };

  const getAgentDescription = (agentName: string) => {
    const descMap: { [key: string]: string } = {
      "Content Creator": "Writes blog posts, articles, newsletters, and product descriptions with SEO optimization",
      "Social Media Manager": "Schedules posts, generates captions, and provides engagement insights across platforms",
      "Business Assistant": "Drafts emails, summarizes documents, and manages schedules for productivity"
    };
    return descMap[agentName] || "Intelligent automation for your business";
  };

  const getAgentSkills = (agentName: string) => {
    const skillsMap: { [key: string]: string[] } = {
      "Content Creator": ["✍ Writing", "📈 SEO", "📝 Blogging"],
      "Social Media Manager": ["📱 Social", "📊 Analytics", "🎯 Engagement"],
      "Business Assistant": ["📧 Email", "📋 Tasks", "📊 Reports"]
    };
    return skillsMap[agentName] || ["🤖 AI", "⚡ Automation", "📊 Data"];
  };

  const getAgentStats = (agentName: string) => {
    const statsMap: { [key: string]: { hired: number, active: number } } = {
      "Content Creator": { hired: 156, active: 112 },
      "Social Media Manager": { hired: 203, active: 145 },
      "Business Assistant": { hired: 189, active: 134 }
    };
    return statsMap[agentName] || { hired: 100, active: 75 };
  };

  const stats = getAgentStats(agent.name);

  return (
    <TooltipProvider>
      <motion.div
        className="group relative"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Glassmorphism Card */}
        <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Header with Icon and Gradient */}
          <div className={`relative p-6 bg-gradient-to-r ${getAgentColor(agent.name)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {getAgentIcon(agent.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                  <p className="text-white/80 text-sm">AI Agent</p>
                </div>
              </div>
              
              {/* Featured Badge */}
              {agent.featured && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 backdrop-blur-sm">
                  ⭐ Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-gray-300 text-sm leading-relaxed">
              {getAgentDescription(agent.name)}
            </p>

            {/* Skills Badges */}
            <div className="flex flex-wrap gap-2">
              {getAgentSkills(agent.name).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-gray-700/50 text-gray-300 border-gray-600/30 text-xs"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Rating and Stats */}
            <div className="space-y-3">
              {/* Rating */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 cursor-help">
                    <div className="flex items-center space-x-1">
                      {renderStars(agent.rating)}
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatRating(agent.rating)} ({agent.reviewCount} reviews)
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Rating Breakdown</p>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <span>5★</span>
                        <div className="w-16 bg-gray-600 rounded-full h-1">
                          <div className="bg-yellow-400 h-1 rounded-full" style={{width: '75%'}}></div>
                        </div>
                        <span>75%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>4★</span>
                        <div className="w-16 bg-gray-600 rounded-full h-1">
                          <div className="bg-yellow-400 h-1 rounded-full" style={{width: '20%'}}></div>
                        </div>
                        <span>20%</span>
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Activity Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>📈 {stats.hired} agents hired</span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{stats.active} active now</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsTryMeOpen(true)}
                    className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Try Me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview agent capabilities</p>
                </TooltipContent>
              </Tooltip>

              <Button 
                size="sm"
                onClick={() => setIsHireNowOpen(true)}
                className={`flex-1 bg-gradient-to-r ${getAgentColor(agent.name)} hover:opacity-90 text-white font-medium`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Hire Now
              </Button>
            </div>
          </div>

          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modals */}
      <TryMeModal
        isOpen={isTryMeOpen}
        onClose={() => setIsTryMeOpen(false)}
        agent={agent}
        onHireNow={() => {
          setIsTryMeOpen(false);
          setIsHireNowOpen(true);
        }}
      />

      <HireNowModal
        isOpen={isHireNowOpen}
        onClose={() => setIsHireNowOpen(false)}
        agent={agent}
      />
    </TooltipProvider>
  );
}