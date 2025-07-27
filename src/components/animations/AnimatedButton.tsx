import React from 'react';
import { motion } from 'framer-motion';
import { buttonAnimations } from '@/utils/modernAnimations';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'magnetic' | 'shimmer' | 'morph3D';
  className?: string;
  type?: 'button' | 'submit';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'magnetic',
  className = '',
  type = 'button'
}) => {
  const getAnimation = () => {
    switch (variant) {
      case 'shimmer':
        return buttonAnimations.shimmer;
      case 'morph3D':
        return buttonAnimations.morph3D;
      default:
        return buttonAnimations.magneticPulse;
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-white
        focus:outline-none focus:ring-4 focus:ring-orange-300/50
        disabled:opacity-50 disabled:cursor-not-allowed
        transform-gpu perspective-1000
        ${className}
      `}
      variants={getAnimation()}
      initial="rest"
      whileHover={!disabled ? "hover" : "rest"}
      whileTap={!disabled ? "tap" : "rest"}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Effet de brillance overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        whileHover={{ x: "200%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      
      {/* Contenu du bouton */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {children}
      </span>
      
      {/* Particules d'effet */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.button>
  );
};