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
      "Business Growth": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Operations": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "People & Finance": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Marketing Agent": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Data Analyst": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      "Customer Support": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300"
    };
    return imageMap[agentName] || "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300";
  };

  const getCompanionImage = (agentName: string) => {
    const companionMap: { [key: string]: string } = {
      "Business Growth": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "Operations": "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "People & Finance": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "Marketing Agent": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "Data Analyst": "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      "Customer Support": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    return companionMap[agentName] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  };

  const getSubagentNames = (agentName: string) => {
    const subagentMap: Record<string, string> = {
      "Business Growth": "Lead Generator • Sales Qualifier • Campaign Manager • Analytics Specialist • Growth Hacker • Conversion Optimizer",
      "Operations": "Process Automator • Workflow Manager • Quality Controller • Resource Planner • Task Scheduler • Performance Monitor",
      "People & Finance": "HR Assistant • Payroll Manager • Budget Analyst • Expense Tracker • Compliance Monitor • Benefits Coordinator",
      "Marketing Agent": "Social Media Specialist • Email Marketing Expert • Content Creator • Analytics Analyst • SEO Specialist • Campaign Manager",
      "Data Analyst": "Data Scientist • Business Intelligence Analyst • Reporting Specialist • Predictive Modeler • Data Visualizer • Statistical Analyst",
      "Customer Support": "Live Chat Agent • Ticket Manager • Knowledge Base Manager • Social Support Agent • Phone Support Agent • Escalation Specialist"
    };
    return subagentMap[agentName] || "AI Specialist • Task Automator • Process Manager • Data Handler • Communication Expert • Quality Controller";
  };

  const getTagline = (agentName: string) => {
    const taglineMap: Record<string, string> = {
      "Business Growth": "Scale your revenue with smart automation",
      "Operations": "Streamline workflows and boost efficiency", 
      "People & Finance": "Manage teams and finances effortlessly",
      "Marketing Agent": "Complete marketing automation suite",
      "Data Analyst": "Advanced analytics and insights",
      "Customer Support": "24/7 intelligent customer service"
    };
    return taglineMap[agentName] || "Intelligent automation for your business";
  };

  return (
    <motion.div
      className="agent-card bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-700 group overflow-hidden cursor-pointer relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Agent Background Image */}
      <div className="relative h-48 overflow-hidden">
        <motion.img 
          src={getAgentImage(agent.name)}
          alt={agent.name}
          className="w-full h-full object-cover"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Companion Profile Picture */}
        <motion.div 
          className="absolute top-4 right-4 w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden"
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={getCompanionImage(agent.name)}
            alt="AI Companion"
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Featured Badge */}
        {agent.featured && (
          <div className="absolute top-4 left-4 bg-gray-700/80 backdrop-blur-sm text-gray-300 rounded-full px-3 py-1 text-xs font-bold border border-gray-600">
            <i className="fas fa-crown mr-1"></i>
            FEATURED
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Agent Name and Tagline */}
        <div className="mb-4">
          <h3 className="text-2xl font-neiko font-black text-white mb-2">{agent.name.toUpperCase()}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{getTagline(agent.name)}</p>
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
        
        {/* Moving Subagent Names - Only show on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden bg-gray-700/30 rounded-lg p-3 border border-gray-600/30"
            >
              <div className="text-xs text-gray-500 mb-2 font-neiko">SUB-AGENTS:</div>
              <div className="relative h-5 overflow-hidden">
                <div className="subagent-text-slide text-sm text-gray-300 font-medium whitespace-nowrap">
                  {getSubagentNames(agent.name)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3">
          <Button 
            asChild
            variant="outline"
            className="flex-1 border-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-lg font-neiko font-bold text-sm transition-all"
          >
            <Link href={`/agent/${agent.id}`}>
              <i className="fas fa-eye mr-2"></i>
              VIEW AGENT
            </Link>
          </Button>
          
          <Button 
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-neiko font-bold text-sm shadow-lg transition-all transform hover:scale-105 border border-gray-700"
            onClick={() => {
              // TODO: Implement hire flow with login check
              console.log('Hire agent:', agent.name);
            }}
          >
            <i className="fas fa-handshake mr-2"></i>
            HIRE NOW
          </Button>
        </div>
      </div>
    </motion.div>
  );
}