import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Brain, 
  Settings, 
  Code, 
  Palette, 
  Rocket,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Users,
  TrendingUp
} from "lucide-react";

const CUSTOMIZATION_OPTIONS = [
  {
    id: "personality",
    title: "Personality & Tone",
    description: "Define how your agent communicates and behaves",
    icon: Brain,
    options: ["Professional", "Friendly", "Technical", "Creative", "Casual"]
  },
  {
    id: "capabilities",
    title: "Core Capabilities",
    description: "Select the main functions your agent will perform",
    icon: Zap,
    options: ["Content Creation", "Data Analysis", "Customer Support", "Sales", "Project Management"]
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect with your existing tools and platforms",
    icon: Settings,
    options: ["Slack", "Notion", "Google Workspace", "Salesforce", "HubSpot"]
  },
  {
    id: "customization",
    title: "Custom Features",
    description: "Add unique functionality specific to your needs",
    icon: Code,
    options: ["Custom API", "Specialized Training", "Unique Workflows", "Brand Voice", "Industry Knowledge"]
  }
];

const INDUSTRY_TEMPLATES = [
  {
    name: "E-commerce",
    description: "Product recommendations, inventory management, customer support",
    icon: "🛒",
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "SaaS",
    description: "User onboarding, feature adoption, technical support",
    icon: "💻",
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Marketing",
    description: "Content creation, campaign management, analytics",
    icon: "📈",
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Finance",
    description: "Risk assessment, compliance monitoring, reporting",
    icon: "💰",
    color: "from-yellow-500 to-orange-600"
  },
  {
    name: "Healthcare",
    description: "Patient scheduling, medical records, appointment reminders",
    icon: "🏥",
    color: "from-red-500 to-rose-600"
  },
  {
    name: "Education",
    description: "Student support, course management, learning analytics",
    icon: "🎓",
    color: "from-indigo-500 to-blue-600"
  }
];

export default function CustomAgent() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, string[]>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const handleCustomizationChange = (categoryId: string, option: string) => {
    setCustomizations(prev => {
      const current = prev[categoryId] || [];
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option];
      return { ...prev, [categoryId]: updated };
    });
  };

  const getTotalPrice = () => {
    let basePrice = 299;
    const customizationCount = Object.values(customizations).flat().length;
    return basePrice + (customizationCount * 50);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <BackgroundEffects />
      
      {/* Hero Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-purple-300 font-bold text-sm tracking-wider">
                CUSTOM AI SOLUTION
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="text-white font-extralight">BUILD YOUR</span>
              <br />
              <span className="text-gradient-electric font-black">DREAM AGENT</span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Create a completely customized AI agent tailored to your business needs, 
              industry requirements, and unique workflows
            </motion.p>
          </motion.div>

          {/* Industry Templates */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Industry Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRY_TEMPLATES.map((template, index) => (
                <motion.div
                  key={template.name}
                  className={`relative cursor-pointer group ${
                    selectedTemplate === template.name ? 'ring-2 ring-purple-500' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template.name)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${template.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl`}>
                          {template.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{template.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Customization Options */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">Customize Your Agent</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {CUSTOMIZATION_OPTIONS.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-white">{category.title}</CardTitle>
                      </div>
                      <p className="text-gray-400 text-sm">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {category.options.map((option) => (
                          <Badge
                            key={option}
                            variant={customizations[category.id]?.includes(option) ? "default" : "secondary"}
                            className={`cursor-pointer transition-all ${
                              customizations[category.id]?.includes(option)
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            onClick={() => handleCustomizationChange(category.id, option)}
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing & CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 backdrop-blur-xl p-12 rounded-3xl border border-purple-500/20 shadow-2xl max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">Custom Agent Pricing</h3>
              <div className="text-6xl font-black text-purple-400 mb-6">
                ${getTotalPrice()}
                <span className="text-2xl text-gray-400 font-normal">/month</span>
              </div>
              <p className="text-gray-300 mb-8">
                Includes setup, training, and ongoing support for your custom AI solution
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setLocation("/dashboard")}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl border-0"
                  size="lg"
                >
                  <Rocket className="w-5 h-5 mr-3" />
                  START BUILDING
                  <ArrowRight className="w-5 h-5 ml-3" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
