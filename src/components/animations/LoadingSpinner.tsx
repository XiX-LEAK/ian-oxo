import React from 'react';
import { motion } from 'framer-motion';
import { loadingAnimations } from '@/utils/modernAnimations';

interface LoadingSpinnerProps {
  variant?: 'dots' | 'morphSpin' | 'ripple' | 'orbital' | 'pulse' | 'wave' | 'spiral' | 'bounce';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'morphSpin',
  size = 'md',
  color = '#f97316'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (variant === 'dots') {
    return (
      <div className="flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} rounded-full`}
            style={{ backgroundColor: color }}
            variants={loadingAnimations.dots}
            animate="animate"
            transition={{ delay: i * 0.2 }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'ripple') {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute inset-0 border-2 rounded-full`}
            style={{ borderColor: color }}
            variants={loadingAnimations.ripple}
            animate="animate"
            transition={{ delay: i * 0.3 }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'orbital') {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Centre */}
        <motion.div
          className="absolute inset-1/3 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Orbites */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2 - (i * 0.3),
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div
              className={`w-2 h-2 rounded-full absolute`}
              style={{
                backgroundColor: color,
                top: `${10 + i * 15}%`,
                left: '50%',
                transform: 'translateX(-50%)',
                opacity: 0.7 - (i * 0.2)
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            animate={{
              scale: [0, 1],
              opacity: [1, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
        <div
          className="absolute inset-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-1 bg-current rounded-full`}
            style={{ color, height: size === 'sm' ? '16px' : size === 'md' ? '24px' : '32px' }}
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'spiral') {
    return (
      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div
            className="w-full h-full rounded-full border-4 border-transparent"
            style={{
              borderTopColor: color,
              borderRightColor: `${color}80`,
              borderBottomColor: `${color}40`,
              borderLeftColor: `${color}20`
            }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-2"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div
            className="w-full h-full rounded-full border-2 border-transparent"
            style={{
              borderTopColor: `${color}60`,
              borderLeftColor: `${color}30`
            }}
          />
        </motion.div>
      </div>
    );
  }

  if (variant === 'bounce') {
    return (
      <div className="flex items-center space-x-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`${dotSizes[size]} rounded-full`}
            style={{ backgroundColor: color }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    );
  }

  // variant 'morphSpin' par défaut
  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-lg`}
      style={{ backgroundColor: color }}
      variants={loadingAnimations.morphSpin}
      animate="animate"
    />
  );
};