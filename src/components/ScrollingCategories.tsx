import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollingCategoriesProps {
  categories: string[];
  categoryLabels?: Record<string, string>;
  className?: string;
  maxVisible?: number;
  scrollSpeed?: number;
}

const categoryLabels = {
  electronics: 'Électronique',
  fashion: 'Mode',
  accessories: 'Accessoires',
  'home-garden': 'Maison & Jardin',
  beauty: 'Beauté',
  sports: 'Sport',
  'books-media': 'Livres & Médias',
  automotive: 'Automobile',
  travel: 'Voyage',
  food: 'Alimentation',
  services: 'Services',
  other: 'Autre'
};

export const ScrollingCategories: React.FC<ScrollingCategoriesProps> = ({
  categories,
  categoryLabels: customLabels = categoryLabels,
  className = '',
  maxVisible = 2,
  scrollSpeed = 3000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Si moins de catégories que maxVisible, les afficher toutes sans défilement
  if (categories.length <= maxVisible) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {categories.map((category, index) => (
          <motion.span
            key={category}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            {customLabels[category] || category}
          </motion.span>
        ))}
      </div>
    );
  }

  // Calculer les catégories visibles
  const visibleCategories = [];
  for (let i = 0; i < maxVisible; i++) {
    const index = (currentIndex + i) % categories.length;
    visibleCategories.push(categories[index]);
  }

  // Défilement automatique
  useEffect(() => {
    if (!isHovered && categories.length > maxVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
      }, scrollSpeed);

      return () => clearInterval(interval);
    }
  }, [categories.length, maxVisible, scrollSpeed, isHovered]);

  return (
    <div 
      className={`relative flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indicateur de défilement (si plus de catégories) */}
      {categories.length > maxVisible && (
        <div className="flex items-center space-x-1 mr-2">
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(categories.length, 5) }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex % Math.min(categories.length, 5)
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Catégories avec animation */}
      <div className="flex gap-2 overflow-hidden">
        {visibleCategories.map((category, index) => {
          const globalIndex = (currentIndex + index) % categories.length;
          return (
            <motion.span
              key={`${category}-${globalIndex}`}
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeInOut"
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                index === 0 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {customLabels[category] || category}
            </motion.span>
          );
        })}
      </div>

      {/* Compteur total si beaucoup de catégories */}
      {categories.length > maxVisible && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 ml-1"
          title={`${categories.length} catégories au total`}
        >
          +{categories.length - maxVisible}
        </motion.span>
      )}

      {/* Contrôles manuels (optionnel) */}
      {categories.length > maxVisible && isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex items-center space-x-1 ml-2"
        >
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? categories.length - 1 : prev - 1
            )}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Précédent"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % categories.length)}
            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Suivant"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </div>
  );
};