import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AgentCard from "@/components/agent-card";
import AgentRecommender from "@/components/agent-recommender";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Agent } from "@shared/schema";
import { COMPANY_LOGOS } from "@/lib/constants";

export default function Home() {
  const { data: featuredAgents, isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents/featured"]
  });

  const scrollToAgents = () => {
    const agentsSection = document.getElementById("agents");
    agentsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero pt-16 pb-32">
        <div className="absolute inset-0 bg-gradient-mesh floating-shapes"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
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
                className="inline-block bg-white/20 backdrop-blur-md rounded-full px-6 py-2 mb-6 border border-white/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <span className="text-white font-medium text-sm">🚀 Trusted by 10,000+ businesses worldwide</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Hire Smart
                <br />
                <span className="text-gradient bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  AI Agents
                </span>
                <br />
                That Work 24/7
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white/90 mb-10 leading-relaxed max-w-lg font-medium"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Transform your business with intelligent agents that automate marketing, analytics, support, and more. 
                <span className="font-bold text-yellow-300">Save 40+ hours per week</span> on repetitive tasks.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button 
                  onClick={scrollToAgents}
                  className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Browse Agents
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-md px-8 py-4 rounded-xl font-bold text-lg transition-all"
                >
                  <i className="fas fa-play mr-2"></i>
                  Watch Demo
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
                <div className="text-white">
                  <p className="font-semibold">10,000+ happy customers</p>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i key={star} className="fas fa-star text-sm"></i>
                      ))}
                    </div>
                    <span className="text-sm text-white/80">4.9/5 rating</span>
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
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="AI Dashboard"
                  className="rounded-3xl shadow-2xl border-4 border-white/30 backdrop-blur-sm"
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

        {/* Trusted By Section */}
        <motion.div 
          className="mt-20 text-center bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-white/80 mb-8 text-sm uppercase tracking-wider font-semibold">Trusted by Industry Leaders</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COMPANY_LOGOS.map((company, index) => (
              <motion.div
                key={company.name}
                className="flex flex-col items-center space-y-2 group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <i className={`${company.icon} text-3xl text-white`}></i>
                </div>
                <span className="font-semibold text-white text-sm">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Agents Section */}
      <section id="agents" className="py-32 bg-gray-50 relative">
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
              className="inline-block bg-purple-100 text-purple-800 rounded-full px-6 py-2 mb-6 font-semibold text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <i className="fas fa-star mr-2"></i>
              Most Popular Agents
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-display font-black text-gray-900 mb-6 leading-tight">
              Meet Your New
              <br />
              <span className="text-gradient">AI Workforce</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our elite AI agents work around the clock to transform your business operations. 
              Each bundle contains specialized sub-agents that collaborate seamlessly.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl mb-6"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {featuredAgents?.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}></div>
              <div className="relative">
                <motion.div
                  className="inline-block bg-white/20 rounded-full px-6 py-2 mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white font-bold text-sm">
                    <i className="fas fa-magic mr-2"></i>
                    Custom Solutions Available
                  </span>
                </motion.div>
                <h3 className="text-4xl font-display font-black text-white mb-4">
                  Need Something Unique?
                </h3>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Our AI experts will design and build a custom agent tailored specifically to your business needs. 
                  From concept to deployment in just 48 hours.
                </p>
                <Button 
                  asChild
                  className="bg-white text-purple-900 hover:bg-gray-100 px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                >
                  <Link href="/custom-agent">
                    <i className="fas fa-wand-magic-sparkles mr-2"></i>
                    Build Custom Agent
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
