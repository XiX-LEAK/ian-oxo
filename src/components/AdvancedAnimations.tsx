import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistrer ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticHover: React.FC<MagneticHoverProps> = ({ 
  children, 
  strength = 0.3, 
  className = '' 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    gsap.to(ref.current, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ 
  children, 
  color = '#f97316', 
  intensity = 20 
}) => {
  return (
    <motion.div
      whileHover={{
        filter: `drop-shadow(0 0 ${intensity}px ${color}) drop-shadow(0 0 ${intensity * 2}px ${color})`
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface MorphingShapeProps {
  size?: number;
  colors?: string[];
  duration?: number;
}

export const MorphingShape: React.FC<MorphingShapeProps> = ({ 
  size = 100, 
  colors = ['#f97316', '#3b82f6', '#10b981'],
  duration = 3
}) => {
  return (
    <motion.div
      className="absolute"
      style={{ width: size, height: size }}
      animate={{
        borderRadius: ['20%', '50%', '30%', '40%', '20%'],
        backgroundColor: colors,
        rotate: [0, 180, 360],
        scale: [1, 1.2, 0.8, 1.1, 1]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

interface LiquidButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  children, 
  onClick, 
  className = '' 
}) => {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ type: "tween", duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

interface ParallaxTextProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxText: React.FC<ParallaxTextProps> = ({ 
  children, 
  speed = 0.5, 
  className = '' 
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);
  const smoothY = useSpring(y, { damping: 50, stiffness: 400 });

  return (
    <motion.div style={{ y: smoothY }} className={className}>
      {children}
    </motion.div>
  );
};

interface RevealOnScrollProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({ 
  children, 
  direction = 'up',
  delay = 0,
  className = '' 
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const directions = {
      up: { y: 50, x: 0 },
      down: { y: -50, x: 0 },
      left: { y: 0, x: 50 },
      right: { y: 0, x: -50 }
    };

    gsap.fromTo(ref.current, 
      {
        opacity: 0,
        ...directions[direction]
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, [direction, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface FloatingElementProps {
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({ 
  children, 
  amplitude = 20,
  duration = 3,
  delay = 0
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -amplitude, 0],
        rotate: [-1, 1, -1]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
}

export const RippleEffect: React.FC<RippleEffectProps> = ({ 
  children, 
  color = 'rgba(249, 115, 22, 0.3)' 
}) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 1000);
  };

  return (
    <div className="relative overflow-hidden cursor-pointer" onClick={handleClick}>
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export const TypewriterEffect: React.FC<TypewriterProps> = ({ 
  text, 
  speed = 50, 
  delay = 0,
  cursor = true 
}) => {
  const [displayText, setDisplayText] = React.useState('');
  const [showCursor, setShowCursor] = React.useState(cursor);

  useEffect(() => {
    const timer = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, index + 1));
        index++;
        
        if (index >= text.length) {
          clearInterval(interval);
          if (cursor) {
            setInterval(() => {
              setShowCursor(prev => !prev);
            }, 500);
          }
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, cursor]);

  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse">|</span>}
    </span>
  );
};

interface ScrollProgressProps {
  color?: string;
  height?: number;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({ 
  color = '#f97316', 
  height = 4 
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { damping: 50, stiffness: 400 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: height,
        backgroundColor: color,
        scaleX,
        transformOrigin: "0%"
      }}
    />
  );
};

// Composant combiné pour animations complexes
export const AnimationShowcase: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-dark-950 overflow-hidden">
      {/* Progress bar */}
      <ScrollProgress />
      
      {/* Formes morphantes en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none">
        <MorphingShape size={150} />
        <MorphingShape 
          size={80} 
          colors={['#3b82f6', '#10b981', '#f59e0b']}
          duration={4}
        />
      </div>

      {/* Éléments flottants */}
      <div className="absolute top-20 left-10">
        <FloatingElement amplitude={15} duration={4}>
          <div className="w-8 h-8 bg-primary-500 rounded-full opacity-60" />
        </FloatingElement>
      </div>

      <div className="absolute top-40 right-20">
        <FloatingElement amplitude={25} duration={5} delay={1}>
          <div className="w-6 h-6 bg-blue-500 rounded-full opacity-40" />
        </FloatingElement>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
        <RevealOnScroll direction="up">
          <h1 className="text-6xl font-bold text-center mb-8">
            <TypewriterEffect 
              text="Animations Révolutionnaires" 
              speed={100}
              delay={500}
            />
          </h1>
        </RevealOnScroll>

        <ParallaxText speed={0.3} className="text-center mb-12">
          <p className="text-xl text-dark-300">
            Découvrez les effets visuels les plus avancés du web
          </p>
        </ParallaxText>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          <RevealOnScroll direction="left" delay={0.2}>
            <MagneticHover className="glass-card p-6 text-center">
              <GlowEffect>
                <h3 className="text-2xl font-bold mb-4">Magnetic Hover</h3>
              </GlowEffect>
              <p className="text-dark-300">
                Éléments attirés par votre curseur avec physique réaliste
              </p>
            </MagneticHover>
          </RevealOnScroll>

          <RevealOnScroll direction="right" delay={0.4}>
            <RippleEffect>
              <div className="glass-card p-6 text-center">
                <h3 className="text-2xl font-bold mb-4">Ripple Effect</h3>
                <p className="text-dark-300">
                  Cliquez pour créer des ondulations interactives
                </p>
              </div>
            </RippleEffect>
          </RevealOnScroll>
        </div>

        <div className="flex justify-center mt-16">
          <LiquidButton className="btn-primary px-8 py-4 text-lg">
            Bouton Liquide
          </LiquidButton>
        </div>
      </div>
    </div>
  );
};