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
  Search, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Star,
  Clock,
  DollarSign
} from "lucide-react";

const RECOMMENDATION_QUESTIONS = [
  {
    id: "business-type",
    question: "What type of business do you run?",
    options: ["E-commerce", "SaaS", "Agency", "Consulting", "Manufacturing", "Healthcare", "Education", "Other"]
  },
  {
    id: "team-size",
    question: "How large is your team?",
    options: ["1-5 people", "6-20 people", "21-50 people", "51-100 people", "100+ people"]
  },
  {
    id: "main-challenge",
    question: "What's your biggest challenge right now?",
    options: ["Customer Support", "Content Creation", "Lead Generation", "Data Analysis", "Project Management", "Sales", "Marketing", "Operations"]
  },
  {
    id: "budget",
    question: "What's your monthly budget for AI tools?",
    options: ["$0-100", "$100-500", "$500-1000", "$1000-2500", "$2500+"]
  }
];

const RECOMMENDED_AGENTS = [
  {
    id: "1",
    name: "Content Creator Pro",
    specialty: "High-volume content generation",
    match: 95,
    price: 199,
    features: ["SEO Optimization", "Brand Voice", "Multi-format", "Analytics"],
    description: "Perfect for businesses needing consistent, high-quality content across multiple channels."
  },
  {
    id: "2",
    name: "Customer Success Expert",
    specialty: "24/7 customer support",
    match: 92,
    price: 149,
    features: ["Ticket Resolution", "Knowledge Base", "Escalation", "Reporting"],
    description: "Ideal for companies with high customer support volume and complex inquiries."
  },
  {
    id: "3",
    name: "Sales Accelerator",
    specialty: "Lead qualification & follow-up",
    match: 88,
    price: 179,
    features: ["Lead Scoring", "Follow-up Automation", "CRM Integration", "Performance Tracking"],
    description: "Best for sales teams looking to automate repetitive tasks and improve conversion rates."
  }
];

export default function AgentRecommender() {
  const [, setLocation] = useLocation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < RECOMMENDATION_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowRecommendations(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / RECOMMENDATION_QUESTIONS.length) * 100;
  };

  const canProceed = () => {
    return answers[RECOMMENDATION_QUESTIONS[currentQuestion]?.id] !== undefined;
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
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-300 font-bold text-sm tracking-wider">
                AI RECOMMENDATION ENGINE
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-7xl font-black mb-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <span className="text-white font-extralight">FIND YOUR</span>
              <br />
              <span className="text-gradient-electric font-black">PERFECT AGENT</span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Answer a few questions and get personalized AI agent recommendations 
              tailored to your business needs and goals
            </motion.p>
          </motion.div>

          {!showRecommendations ? (
            /* Question Flow */
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Question {currentQuestion + 1} of {RECOMMENDATION_QUESTIONS.length}</span>
                  <span className="text-sm text-gray-400">{Math.round(getProgress())}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Current Question */}
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-white mb-4">
                    {RECOMMENDATION_QUESTIONS[currentQuestion]?.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {RECOMMENDATION_QUESTIONS[currentQuestion]?.options.map((option) => (
                      <motion.div
                        key={option}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={answers[RECOMMENDATION_QUESTIONS[currentQuestion]?.id] === option ? "default" : "outline"}
                          className={`w-full h-auto p-4 text-left justify-start ${
                            answers[RECOMMENDATION_QUESTIONS[currentQuestion]?.id] === option
                              ? 'bg-green-600 hover:bg-green-700 border-green-600'
                              : 'bg-transparent border-gray-600 hover:border-green-500 hover:bg-green-500/10'
                          }`}
                          onClick={() => handleAnswer(RECOMMENDATION_QUESTIONS[currentQuestion]?.id, option)}
                        >
                          {option}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentQuestion === 0}
                      className="border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400"
                    >
                      Back
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {currentQuestion === RECOMMENDATION_QUESTIONS.length - 1 ? 'Get Recommendations' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* Recommendations */
            <motion.div
              className="max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-4xl font-bold text-white mb-4">Your Personalized Recommendations</h2>
                <p className="text-xl text-gray-300">
                  Based on your answers, here are the AI agents that best match your needs
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                {RECOMMENDED_AGENTS.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:border-green-500/50 transition-all h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
                          <Badge className="bg-green-600 text-white">
                            {agent.match}% Match
                          </Badge>
                        </div>
                        <p className="text-gray-400">{agent.specialty}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 leading-relaxed">{agent.description}</p>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-white">Key Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {agent.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="bg-gray-800 text-gray-300">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                          <div className="text-3xl font-bold text-green-400">
                            ${agent.price}
                            <span className="text-sm text-gray-400 font-normal">/mo</span>
                          </div>
                          <Button 
                            onClick={() => setLocation("/marketplace")}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 backdrop-blur-xl p-12 rounded-3xl border border-green-500/20 shadow-2xl max-w-2xl mx-auto">
                  <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
                  <p className="text-gray-300 mb-8">
                    Choose from our recommendations or explore our full marketplace to find the perfect AI agent for your business.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setLocation("/marketplace")}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Browse Marketplace
                    </Button>
                    
                    <Button 
                      onClick={() => setLocation("/custom-agent")}
                      variant="outline"
                      className="border-2 border-green-500/30 text-green-400 hover:border-green-500 hover:bg-green-500/10 px-8 py-3 rounded-xl font-bold"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Build Custom
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
} 