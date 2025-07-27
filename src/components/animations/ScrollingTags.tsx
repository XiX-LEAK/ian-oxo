// 🎨 ANIMATION DE DÉFILEMENT POUR TAGS/CATÉGORIES/LANGUES
// Remplace le "+X" par une belle animation de défilement

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollingTagsProps {
  items: string[];
  maxVisible?: number;
  className?: string;
  tagClassName?: string;
  speed?: number; // Vitesse de défilement en secondes
  pauseOnHover?: boolean;
}

export const ScrollingTags: React.FC<ScrollingTagsProps> = ({ 
  items, 
  maxVisible = 3, 
  className = '',
  tagClassName = 'px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-lg font-medium',
  speed = 2,
  pauseOnHover = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Si pas assez d'items pour le défilement, affichage normal
  if (items.length <= maxVisible) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {items.map((item, index) => (
          <motion.span
            key={index}
            className={tagClassName}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    );
  }

  // Animation de défilement plus fluide
  useEffect(() => {
    if (isHovered && pauseOnHover) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % items.length;
        return next;
      });
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [items.length, speed, isHovered, pauseOnHover]);

  // Calculer les items visibles avec animation circulaire
  const getVisibleItems = () => {
    const visible = [];
    for (let i = 0; i < maxVisible; i++) {
      const index = (currentIndex + i) % items.length;
      visible.push({
        item: items[index],
        index: index,
        position: i
      });
    }
    return visible;
  };

  const visibleItems = getVisibleItems();
  const hiddenCount = items.length - maxVisible;

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <div className="flex items-center space-x-2">
        {/* Tags défilants - Animation plus fluide */}
        <div className="flex space-x-2 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {visibleItems.map(({ item, index, position }) => (
              <motion.span
                key={`${currentIndex}-${index}-${item}`}
                className={tagClassName}
                initial={{ 
                  opacity: 0, 
                  x: position === 0 ? -30 : 0,
                  scale: 0.9
                }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: 1
                }}
                exit={{ 
                  opacity: 0, 
                  x: position === maxVisible - 1 ? 30 : 0,
                  scale: 0.9
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94], // bezier easing plus naturel
                  delay: position * 0.05
                }}
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
                layout
              >
                {item}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Indicateur du nombre total */}
        {hiddenCount > 0 && (
          <motion.div
            className="flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span 
              className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg font-medium border border-gray-300"
              whileHover={{ scale: 1.1 }}
              title={`${items.length} au total`}
            >
              +{hiddenCount}
            </motion.span>
            
            {/* Petits points pour indiquer l'animation */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(3, items.length) }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tooltip au survol pour voir tous les items */}
      {isHovered && (
        <motion.div
          className="absolute top-full left-0 mt-2 bg-black/90 text-white p-3 rounded-lg shadow-xl z-50 max-w-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="text-xs font-medium mb-2">Tous les éléments ({items.length}) :</div>
          <div className="flex flex-wrap gap-1">
            {items.map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/20 text-white text-xs rounded border border-white/30"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};