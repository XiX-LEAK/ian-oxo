import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  size = 64, 
  className = '' 
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      initial="hidden"
      animate="visible"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="50%" stopColor="#ffa726" />
          <stop offset="100%" stopColor="#ff8a65" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer circle */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        filter="url(#glow)"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { duration: 2, ease: "easeInOut" }
          }
        }}
      />
      
      {/* Inner geometric shape */}
      <motion.path
        d="M30 30 L70 30 L50 70 Z"
        fill="url(#logoGradient)"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { 
            scale: 1, 
            opacity: 1,
            transition: { delay: 0.5, duration: 1, type: "spring" }
          }
        }}
        animate={{
          rotateZ: [0, 360]
        }}
        transition={{
          rotateZ: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      />
      
      {/* Center dot */}
      <motion.circle
        cx="50"
        cy="45"
        r="4"
        fill="#ffffff"
        variants={{
          hidden: { scale: 0 },
          visible: { 
            scale: 1,
            transition: { delay: 1, duration: 0.5, type: "spring" }
          }
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.svg>
  );
};

interface WavePatternProps {
  className?: string;
  animate?: boolean;
}

export const WavePattern: React.FC<WavePatternProps> = ({ 
  className = '', 
  animate = true 
}) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.1)" />
            <stop offset="100%" stopColor="rgba(255, 138, 101, 0.05)" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,60 C300,120 500,0 600,30 C700,60 900,0 1200,60 L1200,120 L0,120 Z"
          fill="url(#waveGradient)"
          animate={animate ? {
            d: [
              "M0,60 C300,120 500,0 600,30 C700,60 900,0 1200,60 L1200,120 L0,120 Z",
              "M0,40 C300,80 500,20 600,50 C700,80 900,20 1200,40 L1200,120 L0,120 Z",
              "M0,80 C300,140 500,40 600,70 C700,100 900,40 1200,80 L1200,120 L0,120 Z",
              "M0,60 C300,120 500,0 600,30 C700,60 900,0 1200,60 L1200,120 L0,120 Z"
            ]
          } : {}}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
};

interface DotsPatternProps {
  dotSize?: number;
  spacing?: number;
  opacity?: number;
  className?: string;
}

export const DotsPattern: React.FC<DotsPatternProps> = ({
  dotSize = 2,
  spacing = 30,
  opacity = 0.1,
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg className="w-full h-full">
        <defs>
          <pattern id="dots" x="0" y="0" width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            <motion.circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotSize}
              fill="#ff6b35"
              opacity={opacity}
              animate={{
                r: [dotSize, dotSize * 1.5, dotSize],
                opacity: [opacity, opacity * 2, opacity]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
};

interface IconAnimationProps {
  icon: 'heart' | 'star' | 'check' | 'arrow' | 'loading';
  size?: number;
  className?: string;
  animate?: boolean;
}

export const IconAnimation: React.FC<IconAnimationProps> = ({
  icon,
  size = 24,
  className = '',
  animate = true
}) => {
  const getIconPath = () => {
    switch (icon) {
      case 'heart':
        return "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";
      case 'star':
        return "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
      case 'check':
        return "M20 6L9 17l-5-5";
      case 'arrow':
        return "M5 12h14M12 5l7 7-7 7";
      default:
        return "M12 2v20M2 12h20";
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="hidden"
      animate={animate ? "visible" : "hidden"}
    >
      <motion.path
        d={getIconPath()}
        variants={{
          hidden: { 
            pathLength: 0, 
            opacity: 0,
            scale: 0.8
          },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            scale: 1,
            transition: {
              pathLength: { duration: 1.5, ease: "easeInOut" },
              opacity: { duration: 0.5 },
              scale: { duration: 0.5, type: "spring" }
            }
          }
        }}
        fill={icon === 'heart' || icon === 'star' ? 'currentColor' : 'none'}
      />
      
      {animate && (
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.svg>
  );
};

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  animated?: boolean;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  className = '',
  borderWidth = 2,
  animated = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-inherit"
        style={{
          background: `linear-gradient(45deg, #ff6b35, #ffa726, #ff8a65, #ff6b35)`,
          backgroundSize: '300% 300%',
          padding: borderWidth,
          borderRadius: 'inherit'
        }}
      >
        <motion.div
          className="w-full h-full bg-white rounded-inherit"
          animate={animated ? {
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {children}
        </motion.div>
      </div>
      
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <motion.stop 
              offset="0%" 
              stopColor="#ff6b35"
              animate={animated ? {
                stopColor: ["#ff6b35", "#ffa726", "#ff8a65", "#ff6b35"]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.stop 
              offset="100%" 
              stopColor="#ff8a65"
              animate={animated ? {
                stopColor: ["#ff8a65", "#ff6b35", "#ffa726", "#ff8a65"]
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};