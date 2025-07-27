import React from 'react';
import { motion } from 'framer-motion';

interface GeometricBackgroundProps {
  variant?: 'subtle' | 'dynamic' | 'particles';
  density?: 'low' | 'medium' | 'high';
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({
  variant = 'subtle',
  density = 'medium'
}) => {
  const densityMap = {
    low: 8,
    medium: 12,
    high: 20
  };

  const shapeCount = densityMap[density];

  const generateShapes = () => {
    const shapes = [];
    for (let i = 0; i < shapeCount; i++) {
      const shapeType = Math.floor(Math.random() * 4);
      const size = Math.random() * 100 + 20;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;

      shapes.push({
        id: i,
        type: shapeType,
        size,
        x,
        y,
        duration,
        delay
      });
    }
    return shapes;
  };

  const shapes = generateShapes();

  if (variant === 'particles') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            className="absolute"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
              width: shape.size / 4,
              height: shape.size / 4,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: shape.duration,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div 
              className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/10"
              style={{
                filter: 'blur(1px)'
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Geometric Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute opacity-30"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            opacity: variant === 'dynamic' ? [0.1, 0.4, 0.1] : [0.05, 0.15, 0.05]
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Different geometric shapes */}
          {shape.type === 0 && (
            // Triangle
            <div 
              className="w-full h-full border border-orange-300/20"
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 138, 101, 0.05))'
              }}
            />
          )}
          {shape.type === 1 && (
            // Circle
            <div className="w-full h-full rounded-full border border-orange-300/20 bg-gradient-to-br from-orange-200/10 to-orange-400/5" />
          )}
          {shape.type === 2 && (
            // Square rotated
            <div 
              className="w-full h-full border border-orange-300/20 bg-gradient-to-br from-orange-300/10 to-orange-500/5"
              style={{ transform: 'rotate(45deg)' }}
            />
          )}
          {shape.type === 3 && (
            // Hexagon
            <div 
              className="w-full h-full border border-orange-300/20"
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
                background: 'linear-gradient(135deg, rgba(255, 167, 38, 0.1), rgba(255, 107, 53, 0.05))'
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Animated Grid Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="rgba(255, 107, 53, 0.05)"
              strokeWidth="1"
              animate={{
                strokeDasharray: ["0,100", "50,50", "0,100"],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating Orbs */}
      {variant === 'dynamic' && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%)`,
                left: `${20 + i * 12}%`,
                top: `${20 + (i % 2) * 40}%`,
                filter: 'blur(20px)'
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 15 + i * 2,
                delay: i * 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};