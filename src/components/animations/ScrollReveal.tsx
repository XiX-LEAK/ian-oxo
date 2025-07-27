import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { scrollAnimations } from '@/utils/modernAnimations';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: 'fadeInUp' | 'parallax' | 'slideRotate';
  delay?: number;
  className?: string;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fadeInUp',
  delay = 0,
  className = '',
  once = true
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  const getVariant = () => {
    return scrollAnimations[variant];
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={getVariant()}
      initial="hidden"
      animate={controls}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

// Composant pour révélation en cascade d'éléments
interface StaggeredRevealProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const StaggeredReveal: React.FC<StaggeredRevealProps> = ({
  children,
  className = '',
  staggerDelay = 0.1
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      initial="hidden"
      animate={controls}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { 
              opacity: 0, 
              y: 50,
              scale: 0.8,
              rotateX: -15
            },
            visible: { 
              opacity: 1, 
              y: 0,
              scale: 1,
              rotateX: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
              }
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};