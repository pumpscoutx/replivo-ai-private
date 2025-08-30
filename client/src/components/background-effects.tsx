import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <>
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Electric Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 200 - 100, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating Geometric Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className={`absolute ${
              i % 3 === 0 ? 'w-8 h-8' : i % 3 === 1 ? 'w-6 h-6' : 'w-4 h-4'
            } ${
              i % 2 === 0 ? 'bg-purple-500/10' : 'bg-cyan-500/10'
            } rounded-lg blur-sm`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              rotate: [0, 360],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Gradient Mesh Overlay */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating Light Rays */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-px h-32 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              top: '-32px',
            }}
            animate={{
              y: [0, window.innerHeight + 32],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear",
            }}
          />
        ))}

        {/* Pulse Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute border-2 border-cyan-400/20 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              width: '200px',
              height: '200px',
              marginLeft: '-100px',
              marginTop: '-100px',
            }}
            animate={{
              scale: [0, 3],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Floating Dots */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-2 h-2 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated Background Gradients */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Floating Text Elements */}
        <motion.div
          className="absolute top-20 left-10 text-cyan-400/10 text-xs font-mono"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          AI
        </motion.div>

        <motion.div
          className="absolute top-40 right-20 text-purple-400/10 text-xs font-mono"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 1,
            ease: "easeInOut",
          }}
        >
          AGENT
        </motion.div>

        <motion.div
          className="absolute bottom-40 left-20 text-blue-400/10 text-xs font-mono"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: 2,
            ease: "easeInOut",
          }}
        >
          SMART
        </motion.div>

        {/* Energy Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`wave-${i}`}
              className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-cyan-500/10 to-transparent"
              style={{
                clipPath: `polygon(0 ${100 - i * 20}%, 100% ${100 - i * 30}%, 100% 100%, 0 100%)`,
              }}
              animate={{
                clipPath: [
                  `polygon(0 ${100 - i * 20}%, 100% ${100 - i * 30}%, 100% 100%, 0 100%)`,
                  `polygon(0 ${100 - i * 30}%, 100% ${100 - i * 20}%, 100% 100%, 0 100%)`,
                  `polygon(0 ${100 - i * 20}%, 100% ${100 - i * 30}%, 100% 100%, 0 100%)`,
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}