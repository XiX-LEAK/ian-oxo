import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  infinite?: boolean;
  startDelay?: number;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  texts,
  className = '',
  speed = 100,
  pauseDuration = 2000,
  showCursor = true,
  infinite = true,
  startDelay = 0
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const fullText = texts[currentTextIndex];
      
      if (!isDeleting) {
        // Typing
        if (currentText.length < fullText.length) {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        } else {
          // Finished typing current text
          if (infinite) {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          } else {
            setIsComplete(true);
          }
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        } else {
          // Finished deleting
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, startDelay > 0 ? startDelay : (isDeleting ? speed / 2 : speed));

    if (startDelay > 0) {
      setStartDelay(0);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts, speed, pauseDuration, infinite, startDelay]);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {currentText.split('').map((char, index) => (
          <motion.span
            key={`${currentTextIndex}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.03,
              ease: "easeOut"
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.span>
      
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block w-0.5 h-[1.2em] bg-orange-500 ml-1"
        />
      )}
    </div>
  );
};

interface TypewriterWordProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export const TypewriterWord: React.FC<TypewriterWordProps> = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.05
}) => {
  const words = text.split(' ');

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay
          }
        }
      }}
    >
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          className="inline-block mr-2"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
              }
            }
          }}
        >
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 20, rotateX: -90 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 12,
                    delay: charIndex * 0.02
                  }
                }
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </motion.div>
  );
};

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.8
}) => {
  return (
    <motion.div
      className={`relative inline-block overflow-hidden ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.02,
            delayChildren: delay
          }
        }
      }}
    >
      <motion.div
        className="absolute inset-0 bg-orange-500"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: duration,
          delay: delay,
          ease: "easeInOut"
        }}
      />
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={{
            hidden: { y: "100%" },
            visible: { 
              y: "0%",
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
              }
            }
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};