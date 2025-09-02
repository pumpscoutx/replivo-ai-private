import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98]);
  const navBlur = useTransform(scrollY, [0, 100], [8, 12]);
  const navHeight = useTransform(scrollY, [0, 100], [80, 70]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: "/", label: "AGENTS" },
    { href: "/marketplace", label: "MARKETPLACE" },
    { href: "/custom-agent", label: "CUSTOM BUILDER" },
    { href: "/agent-recommender", label: "RECOMMENDER" }
  ];

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{
        backdropFilter: `blur(${navBlur}px)`,
        backgroundColor: `rgba(0, 0, 0, ${navOpacity})`,
        height: navHeight
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm"
              whileHover={{ 
                rotate: 5, 
                scale: 1.05,
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.3)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.i 
                className="fas fa-robot text-cyan-400 text-xl"
                animate={{ 
                  filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <motion.span 
              className="text-2xl font-neiko font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              whileHover={{ 
                background: "linear-gradient(45deg, #06b6d4, #8b5cf6, #06b6d4)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
              transition={{ duration: 0.3 }}
            >
              REPLIVO
            </motion.span>
          </Link>

          {/* Center Menu Items - Small Font Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={`relative px-6 py-4 rounded-full font-neiko font-medium text-[13px] tracking-[0.5px] transition-all duration-300 leading-[1.4] ${
                      location === item.href 
                        ? "text-white bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-white/20" 
                        : "text-gray-300 hover:text-white"
                    }`}
                    whileHover={{ 
                      scale: 1.08,
                      backgroundColor: "rgba(6, 182, 212, 0.1)",
                      borderColor: "rgba(6, 182, 212, 0.3)"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {location === item.href && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-600"
                        layoutId="activeTab"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Enhanced hover underline */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-600"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Button - Small Font */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(6, 182, 212, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => { window.location.href = "/api/auth/google"; }}
              className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-neiko font-medium text-[13px] tracking-[0.5px] shadow-lg border-0 leading-[1.4]"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <motion.i 
                className="fas fa-rocket mr-2"
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
              GET STARTED
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button 
            className="md:hidden p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.i 
              className="fas fa-bars text-gray-300 text-xl"
              animate={{ rotate: isScrolled ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          className="absolute top-4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-6 right-1/3 w-1 h-1 bg-purple-400 rounded-full"
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </motion.div>
    </motion.nav>
  );
}
