import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltMaxAngle = 15,
  perspective = 1000,
  scale = 1.05,
  speed = 400,
  glareEnable = true,
  glareMaxOpacity = 0.2
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring animations for smooth movement
  const mouseXSpring = useSpring(x, { stiffness: speed, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: speed, damping: 30 });

  // Transform mouse position to rotation values
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]);

  // Glare effect transforms
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useTransform(
    mouseXSpring,
    [-0.5, 0, 0.5],
    [0, glareMaxOpacity / 2, 0]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu ${className}`}
      style={{
        perspective: perspective,
        transformStyle: 'preserve-3d'
      }}
      animate={{
        scale: isHovered ? scale : 1
      }}
      transition={{
        scale: { type: 'spring', stiffness: 260, damping: 20 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Main content */}
        <div className="relative w-full h-full">
          {children}
        </div>

        {/* Glare effect */}
        {glareEnable && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,${glareOpacity}) 0%, transparent 50%)`,
              opacity: glareOpacity
            }}
          />
        )}

        {/* Inner shadow for depth */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-inherit"
          style={{
            boxShadow: isHovered 
              ? 'inset 0 0 20px rgba(0,0,0,0.1)' 
              : 'inset 0 0 0px rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* 3D depth effect */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-inherit bg-black/10"
        style={{
          transform: 'translateZ(-10px) scale(0.95)',
          opacity: isHovered ? 0.3 : 0
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
  duration?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  delay = 0,
  amplitude = 10,
  duration = 6
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
        rotateX: [0, 2, 0],
        rotateY: [0, 1, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

interface MorphCardProps {
  children: React.ReactNode;
  className?: string;
  morphOnHover?: boolean;
}

export const MorphCard: React.FC<MorphCardProps> = ({
  children,
  className = '',
  morphOnHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        borderRadius: morphOnHover && isHovered 
          ? ['1rem', '2rem', '1.5rem', '1rem'] 
          : '1rem',
      }}
      transition={{
        borderRadius: { duration: 2, ease: "easeInOut" }
      }}
      whileHover={{
        scale: 1.02,
        y: -5
      }}
    >
      {children}
      
      {/* Morphing background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 -z-10"
        animate={{
          scale: isHovered ? [1, 1.1, 1] : 1,
          opacity: isHovered ? [0.5, 0.8, 0.5] : 0
        }}
        transition={{
          duration: 2,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};