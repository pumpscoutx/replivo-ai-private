import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleEffect {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export default function CursorEffects() {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const [trail, setTrail] = useState<{ x: number; y: number; id: string }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Add to trail
      setTrail(prev => [
        ...prev.slice(-8), // Keep last 8 positions
        { x: e.clientX, y: e.clientY, id: Date.now().toString() }
      ]);
    };

    const handleClick = (e: MouseEvent) => {
      // Add ripple effect on click
      const newRipple: RippleEffect = {
        id: Date.now().toString(),
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Mouse Trail */}
      <AnimatePresence>
        {trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: point.x - 4,
              top: point.y - 4,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.5,
              delay: index * 0.05
            }}
          />
        ))}
      </AnimatePresence>

      {/* Click Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute border-2 border-blue-400 rounded-full"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
            }}
            initial={{ 
              width: 0, 
              height: 0, 
              opacity: 1,
              borderWidth: 2 
            }}
            animate={{ 
              width: 50, 
              height: 50, 
              opacity: 0,
              borderWidth: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Agent-Specific Hover Effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .agent-hover-sales:hover ~ .cursor-effect::after {
            content: '$';
            position: absolute;
            color: #10b981;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            animation: float 2s infinite;
          }
          
          .agent-hover-analytics:hover ~ .cursor-effect::after {
            content: '📊';
            position: absolute;
            font-size: 20px;
            pointer-events: none;
            animation: pulse 1.5s infinite;
          }
          
          .agent-hover-support:hover ~ .cursor-effect::after {
            content: '💬';
            position: absolute;
            font-size: 18px;
            pointer-events: none;
            animation: bounce 1s infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
          }
        `
      }} />
    </div>
  );
}