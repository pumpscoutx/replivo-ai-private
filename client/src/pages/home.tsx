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
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 pt-16 pb-24">
        <div className="absolute inset-0 bg-mesh"></div>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-dark mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hire Intelligent <span className="text-primary">AI Agents</span> for Your Business
            </motion.h1>
            
            <motion.p 
              className="text-xl text-secondary mb-10 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your workflow with smart AI agents that handle everything from content creation to data analysis. 
              Browse our marketplace or create custom agents tailored to your needs.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                onClick={scrollToAgents}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105"
              >
                Browse Agents
              </Button>
              <Button 
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Trusted By Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-secondary mb-8 text-sm uppercase tracking-wider">Trusted by</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {COMPANY_LOGOS.map((company, index) => (
              <motion.div
                key={company.name}
                className="flex items-center space-x-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <i className={`${company.icon} text-2xl text-gray-400`}></i>
                <span className="font-medium text-gray-600">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Agents Section */}
      <section id="agents" className="py-20 bg-white relative">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-dark mb-4">Featured AI Agents</h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Discover our most popular agent bundles, each containing specialized sub-agents for comprehensive task automation
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
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-dark mb-3">Didn't find the agent you need?</h3>
              <p className="text-secondary mb-6">Tell us what you're looking for and we'll create a custom agent bundle just for you.</p>
              <Button 
                asChild
                className="bg-accent hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <Link href="/custom-agent">Request Custom Agent</Link>
              </Button>
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
