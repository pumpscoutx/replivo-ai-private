import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BackgroundEffects from "@/components/background-effects";
import AgentCard from "@/components/agent-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Neural Network Component
const NeuralNetwork = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg className="w-full h-full" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Neural network nodes */}
      {Array.from({ length: 15 }, (_, i) => (
        <motion.circle
          key={i}
          cx={100 + (i * 80) % 1000}
          cy={150 + Math.sin(i * 0.5) * 300}
          r="4"
          fill="url(#neuralGradient)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 1, 0.3], 
            scale: [1, 1.2, 1],
            cx: [100 + (i * 80) % 1000, 100 + (i * 80) % 1000 + 20, 100 + (i * 80) % 1000]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
      {/* Neural network connections */}
      {Array.from({ length: 20 }, (_, i) => (
        <motion.line
          key={`line-${i}`}
          x1={100 + (i * 60) % 1000}
          y1={150 + Math.sin(i * 0.3) * 200}
          x2={150 + (i * 60) % 1000}
          y2={200 + Math.sin(i * 0.3 + 1) * 200}
          stroke="url(#neuralGradient)"
          strokeWidth="1"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ 
            opacity: [0.2, 0.8, 0.2], 
            pathLength: [0, 1, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </svg>
  </div>
);

// Terminal Component
const Terminal = () => (
  <motion.div
    className="absolute top-20 right-10 w-80 h-64 bg-black/80 backdrop-blur-xl rounded-lg border border-cyan-500/30 p-4 font-mono text-xs"
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 1, duration: 0.8 }}
  >
    <div className="flex items-center mb-3">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      <span className="ml-3 text-gray-400">replivo-ai-terminal</span>
    </div>
    <div className="space-y-1">
      <motion.div
        className="text-cyan-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        $ npm install replivo-ai
      </motion.div>
      <motion.div
        className="text-green-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        ✓ Installed successfully
      </motion.div>
      <motion.div
        className="text-cyan-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        $ replivo --deploy-agent content-creator
      </motion.div>
      <motion.div
        className="text-green-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.5 }}
      >
        ✓ Agent deployed and ready
      </motion.div>
      <motion.div
        className="text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
      >
        <span className="text-cyan-400">$</span> 
        <motion.span
          className="ml-2"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          |
        </motion.span>
      </motion.div>
    </div>
  </motion.div>
);

// Floating Dashboard Mockup
const FloatingDashboard = () => (
  <motion.div
    className="absolute top-40 left-10 w-72 h-48 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-xl border border-white/20 p-4"
    initial={{ opacity: 0, y: 50, rotateY: -15 }}
    animate={{ opacity: 1, y: 0, rotateY: 0 }}
    transition={{ delay: 1.2, duration: 1 }}
    whileHover={{ 
      rotateY: 5, 
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)"
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-300 font-medium">Content Creator Agent</span>
      </div>
      <div className="text-xs text-gray-400">Active</div>
    </div>
    <div className="space-y-2">
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: "75%" }}
          transition={{ delay: 2, duration: 1 }}
        />
      </div>
      <div className="text-xs text-gray-400">Writing blog post...</div>
      <div className="flex space-x-2">
        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </motion.div>
);

// Animated Typography Component
const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => (
  <div className={className}>
    {text.split('').map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.05, 
          duration: 0.5,
          ease: "easeOut"
        }}
        className="inline-block"
      >
        {char}
      </motion.span>
    ))}
  </div>
);

// Morphing Text Component
const MorphingText = () => {
  const [currentText, setCurrentText] = useState(0);
  const texts = ["AI AGENTS", "SMART AUTOMATION", "BUSINESS GROWTH"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={currentText}
      className="text-gradient-electric font-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {texts[currentText]}
    </motion.div>
  );
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const agentsRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch featured agents
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/agents/featured');
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    }
  });

  // Scroll-based transforms
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);
  const agentsY = useTransform(scrollY, [300, 800], [100, 0]);
  const agentsOpacity = useTransform(scrollY, [300, 600], [0, 1]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />
      <BackgroundEffects />
      
      {/* Neural Network Background */}
      <NeuralNetwork />
      
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Main Headline */}
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-black leading-none mb-8"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-white font-extralight">BUILD</span>
            <br />
            <span className="text-white font-black">THE FUTURE</span>
            <br />
            <span className="text-gradient-electric font-black">WITH</span>
            <br />
            <MorphingText />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 font-light tracking-wider max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Deploy intelligent AI agents that work 24/7 to scale your business. 
            <span className="text-cyan-400 font-medium"> No coding required.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-lg shadow-2xl border-0"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <motion.i 
                  className="fas fa-rocket mr-3"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                DEPLOY YOUR FIRST AGENT
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline"
                className="border-2 border-white/20 text-white px-12 py-6 rounded-2xl font-bold text-lg backdrop-blur-xl hover:border-cyan-400 hover:text-cyan-400"
              >
                <motion.i 
                  className="fas fa-play mr-3"
                  animate={{ 
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                WATCH DEMO
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            className="flex items-center justify-center space-x-8 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="flex -space-x-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 border-2 border-black"
                  />
                ))}
              </motion.div>
              <span className="text-sm font-medium">10,000+ businesses trust Replivo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <motion.i
                    key={i}
                    className="fas fa-star text-sm"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">4.9/5 rating</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <Terminal />
        <FloatingDashboard />
      </motion.section>

      {/* Agents Section */}
      <motion.section
        ref={agentsRef}
        className="relative py-32 px-4"
        style={{ y: agentsY, opacity: agentsOpacity }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-5xl md:text-7xl font-black mb-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-white font-extralight">MEET YOUR</span>
              <br />
              <span className="text-gradient-electric font-black">AI TEAM</span>
            </motion.h2>
            
            <motion.p
              className="text-xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Deploy specialized AI agents that work together to transform your business operations
            </motion.p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-between mb-16 bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="text-gray-400 font-medium">Sort by:</span>
              <select className="bg-gray-800/50 border border-white/20 text-white px-4 py-2 rounded-xl font-bold focus:outline-none focus:border-cyan-400">
                <option>Rating</option>
                <option>Price</option>
                <option>Reviews</option>
              </select>
            </div>
          </motion.div>

          {/* Loading Spinner */}
          {agentsLoading && (
            <motion.div
              className="flex justify-center items-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-16 h-16 border-4 border-gray-700 border-t-cyan-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}

          {/* Agents Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded && !agentsLoading ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {agents.map((agent: any, index: number) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA for Custom Agent */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl">
              <motion.div
                className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-yellow-300 font-bold text-sm tracking-wider">
                  🚀 CUSTOM SOLUTION
                </span>
              </motion.div>
              
              <h3 className="text-4xl md:text-5xl font-neiko font-black mb-6">
                <span className="text-gradient-electric">NEED SOMETHING</span>
                <br />
                <span className="text-white">SPECIAL?</span>
              </h3>
              
              <p className="text-xl text-gray-300 font-light max-w-3xl mx-auto mb-8">
                Can't find the perfect agent? Let us build a custom AI solution tailored to your specific business needs and workflows.
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setLocation("/custom-agent")}
                  className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-12 py-4 rounded-2xl font-neiko font-bold text-xl shadow-2xl border-0"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.i 
                    className="fas fa-magic mr-3"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  BUILD CUSTOM AGENT
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}