import { motion } from "framer-motion";
import { useState } from "react";
import { Star, Clock, Users, TrendingUp, PenTool, Share2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import TryMeModal from "./try-me-modal";
import HireNowModal from "./hire-now-modal";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  rating: number;
  reviewCount: number;
  category: string;
  tasks: string[];
  featured: boolean;
}

interface AgentCardProps {
  agent: Agent;
}

const getAgentIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case 'content creator':
      return <PenTool className="w-6 h-6" />;
    case 'social media manager':
      return <Share2 className="w-6 h-6" />;
    case 'business assistant':
      return <Briefcase className="w-6 h-6" />;
    default:
      return <PenTool className="w-6 h-6" />;
  }
};

const getAgentColor = (name: string) => {
  switch (name.toLowerCase()) {
    case 'content creator':
      return 'from-blue-500 to-purple-600';
    case 'social media manager':
      return 'from-pink-500 to-orange-600';
    case 'business assistant':
      return 'from-green-500 to-teal-600';
    default:
      return 'from-blue-500 to-purple-600';
  }
};

const getAgentSkills = (name: string) => {
  switch (name.toLowerCase()) {
    case 'content creator':
      return ['✍ Writing', '📈 SEO', '📊 Analytics'];
    case 'social media manager':
      return ['📱 Social', '📅 Scheduling', '📊 Engagement'];
    case 'business assistant':
      return ['📧 Email', '📋 Reports', '📅 Calendar'];
    default:
      return ['✍ Writing', '📈 SEO', '📊 Analytics'];
  }
};

const getAgentCapabilities = (name: string) => {
  switch (name.toLowerCase()) {
    case 'content creator':
      return ['Blog Writing', 'SEO Optimization', 'Content Strategy', 'Copywriting'];
    case 'social media manager':
      return ['Post Scheduling', 'Engagement Management', 'Analytics', 'Campaign Planning'];
    case 'business assistant':
      return ['Email Drafting', 'Report Generation', 'Meeting Summaries', 'Schedule Management'];
    default:
      return ['Content Creation', 'Strategy', 'Optimization'];
  }
};

const getSamplePrompts = (name: string) => {
  switch (name.toLowerCase()) {
    case 'content creator':
      return [
        "Write a blog post about AI trends in 2024",
        "Create SEO-optimized product descriptions",
        "Draft a newsletter for our tech company"
      ];
    case 'social media manager':
      return [
        "Schedule posts for next week",
        "Generate hashtags for our product launch",
        "Analyze our Instagram engagement"
      ];
    case 'business assistant':
      return [
        "Draft a professional email to clients",
        "Summarize yesterday's team meeting",
        "Create a quarterly report template"
      ];
    default:
      return [
        "Help me with content creation",
        "Analyze our performance",
        "Generate strategic insights"
      ];
  }
};

export default function AgentCard({ agent }: AgentCardProps) {
  const [isTryMeOpen, setIsTryMeOpen] = useState(false);
  const [isHireNowOpen, setIsHireNowOpen] = useState(false);
  const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);

  const skills = getAgentSkills(agent.name);
  const capabilities = getAgentCapabilities(agent.name);
  const samplePrompts = getSamplePrompts(agent.name);
  const gradientClass = getAgentColor(agent.name);

  return (
    <>
      <motion.div
        className="group relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02,
          y: -5,
          boxShadow: "0 25px 50px rgba(6, 182, 212, 0.15)"
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Floating Activity Indicator */}
        <motion.div
          className="absolute top-4 right-4 flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-gray-400 font-medium">Active</span>
        </motion.div>

        {/* Agent Icon */}
        <motion.div
          className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 5 }}
        >
          <div className="text-white">
            {getAgentIcon(agent.name)}
          </div>
        </motion.div>

        {/* Agent Name */}
        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
          {agent.name}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">
          {agent.description}
        </p>

        {/* Skills Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {skills.map((skill, index) => (
            <motion.span
              key={skill}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(6, 182, 212, 0.1)",
                borderColor: "rgba(6, 182, 212, 0.3)"
              }}
            >
              {skill}
            </motion.span>
          ))}
        </div>

        {/* Rating Section */}
        <div 
          className="flex items-center justify-between mb-6"
          onMouseEnter={() => setShowRatingBreakdown(true)}
          onMouseLeave={() => setShowRatingBreakdown(false)}
        >
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <motion.i
                  key={i}
                  className={`fas fa-star text-sm ${i < Math.floor(agent.rating / 10) ? 'text-yellow-400' : 'text-gray-600'}`}
                  animate={{ 
                    scale: i < Math.floor(agent.rating / 10) ? [1, 1.1, 1] : 1,
                    rotate: i < Math.floor(agent.rating / 10) ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">
              {agent.rating / 10}
            </span>
            <span className="text-xs text-gray-400">
              ({agent.reviewCount} reviews)
            </span>
          </div>

          {/* Rating Breakdown Tooltip */}
          {showRatingBreakdown && (
            <motion.div
              className="absolute bottom-full left-0 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-3 mb-2 z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="text-xs text-gray-300 mb-2">Rating Breakdown</div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">{star}★</span>
                    <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-yellow-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 100}%` }}
                        transition={{ duration: 0.5, delay: star * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Real-time Activity */}
        <motion.div
          className="flex items-center justify-between mb-6 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Updated 2 hours ago</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>5 hired today</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex space-x-3">
          {/* Try Me Button */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setIsTryMeOpen(true)}
              variant="outline"
              className="w-full bg-transparent border border-white/20 text-white hover:bg-white/5 hover:border-cyan-400/50 transition-all duration-300"
            >
              <motion.i
                className="fas fa-play mr-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Try Me
            </Button>
          </motion.div>

          {/* Hire Now Button */}
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setIsHireNowOpen(true)}
              className={`w-full bg-gradient-to-r ${gradientClass} hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300`}
            >
              <motion.i
                className="fas fa-rocket mr-2"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              Hire Now
            </Button>
          </motion.div>
        </div>

        {/* Price Display */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-xs text-gray-400">Starting at</span>
          <div className="text-lg font-bold text-white">
            ${(agent.price / 100).toFixed(0)}/month
          </div>
        </motion.div>
      </motion.div>

      {/* Try Me Modal */}
      <TryMeModal
        isOpen={isTryMeOpen}
        onClose={() => setIsTryMeOpen(false)}
        agent={agent}
        capabilities={capabilities}
        samplePrompts={samplePrompts}
        onHire={() => {
          setIsTryMeOpen(false);
          setIsHireNowOpen(true);
        }}
      />

      {/* Hire Now Modal */}
      <HireNowModal
        isOpen={isHireNowOpen}
        onClose={() => setIsHireNowOpen(false)}
        agent={agent}
        gradientClass={gradientClass}
      />
    </>
  );
}