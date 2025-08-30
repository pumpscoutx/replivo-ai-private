import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import BackgroundEffects from "@/components/background-effects";
import AgentCard from "@/components/agent-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Animated Typography Component
const AnimatedText = ({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100 + delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        className="inline-block w-0.5 h-6 bg-cyan-400 ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  );
};

// Morphing Text Component
const MorphingText = ({ words, className = "" }: { words: string[]; className?: string }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex(prev => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <motion.span
      key={currentWordIndex}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {words[currentWordIndex]}
    </motion.span>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, className = "" }: { end: number; duration?: number; className?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, end, duration]);

  return <span ref={ref} className={className}>{count.toLocaleString()}+</span>;
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
    <div className="min-h-screen bg-black overflow-hidden">
      <BackgroundEffects />
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-white/20 backdrop-blur-sm">
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full mr-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-cyan-300 font-bold text-sm tracking-wider">
                ⚡ TRUSTED BY <AnimatedCounter end={10000} className="text-white" />+ BUSINESSES
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-neiko font-black mb-6">
              <span className="text-gradient-electric">
                <MorphingText 
                  words={["HIRE", "WORK", "SCALE"]} 
                  className="text-gradient-electric"
                /> SMART
              </span>
              <br />
              <span className="text-white/90">AI AGENTS</span>
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
              Transform your business with intelligent AI agents that work 
              <span className="text-cyan-300 font-semibold text-2xl md:text-3xl"> 24/7</span>. 
              <br />
              <span className="text-cyan-300 font-semibold">Save 40+ hours per week</span> with automated workflows.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setLocation("/login")}
                className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-12 py-4 rounded-2xl font-neiko font-bold text-xl shadow-2xl border-0 group"
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
                GET STARTED NOW
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => setLocation("/")}
                variant="outline"
                className="relative overflow-hidden bg-transparent border-2 border-white/30 hover:border-cyan-400 text-white px-12 py-4 rounded-2xl font-neiko font-bold text-xl backdrop-blur-sm group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-600/10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10">VIEW AGENTS</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-20"
          >
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-400 text-lg font-medium">Trusted by industry leaders</p>
              <div className="flex items-center space-x-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 border-3 border-cyan-500/30 flex items-center justify-center"
                    whileHover={{ 
                      scale: 1.2,
                      borderColor: "rgba(6, 182, 212, 0.8)",
                      boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)"
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.i 
                      className="fas fa-star text-yellow-400"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <span className="text-white text-lg font-semibold">
                  <AnimatedCounter end={10000} className="text-cyan-300" />+ happy customers
                </span>
                <div className="flex items-center justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.i
                      key={star}
                      className="fas fa-star text-yellow-400 text-sm"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: star * 0.1
                      }}
                    />
                  ))}
                  <span className="text-gray-400 ml-2 text-sm">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating Cards */}
        <motion.div
          className="absolute top-1/4 left-10 hidden lg:block"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl p-6 border border-white/20 shadow-2xl">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <i className="fas fa-chart-line text-green-400 text-xl" />
                </motion.div>
                <div>
                  <p className="text-white font-bold text-lg">Revenue Up</p>
                  <p className="text-cyan-300 font-bold text-2xl">
                    <AnimatedCounter end={234} />%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-10 hidden lg:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl p-6 border border-white/20 shadow-2xl">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <i className="fas fa-robot text-purple-400 text-xl" />
                </motion.div>
                <div>
                  <p className="text-white font-bold text-lg">AI Agents</p>
                  <p className="text-purple-300 font-bold text-2xl">
                    <AnimatedCounter end={50} />+
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Trusted By Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl">
            <motion.h2 
              className="text-center text-3xl md:text-4xl font-neiko font-black text-white mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              TRUSTED BY INDUSTRY LEADERS
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {["Google", "Microsoft", "Amazon", "Meta"].map((company, index) => (
                <motion.div
                  key={company}
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.1,
                    filter: "brightness(1.2)"
                  }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/20">
                    <i className={`fab fa-${company.toLowerCase()} text-white text-2xl`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Agents Section */}
      <motion.section 
        ref={agentsRef}
        className="py-40 bg-gradient-to-b from-gray-900 to-black relative"
        style={{ y: agentsY, opacity: agentsOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-white/20 mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-cyan-300 font-bold text-sm tracking-wider">
                ⭐ MOST POPULAR AGENTS
              </span>
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-neiko font-black mb-8">
              <span className="text-gradient-electric">MEET YOUR NEW</span>
              <br />
              <span className="text-white">AI WORKFORCE</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-4xl mx-auto">
              Choose from our curated collection of specialized AI agents designed to transform your business operations
            </p>
          </motion.div>

          {/* Filter and Sort Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl mb-12"
          >
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-bold">
                  All Agents
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-2 rounded-xl font-bold">
                  Most Popular
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-2 rounded-xl font-bold">
                  Newest
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 font-medium">Sort by:</span>
                <select className="bg-gray-800/50 border border-white/20 text-white px-4 py-2 rounded-xl font-bold focus:outline-none focus:border-cyan-400">
                  <option>Rating</option>
                  <option>Price</option>
                  <option>Reviews</option>
                </select>
              </div>
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