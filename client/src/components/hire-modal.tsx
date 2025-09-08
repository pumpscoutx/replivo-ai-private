import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Check, 
  Star, 
  Shield, 
  CreditCard, 
  Zap, 
  ArrowRight, 
  Download, 
  Chrome, 
  Settings, 
  Link, 
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Hash,
  Mail,
  Share2,
  BarChart3,
  Target,
  MessageSquare,
  Globe,
  Database,
  Workflow,
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useHiringFlow } from "@/HiringFlow/hooks/useHiringFlow";

interface HireModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  annualPrice: number;
  features: string[];
  popular: boolean;
  color: string;
}

interface Task {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
}

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  oauth: boolean;
}

export default function HireModal({ isOpen, onClose, agent }: HireModalProps) {
  const flow = useHiringFlow({ id: agent?.id || agent?.name || 'agent', name: agent?.name });
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>("medium");
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [pairingProgress, setPairingProgress] = useState(0);
  const recommendedPlanId = 'professional';
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'disconnected' | 'connected' | 'testing'>>({});

  // Pricing Plans
  const pricingPlans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Monthly',
      description: 'Billed monthly',
      price: 99,
      annualPrice: 99,
      features: [
        'Real-time browser automation',
        'Secure command execution',
        '24/7 agent availability',
        'Task completion reporting',
        'Premium support',
        'Chrome extension access'
      ],
      popular: false,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      description: 'Save 15%',
      price: 990,
      annualPrice: 990,
      features: [
        'Real-time browser automation',
        'Secure command execution',
        '24/7 agent availability',
        'Task completion reporting',
        'Premium support',
        'Chrome extension access'
      ],
      popular: true,
      color: 'from-amber-400 to-orange-500'
    }
  ];

  // Task Categories
  const taskCategories = [
    {
      id: 'content',
      name: 'Content Creation',
      icon: <FileText className="w-8 h-8" />,
      tasks: [
        { id: 'blog', name: 'Blog posts', description: 'SEO-optimized articles', estimatedTime: '2-4 hours', priority: 'medium' },
        { id: 'social', name: 'Social media', description: 'Platform-specific content', estimatedTime: '1-2 hours', priority: 'medium' },
        { id: 'email', name: 'Email campaigns', description: 'Newsletter and marketing emails', estimatedTime: '1-3 hours', priority: 'medium' }
      ]
    },
    {
      id: 'seo',
      name: 'SEO Optimization',
      icon: <Hash className="w-8 h-8" />,
      tasks: [
        { id: 'keywords', name: 'Keyword research', description: 'Target keyword analysis', estimatedTime: '1-2 hours', priority: 'medium' },
        { id: 'onpage', name: 'On-page SEO', description: 'Content optimization', estimatedTime: '2-3 hours', priority: 'medium' },
        { id: 'links', name: 'Link building', description: 'Backlink strategy', estimatedTime: '3-5 hours', priority: 'high' }
      ]
    },
    {
      id: 'analytics',
      name: 'Data Analysis',
      icon: <BarChart3 className="w-8 h-8" />,
      tasks: [
        { id: 'reports', name: 'Reports & insights', description: 'Performance analytics', estimatedTime: '1-2 hours', priority: 'medium' },
        { id: 'visualization', name: 'Data visualization', description: 'Charts and graphs', estimatedTime: '2-3 hours', priority: 'medium' },
        { id: 'research', name: 'Market research', description: 'Competitor analysis', estimatedTime: '3-4 hours', priority: 'high' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing Strategy',
      icon: <Target className="w-8 h-8" />,
      tasks: [
        { id: 'campaigns', name: 'Campaign planning', description: 'Multi-channel strategies', estimatedTime: '2-4 hours', priority: 'medium' },
        { id: 'brand', name: 'Brand strategy', description: 'Brand positioning', estimatedTime: '3-5 hours', priority: 'high' },
        { id: 'tracking', name: 'Performance tracking', description: 'ROI measurement', estimatedTime: '1-2 hours', priority: 'medium' }
      ]
    },
    {
      id: 'support',
      name: 'Customer Support',
      icon: <MessageSquare className="w-8 h-8" />,
      tasks: [
        { id: 'chat', name: 'Live chat support', description: 'Real-time customer service', estimatedTime: '24/7', priority: 'high' },
        { id: 'email', name: 'Email support', description: 'Ticket management', estimatedTime: '2-4 hours', priority: 'medium' },
        { id: 'docs', name: 'Documentation', description: 'Help center content', estimatedTime: '3-5 hours', priority: 'medium' }
      ]
    },
    {
      id: 'business',
      name: 'Business Operations',
      icon: <Workflow className="w-8 h-8" />,
      tasks: [
        { id: 'finance', name: 'Financial analysis', description: 'Budget and forecasting', estimatedTime: '2-3 hours', priority: 'medium' },
        { id: 'automation', name: 'Process automation', description: 'Workflow optimization', estimatedTime: '3-5 hours', priority: 'high' },
        { id: 'optimization', name: 'System optimization', description: 'Performance improvement', estimatedTime: '2-4 hours', priority: 'medium' }
      ]
    }
  ];

  // Popular Integrations
  const popularIntegrations: Integration[] = [
    { id: 'google', name: 'Google Workspace', icon: '', description: 'Docs, Sheets, Drive', connected: false, oauth: true },
    { id: 'slack', name: 'Slack', icon: '', description: 'Team communication', connected: false, oauth: true },
    { id: 'hubspot', name: 'HubSpot', icon: '', description: 'CRM and marketing', connected: false, oauth: true },
    { id: 'shopify', name: 'Shopify', icon: '', description: 'E-commerce platform', connected: false, oauth: true },
    { id: 'wordpress', name: 'WordPress', icon: '', description: 'Content management', connected: false, oauth: true },
    { id: 'notion', name: 'Notion', icon: '', description: 'Knowledge management', connected: false, oauth: true },
    { id: 'asana', name: 'Asana', icon: '', description: 'Project management', connected: false, oauth: true },
    { id: 'mailchimp', name: 'Mailchimp', icon: '', description: 'Email marketing', connected: false, oauth: true },
    { id: 'analytics', name: 'Google Analytics', icon: '', description: 'Website analytics', connected: false, oauth: true },
    { id: 'zapier', name: 'Zapier', icon: '', description: 'Workflow automation', connected: false, oauth: true }
  ];

  const handleNextStep = async () => {
    if (currentStep === 1) {
      try {
        await flow.startHiring(flow.state.selectedAgent?.id || agent.id, billingCycle === 'annual' ? 'yearly' : 'monthly');
      } catch (e) { /* noop for demo */ }
    }
    if (currentStep === 2) {
      try {
        const price = billingCycle === 'annual' ? pricingPlans[1].annualPrice * 12 : pricingPlans[1].price;
        await flow.processPayment(price);
      } catch (e) { /* noop */ }
    }
    if (currentStep === 4) {
      try {
        await flow.saveConfiguration(agent.id, selectedTasks.map(id => ({ id })), selectedIntegrations.map(id => ({ id, name: id })));
      } catch (e) { /* noop */ }
    }
    if (currentStep < 5) {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsProcessing(false);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleIntegrationToggle = (integrationId: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId) 
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const simulateExtensionInstallation = async () => {
    setExtensionInstalled(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate pairing process
    for (let i = 0; i <= 100; i += 10) {
      setPairingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setExtensionConnected(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/80 transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Hire {agent.name}</h2>
                  <p className="text-slate-400">Complete your AI workforce setup</p>
                  <div className="text-xs text-slate-400 mt-1">Step {currentStep} of 5</div>
                </div>

                {/* Trust Badges */}
                <div className="hidden md:flex items-center gap-3 mr-6">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-emerald-500/15 border border-emerald-400/20">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-medium">Secure Payment</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-blue-500/15 border border-blue-400/20">
                    <Clock className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-blue-300 text-xs font-medium">30‑Day Guarantee</span>
                  </div>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div key={step} className="flex items-center">
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                          step <= currentStep 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                            : 'bg-slate-700 text-slate-400'
                        }`}
                        animate={step === currentStep ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {step < currentStep ? <Check className="w-4 h-4" /> : step}
                      </motion.div>
                      {step < 5 && (
                        <div className={`w-8 h-0.5 mx-2 ${step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-slate-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="px-8 py-6">
              {currentStep === 1 && (
                /* Step 1: Plan Selection */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h3>
                    <p className="text-slate-400 text-lg">Simple pricing. Powerful agents.</p>
                  </div>

                  {/* Two-card layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {pricingPlans.map((plan, index) => {
                      const active = (plan.id === 'yearly' && billingCycle === 'annual') || (plan.id === 'monthly' && billingCycle === 'monthly');
                      return (
                      <motion.div
                        key={plan.id}
                          className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-md bg-white/5 ${
                            active ? 'border-cyan-400/60 shadow-[0_0_40px_-10px_rgba(34,211,238,.6)]' : 'border-white/10 hover:border-white/20'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4, scale: 1.01 }}
                          onClick={() => setBillingCycle(plan.id === 'yearly' ? 'annual' : 'monthly')}
                        >
                          {plan.popular && plan.id === 'yearly' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                              MOST POPULAR
                          </div>
                        )}

                        <div className="text-center">
                            <h4 className="text-2xl font-bold text-white mb-1">{plan.name}</h4>
                          <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                          
                          <div className="mb-6">
                              <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                              <span className="ml-1 text-slate-400 text-sm">{plan.id === 'yearly' ? '/year' : '/month'}</span>
                          </div>

                            <ul className="space-y-3 text-left max-w-sm mx-auto">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center space-x-3 text-sm text-slate-300">
                                  <Check className="w-4 h-4 text-green-400" />
                                <span>{feature}</span>
                                </li>
                            ))}
                          </ul>

                            <Button
                              className={`mt-6 w-full bg-gradient-to-r ${active ? 'from-cyan-500 to-blue-600' : 'from-white/10 to-white/5'} text-white`}
                            >
                              {active ? 'Selected' : 'Select Plan'}
                            </Button>
                          </div>
                    </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                /* Step 2: Payment Integration */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white"> Secure Checkout</h3>
                    <p className="text-slate-400 text-lg">Complete your purchase securely • Step 2 of 5</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-slate-800/50 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-white mb-4">Order Summary</h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                            {agent.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{agent.name} - Professional Plan</div>
                            <div className="text-sm text-slate-400">
                              ${billingCycle === 'annual' ? pricingPlans[1].annualPrice : pricingPlans[1].price}/month
                              {billingCycle === 'annual' && ' (billed annually)'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-slate-700 pt-4">
                          <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Next billing: March 3, 2026</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-white">
                            <span>Total:</span>
                            <span>
                              ${billingCycle === 'annual' 
                                ? pricingPlans[1].annualPrice * 12 
                                : pricingPlans[1].price
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Form */}
                    <div className="bg-slate-800/50 rounded-2xl p-6">
                      <h4 className="text-xl font-bold text-white mb-4">Payment Method</h4>
                      
                      {/* Payment Options */}
                      <div className="flex space-x-2 mb-6">
                        <button className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors">
                           Card
                        </button>
                        <button className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors">
                           PayPal
                        </button>
                        <button className="flex-1 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium transition-colors">
                           Bank
                        </button>
                      </div>

                      {/* Stripe-like Form */}
                      <div className="space-y-4">
                        <Input
                          placeholder="Card number"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="MM/YY"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                          <Input
                            placeholder="CVC"
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                        <Input
                          placeholder="Cardholder name"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      {/* Trust Elements */}
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span>SSL encrypted & secure</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>30-day money-back guarantee</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment CTA */}
                  <div className="text-center">
                    <Button onClick={handleNextStep} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3">
                      Complete Purchase
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                /* Step 3: Task Selection */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white">Select Your Tasks</h3>
                    <p className="text-slate-400 text-lg">Choose what you want your AI agent to help with • Step 3 of 5</p>
                  </div>

                  {/* Search and Filter */}
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search tasks..."
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {/* Priority Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-sm">Priority:</span>
                    <div className="flex gap-2">
                      {(['low','medium','high'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => setTaskPriority(p)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                            taskPriority === p ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {p.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Task Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {taskCategories.map((category, categoryIndex) => (
                      <motion.div
                        key={category.id}
                        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: categoryIndex * 0.1 }}
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{category.name}</h4>
                            <p className="text-sm text-slate-400">{category.tasks.length} tasks</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {category.tasks
                            .filter(t => t.name.toLowerCase().includes(taskSearch.toLowerCase()))
                            .map((task) => (
                            <motion.div
                              key={task.id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                selectedTasks.includes(task.id)
                                  ? 'border-blue-500 bg-blue-500/10'
                                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              onClick={() => handleTaskToggle(task.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-white">{task.name}</div>
                                  <div className="text-sm text-slate-400">{task.description}</div>
                                  <div className="text-xs text-slate-500 mt-1">Est. {task.estimatedTime} • Priority: {taskPriority.toUpperCase()}</div>
                                </div>
                                <div className="text-xs text-slate-500">{task.estimatedTime}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Custom Task */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="font-bold text-white mb-4">Add Custom Task</h4>
                    <div className="flex space-x-4">
                      <Input
                        placeholder="Describe your custom task..."
                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                      />
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                /* Step 4: Tools Integration */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">Connect Your Tools</h3>
                    <p className="text-slate-400 text-lg">Integrate with your favorite apps and services • Step 4 of 5</p>
                  </div>

                  {/* Popular Integrations */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4"> Quick Setup (OAuth)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {popularIntegrations.map((integration, index) => (
                        <motion.div
                          key={integration.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            selectedIntegrations.includes(integration.id)
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                          }`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleIntegrationToggle(integration.id)}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{integration.icon}</div>
                            <div className="text-sm font-medium text-white">{integration.name}</div>
                            <div className="text-xs text-slate-400">{integration.description}</div>
                            <div className="mt-2">
                              {selectedIntegrations.includes(integration.id) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIntegrationStatus(prev => ({ ...prev, [integration.id]: 'testing' }));
                                    setTimeout(() => setIntegrationStatus(prev => ({ ...prev, [integration.id]: 'connected' })), 800);
                                  }}
                                >
                                  {integrationStatus[integration.id] === 'testing' ? 'Testing…' : integrationStatus[integration.id] === 'connected' ? 'Connected' : 'Test Connection'}
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-500">OAuth quick setup</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Integrations */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="text-xl font-bold text-white mb-4"> Custom Integrations</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Tool Name"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                        <Input
                          placeholder="API URL"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option>API Key</option>
                          <option>OAuth</option>
                          <option>Webhook</option>
                        </select>
                        <Button variant="outline" className="border-slate-600 text-slate-300">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Another Tool
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Integration */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h4 className="text-xl font-bold text-white mb-4"> Workspace Integration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Website URL"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="CRM Platform"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Email Platform"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        placeholder="Analytics ID"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                /* Step 5: Chrome Extension */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-4"> Install Your AI Assistant</h3>
                    <p className="text-slate-400 text-lg">Get the Chrome extension for seamless integration • Step 5 of 5</p>
                  </div>

                  {!extensionInstalled ? (
                    /* Download Extension */
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                          <Chrome className="w-10 h-10 text-white" />
                        </div>
                        
                        <h4 className="text-2xl font-bold text-white mb-4">Content Creator Pro Extension</h4>
                        <div className="space-y-3 text-slate-300 mb-8">
                          <div className="flex items-center justify-center space-x-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Works on any website</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Right-click context menu</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <Check className="w-4 h-4 text-green-400" />
                            <span>Floating AI assistant</span>
                          </div>
                        </div>

                        <Button
                          onClick={simulateExtensionInstallation}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 text-lg font-semibold"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download & Install
                        </Button>
                      </div>
                    </div>
                  ) : !extensionConnected ? (
                    /* Pairing Process */
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
                        <div className="text-center mb-6">
                          <motion.div
                            className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Bot className="w-8 h-8 text-white" />
                          </motion.div>
                          <h4 className="text-xl font-bold text-white mb-2"> Connecting your agent...</h4>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-slate-300">Extension detected</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <span className="text-slate-300">Establishing secure connection</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <span className="text-slate-300">Syncing your preferences</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <span className="text-slate-300">Loading task configurations</span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${pairingProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          <div className="text-center text-sm text-slate-400 mt-2">
                            {pairingProgress}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Success State */
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 text-center">
                        <motion.div
                          className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check className="w-10 h-10 text-white" />
                        </motion.div>
                        
                        <h4 className="text-2xl font-bold text-white mb-4"> Content Creator Pro is ready!</h4>
                        <p className="text-slate-400 mb-8">Your AI assistant is now connected and ready to help you create amazing content.</p>

                        <div className="flex space-x-4 justify-center">
                          <Button
                            onClick={() => {
                              onClose();
                              // Navigate to dashboard
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3"
                          >
                            Launch Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            className="border-slate-600 text-slate-300 px-6 py-3"
                          >
                            Take Quick Tour
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="px-8 py-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-slate-600 text-slate-300 disabled:opacity-50"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Lock className="w-4 h-4" />
                  <span>Secure & encrypted</span>
                </div>

                {currentStep < 5 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6"
                  >
                    Complete Setup
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
