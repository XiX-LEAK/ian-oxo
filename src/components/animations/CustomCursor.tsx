import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CustomCursorProps {
  trailLength?: number;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
  };
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  trailLength = 8,
  springConfig = { damping: 25, stiffness: 700, mass: 0.5 }
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  // Trail dots
  const [trailDots, setTrailDots] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Update trail
      setTrailDots(prev => {
        const newDots = [
          { x: e.clientX, y: e.clientY, id: Date.now() },
          ...prev.slice(0, trailLength - 1)
        ];
        return newDots;
      });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleButtonHover = () => setIsHoveringButton(true);
    const handleButtonLeave = () => setIsHoveringButton(false);

    // Add event listeners
    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Add hover listeners for interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, textarea, select');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleButtonHover);
      el.addEventListener('mouseleave', handleButtonLeave);
    });

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleButtonHover);
        el.removeEventListener('mouseleave', handleButtonLeave);
      });
    };
  }, [cursorX, cursorY, trailLength]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Trail dots */}
      {trailDots.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="fixed pointer-events-none z-50 rounded-full bg-orange-400"
          style={{
            left: dot.x - 2,
            top: dot.y - 2,
            width: 4,
            height: 4,
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ 
            opacity: 0.8 - (index * 0.1), 
            scale: 1 - (index * 0.1) 
          }}
          transition={{ duration: 0.3 }}
        />
      ))}

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-50 mix-blend-difference"
        style={{
          left: springX,
          top: springY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute rounded-full border-2 border-white"
          animate={{
            width: isHoveringButton ? 50 : isClicking ? 20 : 30,
            height: isHoveringButton ? 50 : isClicking ? 20 : 30,
            borderColor: isHoveringButton ? '#ff6b35' : '#ffffff'
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          style={{
            left: '50%',
            top: '50%',
            translateX: '-50%',
            translateY: '-50%'
          }}
        />

        {/* Inner dot */}
        <motion.div
          className="absolute rounded-full bg-white"
          animate={{
            width: isClicking ? 12 : 6,
            height: isClicking ? 12 : 6,
            backgroundColor: isHoveringButton ? '#ff6b35' : '#ffffff'
          }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          style={{
            left: '50%',
            top: '50%',
            translateX: '-50%',
            translateY: '-50%'
          }}
        />

        {/* Pulse effect when clicking */}
        {isClicking && (
          <motion.div
            className="absolute rounded-full border border-white/50"
            initial={{ width: 6, height: 6, opacity: 1 }}
            animate={{ 
              width: 40, 
              height: 40, 
              opacity: 0,
              borderColor: isHoveringButton ? '#ff6b35' : '#ffffff'
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              left: '50%',
              top: '50%',
              translateX: '-50%',
              translateY: '-50%'
            }}
          />
        )}
      </motion.div>

      {/* Magnetic effect for buttons */}
      {isHoveringButton && (
        <motion.div
          className="fixed pointer-events-none z-40 rounded-full bg-orange-500/20"
          style={{
            left: springX,
            top: springY,
            translateX: '-50%',
            translateY: '-50%'
          }}
          animate={{
            width: 80,
            height: 80,
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            width: { type: "spring", stiffness: 300, damping: 30 },
            height: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      )}
    </>
  );
};

export default CustomCursor;