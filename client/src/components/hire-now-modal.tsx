import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Star, CreditCard, Settings, Rocket } from "lucide-react";

interface HireNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
  gradientClass: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 'confirmation',
    title: 'Confirm Your Choice',
    description: 'Review the agent details and confirm your selection'
  },
  {
    id: 'setup',
    title: 'Setup Requirements',
    description: 'Tell us about your specific needs and integrations'
  },
  {
    id: 'payment',
    title: 'Choose Your Plan',
    description: 'Select the perfect plan for your business'
  },
  {
    id: 'success',
    title: 'You\'re All Set!',
    description: 'Your agent is ready to start working for you'
  }
];

export default function HireNowModal({ isOpen, onClose, agent, gradientClass }: HireNowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setSelectedTasks([]);
    setSelectedIntegrations([]);
    setSelectedPlan('monthly');
    onClose();
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

  const availableTasks = [
    'Content Creation',
    'SEO Optimization',
    'Social Media Management',
    'Email Drafting',
    'Report Generation',
    'Schedule Management',
    'Analytics & Insights',
    'Campaign Planning'
  ];

  const availableIntegrations = [
    'Google Docs',
    'Notion',
    'WordPress',
    'HubSpot',
    'Slack',
    'Trello',
    'Asana',
    'Zapier'
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: (agent.price / 100).toFixed(0),
      period: 'month',
      popular: false
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: ((agent.price * 2.5) / 100).toFixed(0),
      period: 'quarter',
      popular: true,
      savings: 'Save 17%'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: ((agent.price * 9) / 100).toFixed(0),
      period: 'year',
      popular: false,
      savings: 'Save 25%'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Confirmation
        return (
          <div className="text-center">
            <motion.div
              className={`w-20 h-20 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mx-auto mb-6`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              You're hiring the {agent.name} 🚀
            </h3>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(agent.rating / 10) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                  ))}
                  <span className="text-sm text-gray-400 ml-2">({agent.reviewCount})</span>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {getAgentSkills(agent.name).map((skill, index) => (
                  <span key={skill} className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">
              This agent will work 24/7 to help you achieve your goals. Ready to get started?
            </p>
          </div>
        );

      case 1: // Setup
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">What tasks do you need help with?</h3>
              <p className="text-gray-400 text-sm mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {availableTasks.map((task) => (
                  <button
                    key={task}
                    onClick={() => {
                      setSelectedTasks(prev => 
                        prev.includes(task) 
                          ? prev.filter(t => t !== task)
                          : [...prev, task]
                      );
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      selectedTasks.includes(task)
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <div className="text-sm font-medium">{task}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Which integrations do you need?</h3>
              <p className="text-gray-400 text-sm mb-4">Connect your existing tools</p>
              <div className="grid grid-cols-2 gap-3">
                {availableIntegrations.map((integration) => (
                  <button
                    key={integration}
                    onClick={() => {
                      setSelectedIntegrations(prev => 
                        prev.includes(integration) 
                          ? prev.filter(i => i !== integration)
                          : [...prev, integration]
                      );
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                      selectedIntegrations.includes(integration)
                        ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                        : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <div className="text-sm font-medium">{integration}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Payment
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Choose your plan</h3>
              <p className="text-gray-400 text-sm mb-6">Select the plan that works best for you</p>
              
              <div className="space-y-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                      selectedPlan === plan.id
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{plan.name}</span>
                          {plan.popular && (
                            <span className="px-2 py-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-xs text-white rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">
                          ${plan.price}/{plan.period}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">${plan.price}</div>
                        <div className="text-gray-400 text-sm">per {plan.period}</div>
                        {plan.savings && (
                          <div className="text-cyan-400 text-xs">{plan.savings}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-semibold">
                  ${plans.find(p => p.id === selectedPlan)?.price}/{plans.find(p => p.id === selectedPlan)?.period}
                </span>
              </div>
            </div>
          </div>
        );

      case 3: // Success
        return (
          <div className="text-center">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Your agent is ready! 🎉
            </h3>
            
            <p className="text-gray-400 text-sm mb-6">
              {agent.name} has been successfully deployed and is ready to start working for you.
            </p>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">What happens next:</div>
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li>• Your agent will be available in your dashboard</li>
                <li>• You'll receive a welcome email with setup instructions</li>
                <li>• Your agent will start working on your selected tasks</li>
                <li>• You can monitor progress and adjust settings anytime</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">Hire {agent.name}</h2>
                <p className="text-sm text-gray-400">{steps[currentStep].description}</p>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index <= currentStep
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          index < currentStep ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-white/10">
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant="outline"
                className="bg-transparent border border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
              >
                Back
              </Button>
              
              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleClose}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Go to Dashboard
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