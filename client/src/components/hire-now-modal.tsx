import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  X, 
  Star, 
  Target, 
  MessageSquare, 
  Briefcase,
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Calendar,
  Users,
  Zap
} from "lucide-react";
import type { Agent } from "@shared/schema";

interface HireNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

type Step = 'confirmation' | 'setup' | 'payment' | 'success';

export default function HireNowModal({ isOpen, onClose, agent }: HireNowModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('confirmation');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'per-task'>('monthly');

  const getAgentIcon = (agentName: string) => {
    const iconMap: { [key: string]: any } = {
      "Content Creator": <Target className="w-8 h-8" />,
      "Social Media Manager": <MessageSquare className="w-8 h-8" />,
      "Business Assistant": <Briefcase className="w-8 h-8" />
    };
    return iconMap[agentName] || <Target className="w-8 h-8" />;
  };

  const getAgentColor = (agentName: string) => {
    const colorMap: { [key: string]: string } = {
      "Content Creator": "from-emerald-500 to-teal-600",
      "Social Media Manager": "from-purple-500 to-pink-600",
      "Business Assistant": "from-blue-500 to-indigo-600"
    };
    return colorMap[agentName] || "from-gray-500 to-gray-600";
  };

  const getAgentSkills = (agentName: string) => {
    const skillsMap: { [key: string]: string[] } = {
      "Content Creator": ["✍ Writing", "📈 SEO", "📝 Blogging"],
      "Social Media Manager": ["📱 Social", "📊 Analytics", "🎯 Engagement"],
      "Business Assistant": ["📧 Email", "📋 Tasks", "📊 Reports"]
    };
    return skillsMap[agentName] || ["🤖 AI", "⚡ Automation", "📊 Data"];
  };

  const getAgentTasks = (agentName: string) => {
    const tasksMap: { [key: string]: string[] } = {
      "Content Creator": [
        "Blog post writing",
        "SEO optimization",
        "Newsletter creation",
        "Product descriptions",
        "Content editing"
      ],
      "Social Media Manager": [
        "Post scheduling",
        "Caption writing",
        "Hashtag generation",
        "Analytics reporting",
        "Engagement monitoring"
      ],
      "Business Assistant": [
        "Email drafting",
        "Document summaries",
        "Report generation",
        "Schedule management",
        "Meeting notes"
      ]
    };
    return tasksMap[agentName] || ["AI assistance", "Task automation", "Content creation"];
  };

  const getAgentIntegrations = (agentName: string) => {
    const integrationsMap: { [key: string]: string[] } = {
      "Content Creator": [
        "Google Docs",
        "WordPress",
        "Medium",
        "Notion",
        "Grammarly"
      ],
      "Social Media Manager": [
        "Instagram",
        "Facebook",
        "Twitter",
        "LinkedIn",
        "TikTok"
      ],
      "Business Assistant": [
        "Gmail",
        "Outlook",
        "Slack",
        "Microsoft Office",
        "Google Calendar"
      ]
    };
    return integrationsMap[agentName] || ["Email", "Calendar", "Document tools"];
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
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-500" />);
      }
    }
    return stars;
  };

  const handleTaskToggle = (task: string) => {
    setSelectedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const handleIntegrationToggle = (integration: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integration) 
        ? prev.filter(i => i !== integration)
        : [...prev, integration]
    );
  };

  const handleNext = () => {
    if (currentStep === 'confirmation') setCurrentStep('setup');
    else if (currentStep === 'setup') setCurrentStep('payment');
    else if (currentStep === 'payment') setCurrentStep('success');
  };

  const handleBack = () => {
    if (currentStep === 'setup') setCurrentStep('confirmation');
    else if (currentStep === 'payment') setCurrentStep('setup');
  };

  const handleClose = () => {
    setCurrentStep('confirmation');
    setSelectedTasks([]);
    setSelectedIntegrations([]);
    setSelectedPlan('monthly');
    onClose();
  };

  const getStepProgress = () => {
    const steps = ['confirmation', 'setup', 'payment', 'success'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-gradient-to-r ${getAgentColor(agent.name)} rounded-xl`}>
                    {getAgentIcon(agent.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Hire {agent.name}</h2>
                    <p className="text-gray-400 text-sm">Step {['confirmation', 'setup', 'payment', 'success'].indexOf(currentStep) + 1} of 4</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getStepProgress()}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {currentStep === 'confirmation' && (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        You're hiring the {agent.name} 🚀
                      </h3>
                      <p className="text-gray-400">Let's get you set up with your new AI assistant</p>
                    </div>

                    {/* Agent Profile Card */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-3 bg-gradient-to-r ${getAgentColor(agent.name)} rounded-lg`}>
                          {getAgentIcon(agent.name)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(agent.rating)}
                            </div>
                            <span className="text-gray-400 text-sm">
                              {formatRating(agent.rating)} ({agent.reviewCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{agent.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {getAgentSkills(agent.name).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'setup' && (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Setup & Requirements</h3>
                      <p className="text-gray-400">Tell us what you need help with</p>
                    </div>

                    {/* Tasks Selection */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">What tasks do you want?</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {getAgentTasks(agent.name).map((task, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Checkbox
                              id={`task-${index}`}
                              checked={selectedTasks.includes(task)}
                              onCheckedChange={() => handleTaskToggle(task)}
                            />
                            <label htmlFor={`task-${index}`} className="text-gray-300 cursor-pointer">
                              {task}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Integrations Selection */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Integrations needed?</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {getAgentIntegrations(agent.name).map((integration, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Checkbox
                              id={`integration-${index}`}
                              checked={selectedIntegrations.includes(integration)}
                              onCheckedChange={() => handleIntegrationToggle(integration)}
                            />
                            <label htmlFor={`integration-${index}`} className="text-gray-300 cursor-pointer text-sm">
                              {integration}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Choose Your Plan</h3>
                      <p className="text-gray-400">Select the plan that works best for you</p>
                    </div>

                    {/* Plan Selection */}
                    <div className="grid grid-cols-1 gap-4">
                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === 'monthly'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedPlan('monthly')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">Monthly Plan</h4>
                            <p className="text-gray-400 text-sm">Unlimited tasks and priority support</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">${(agent.price / 100).toFixed(0)}</p>
                            <p className="text-gray-400 text-sm">per month</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === 'per-task'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedPlan('per-task')}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-white">Pay Per Task</h4>
                            <p className="text-gray-400 text-sm">Pay only for what you use</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">$5</p>
                            <p className="text-gray-400 text-sm">per task</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-3">Payment Method</h4>
                      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-300">Credit Card / PayPal</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Your agent is ready! 🎉</h3>
                      <p className="text-gray-400">Your {agent.name} has been successfully hired and is ready to help you.</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <h4 className="font-semibold text-white mb-2">What's next?</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Your agent will be available in your dashboard</li>
                        <li>• You can start assigning tasks immediately</li>
                        <li>• Get priority support and updates</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex justify-between">
                {currentStep !== 'confirmation' && currentStep !== 'success' && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                
                {currentStep === 'success' ? (
                  <Button
                    onClick={handleClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={currentStep === 'setup' && selectedTasks.length === 0}
                    className={`bg-gradient-to-r ${getAgentColor(agent.name)} hover:opacity-90 text-white`}
                  >
                    {currentStep === 'payment' ? 'Complete Payment' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 