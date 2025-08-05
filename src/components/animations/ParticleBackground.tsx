import React from 'react';
import { motion } from 'framer-motion';

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  animated?: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 20,
  colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'],
  animated = true
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient de fond animé */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(45deg, rgba(249,115,22,0.03), rgba(59,130,246,0.03), rgba(16,185,129,0.03))',
          backgroundSize: '400% 400%'
        }}
        animate={animated ? {
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        } : {}}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Particules flottantes */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          animate={animated ? {
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.5, 0.1],
            rotate: [0, 360]
          } : {}}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Formes géométriques flottantes - Réduites pour performance */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute opacity-5"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
          }}
          animate={animated ? {
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.02, 0.08, 0.02]
          } : {}}
          transition={{
            duration: 15 + (i * 2),
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {i % 3 === 0 && (
            <div 
              className="w-full h-full border-2 border-blue-400 rounded-full"
              style={{ borderStyle: 'dashed' }}
            />
          )}
          {i % 3 === 1 && (
            <div 
              className="w-full h-full bg-gradient-to-br from-orange-400/10 to-transparent"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
          )}
          {i % 3 === 2 && (
            <div 
              className="w-full h-full border-2 border-green-400"
              style={{ 
                borderStyle: 'dotted',
                transform: 'rotate(45deg)'
              }}
            />
          )}
        </motion.div>
      ))}

      {/* Lignes de connexion animées - Réduites */}
      <svg className="absolute inset-0 w-full h-full">
        {[...Array(2)].map((_, i) => (
          <motion.line
            key={`line-${i}`}
            x1={`${Math.random() * 100}%`}
            y1={`${Math.random() * 100}%`}
            x2={`${Math.random() * 100}%`}
            y2={`${Math.random() * 100}%`}
            stroke="url(#gradient)"
            strokeWidth="1"
            opacity="0.1"
            animate={animated ? {
              pathLength: [0, 1, 0],
              opacity: [0, 0.3, 0]
            } : {}}
            transition={{
              duration: 4 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};