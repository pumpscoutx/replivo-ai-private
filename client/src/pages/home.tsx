import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AgentCard from "@/components/agent-card";
import AgentRecommender from "@/components/agent-recommender";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BackgroundEffects from "@/components/background-effects";
import CursorEffects from "@/components/cursor-effects";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import type { Agent } from "@shared/schema";
import { COMPANY_LOGOS } from "@/lib/constants";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: featuredAgents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents/featured"]
  });

  const scrollToAgents = () => {
    const agentsSection = document.getElementById("agents");
    agentsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black">
      <BackgroundEffects />
      <CursorEffects />
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black pt-16 pb-32">
        <div className="absolute inset-0 bg-gradient-mesh floating-shapes"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <motion.div 
              className="text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="inline-block bg-gray-800/40 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-gray-600/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="text-gray-300 font-medium text-sm">⚡ Trusted by 10,000+ businesses worldwide</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-neiko font-black text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                HIRE SMART
                <br />
                <span className="text-gradient bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
                  AI AGENTS
                </span>
                <br />
                THAT WORK 24/7
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Transform your business with intelligent agents that automate marketing, analytics, support, and more. 
                <span className="font-bold text-gray-100">Save 40+ hours per week</span> on repetitive tasks.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={() => setLocation("/login")}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg font-neiko font-bold text-lg transition-all transform hover:scale-105 shadow-xl border border-blue-500"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  GET STARTED
                </Button>
                <Button 
                  onClick={scrollToAgents}
                  variant="outline"
                  className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800/50 backdrop-blur-md px-8 py-4 rounded-lg font-neiko font-bold text-lg transition-all"
                >
                  <i className="fas fa-eye mr-2"></i>
                  VIEW AGENTS
                </Button>
              </motion.div>

              <motion.div 
                className="flex items-center mt-8 space-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-gray-300">
                  <p className="font-semibold">10,000+ happy customers</p>
                  <div className="flex items-center">
                    <div className="flex text-gray-400 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i key={star} className="fas fa-star text-sm"></i>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">4.9/5 rating</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <div className="relative">
                <motion.img 
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="AI Dashboard"
                  className="rounded-3xl shadow-2xl border-4 border-gray-600/50 backdrop-blur-sm"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Floating Cards */}
                <motion.div 
                  className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200"
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-chart-line text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">Revenue Up</p>
                      <p className="text-green-600 font-bold">+234%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-gray-200"
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">AI Agents</p>
                      <p className="text-blue-600 font-bold">24/7 Active</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trusted By Section - Moving Logos */}
        <motion.div 
          className="mt-20 text-center bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 border border-gray-700/50 max-w-6xl mx-auto overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-gray-300 mb-8 text-sm uppercase tracking-wider font-semibold font-neiko">TRUSTED BY INDUSTRY LEADERS</p>
          <div className="relative">
            <div className="flex space-x-12 moving-logos">
              {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="flex flex-col items-center space-y-2 group flex-shrink-0"
                >
                  <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center group-hover:bg-gray-700/50 transition-all border border-gray-600/30">
                    <i className={`${company.icon} text-3xl text-gray-300`}></i>
                  </div>
                  <span className="font-semibold text-gray-400 text-sm font-neiko">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Main Agents Section */}
      <section id="agents" className="py-32 bg-gray-900 relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block bg-gray-800/50 text-gray-300 rounded-full px-6 py-2 mb-6 font-semibold text-sm border border-gray-600/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <i className="fas fa-star mr-2"></i>
              MOST POPULAR AGENTS
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-neiko font-black text-white mb-6 leading-tight">
              MEET YOUR NEW
              <br />
              <span className="text-gradient">AI WORKFORCE</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our elite AI agents work around the clock to transform your business operations. 
              Each bundle contains specialized sub-agents that collaborate seamlessly.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {featuredAgents?.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <AgentCard agent={agent} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA for Custom Agent */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 rounded-3xl p-12 overflow-hidden border border-gray-600">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}></div>
              <div className="relative">
                <motion.div
                  className="inline-block bg-gray-700/40 rounded-full px-6 py-2 mb-6 border border-gray-600/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-gray-300 font-bold text-sm font-neiko">
                    <i className="fas fa-magic mr-2"></i>
                    CUSTOM SOLUTIONS AVAILABLE
                  </span>
                </motion.div>
                <h3 className="text-4xl font-neiko font-black text-white mb-4">
                  NEED SOMETHING UNIQUE?
                </h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Our AI experts will design and build a custom agent tailored specifically to your business needs. 
                  From concept to deployment in just 48 hours.
                </p>
                <Button 
                  asChild
                  className="bg-gray-900 text-white hover:bg-gray-800 px-10 py-4 rounded-lg font-neiko font-bold text-lg shadow-xl transition-all transform hover:scale-105 border border-gray-700"
                >
                  <Link href="/custom-agent">
                    <i className="fas fa-wand-magic-sparkles mr-2"></i>
                    BUILD CUSTOM AGENT
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Agent Recommender Section */}
      <AgentRecommender />

      <Footer />
    </div>
  );
}