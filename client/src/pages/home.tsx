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
    <div className="min-h-screen bg-black overflow-hidden">
      <BackgroundEffects />
      <CursorEffects />
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-black pt-20 pb-40">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-mesh"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Center-aligned Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            {/* Enhanced Trust Indicator */}
            <motion.div
              className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-full px-8 py-3 mb-8 border border-cyan-400/30 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="text-cyan-300 font-bold text-lg tracking-wide">
                ⚡ Trusted by 10,000+ businesses worldwide
              </span>
            </motion.div>
            
            {/* Enhanced Main Headline with Better Typography */}
            <motion.h1 
              className="text-6xl md:text-8xl font-neiko font-black text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              HIRE SMART
              <br />
              <span className="text-gradient-electric bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI AGENTS
              </span>
              <br />
              <span className="text-white/90">THAT WORK 24/7</span>
            </motion.h1>
            
            {/* Enhanced Subtext with Better Contrast */}
            <motion.p 
              className="text-2xl md:text-3xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto font-light"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your business with intelligent agents that automate marketing, analytics, support, and more. 
              <br />
              <span className="font-bold text-cyan-300 text-3xl md:text-4xl">Save 40+ hours per week</span> on repetitive tasks.
            </motion.p>
            
            {/* Enhanced CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                onClick={() => setLocation("/login")}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 px-12 py-6 rounded-2xl font-neiko font-bold text-xl transition-all transform hover:scale-105 shadow-2xl border border-cyan-400/30 hover:shadow-cyan-500/25"
              >
                <i className="fas fa-rocket mr-3 text-2xl"></i>
                GET STARTED NOW
              </Button>
              <Button 
                onClick={scrollToAgents}
                variant="outline"
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800/50 backdrop-blur-xl px-12 py-6 rounded-2xl font-neiko font-bold text-xl transition-all hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <i className="fas fa-eye mr-3 text-2xl"></i>
                VIEW AGENTS
              </Button>
            </motion.div>

            {/* Enhanced Social Proof */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.img 
                    key={i}
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000000}?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                    className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
                    alt="User"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-white text-lg">10,000+ happy customers</p>
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="flex text-yellow-400 mr-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.i 
                        key={star} 
                        className="fas fa-star text-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, delay: star * 0.1 }}
                      ></motion.i>
                    ))}
                  </div>
                  <span className="text-lg text-gray-300 font-semibold">4.9/5 rating</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Floating Cards */}
          <motion.div 
            className="relative mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative max-w-4xl mx-auto">
              <motion.img 
                src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="AI Dashboard"
                className="rounded-3xl shadow-2xl border-4 border-gray-600/50 backdrop-blur-sm w-full"
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Enhanced Floating Revenue Card */}
              <motion.div 
                className="absolute -top-8 -left-8 bg-gradient-to-br from-green-400/95 to-emerald-500/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-300/30"
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">Revenue Up</p>
                    <p className="text-white font-black text-2xl">+234%</p>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Floating AI Agents Card */}
              <motion.div 
                className="absolute -bottom-8 -right-8 bg-gradient-to-br from-blue-400/95 to-cyan-500/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/30"
                animate={{ y: [8, -8, 8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <i className="fas fa-robot text-white text-xl"></i>
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">AI Agents</p>
                    <p className="text-white font-black text-2xl">24/7 Active</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Trusted By Section */}
        <motion.div 
          className="mt-32 text-center bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 max-w-6xl mx-auto overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-cyan-300 mb-12 text-lg uppercase tracking-wider font-bold font-neiko">TRUSTED BY INDUSTRY LEADERS</p>
          <div className="relative">
            <div className="flex space-x-16 moving-logos">
              {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((company, index) => (
                <motion.div
                  key={`${company.name}-${index}`}
                  className="flex flex-col items-center space-y-3 group flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800/80 to-gray-700/80 rounded-3xl flex items-center justify-center group-hover:from-gray-700/80 group-hover:to-gray-600/80 transition-all border border-gray-600/30 shadow-lg">
                    <i className={`${company.icon} text-4xl text-gray-300 group-hover:text-cyan-300 transition-colors`}></i>
                  </div>
                  <span className="font-bold text-gray-300 text-sm font-neiko">{company.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Main Agents Section */}
      <section id="agents" className="py-40 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl text-cyan-300 rounded-full px-8 py-3 mb-8 font-bold text-lg border border-cyan-400/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <i className="fas fa-star mr-3"></i>
              MOST POPULAR AGENTS
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-neiko font-black text-white mb-8 leading-tight">
              MEET YOUR NEW
              <br />
              <span className="text-gradient-electric">AI WORKFORCE</span>
            </h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
              Our elite AI agents work around the clock to transform your business operations. 
              Each bundle contains specialized sub-agents that collaborate seamlessly.
            </p>
          </motion.div>

          {/* Enhanced Filter and Sort Bar */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-between mb-16 p-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-3xl border border-gray-600/50 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-6 mb-6 sm:mb-0">
              <span className="text-gray-200 font-bold text-lg">Filter by:</span>
              <div className="flex space-x-3">
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg">
                  All Agents
                </button>
                <button className="px-6 py-3 bg-gray-700/80 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-600/80 transition-all">
                  Most Popular
                </button>
                <button className="px-6 py-3 bg-gray-700/80 text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-600/80 transition-all">
                  Highest Rated
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-200 font-bold text-lg">Sort by:</span>
              <select className="px-6 py-3 bg-gray-700/80 text-gray-200 rounded-xl text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-bold">
                <option>Rating (High to Low)</option>
                <option>Most Popular</option>
                <option>Recently Updated</option>
                <option>Price (Low to High)</option>
              </select>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <motion.div 
                className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20"
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

          {/* Enhanced CTA for Custom Agent */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-xl rounded-3xl p-16 overflow-hidden border border-gray-600/50 shadow-2xl">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}></div>
              <div className="relative">
                <motion.div
                  className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-full px-8 py-3 mb-8 border border-purple-400/30"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-purple-300 font-bold text-lg font-neiko">
                    <i className="fas fa-magic mr-3"></i>
                    CUSTOM SOLUTIONS AVAILABLE
                  </span>
                </motion.div>
                <h3 className="text-5xl font-neiko font-black text-white mb-6">
                  NEED SOMETHING UNIQUE?
                </h3>
                <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                  Our AI experts will design and build a custom agent tailored specifically to your business needs. 
                  From concept to deployment in just 48 hours.
                </p>
                <Button 
                  asChild
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 px-12 py-6 rounded-2xl font-neiko font-bold text-xl shadow-2xl transition-all transform hover:scale-105 border border-purple-400/30"
                >
                  <Link href="/custom-agent">
                    <i className="fas fa-wand-magic-sparkles mr-3 text-2xl"></i>
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