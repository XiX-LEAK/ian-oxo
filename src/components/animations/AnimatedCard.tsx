import React from 'react';
import { motion } from 'framer-motion';
import { cardAnimations } from '@/utils/modernAnimations';

interface AnimatedCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'levitate' | 'glowSweep' | 'flip3D';
  className?: string;
  glowColor?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onClick,
  variant = 'levitate',
  className = '',
  glowColor = 'rgba(59, 130, 246, 0.3)'
}) => {
  const getAnimation = () => {
    return cardAnimations[variant];
  };

  return (
    <motion.div
      className={`
        relative cursor-pointer transform-gpu perspective-1000
        bg-white rounded-2xl p-6 border border-gray-100
        ${className}
      `}
      variants={getAnimation()}
      initial="rest"
      whileHover="hover"
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d"
      }}
    >
      {/* Effet de halo lumineux */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)`,
          filter: "blur(20px)",
          zIndex: -1
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Bordure animée */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(45deg, transparent, ${glowColor}, transparent)`,
          opacity: 0,
          zIndex: -1
        }}
        whileHover={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      />

      {/* Effet de reflet */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent"
        initial={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.3 }}
      />

      {/* Contenu de la carte */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
            style={{
              left: `${10 + (i % 4) * 25}%`,
              top: `${10 + Math.floor(i / 4) * 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};