import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Search } from 'lucide-react';

interface SearchHelpProps {
  className?: string;
}

export const SearchHelp: React.FC<SearchHelpProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const searchFields = [
    { icon: '👤', label: 'Nom de l\'agent', example: '"Marie", "Jean"' },
    { icon: '📝', label: 'Description/À propos', example: '"vêtements", "mode"' },
    { icon: '🏷️', label: 'Spécialités', example: '"gaming", "smartphones"' },
    { icon: '🌍', label: 'Langues', example: '"français", "anglais"' },
    { icon: '📂', label: 'Catégories', example: '"electronics", "fashion"' },
    { icon: '📧', label: 'Email', example: 'marie@exemple.com' },
    { icon: '🌐', label: 'Site web', example: 'boutique-marie.fr' },
    { icon: '🆔', label: 'Identifiant', example: 'marie2024' }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Bouton d'aide */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Aide pour la recherche"
      >
        <HelpCircle className="w-3 h-3" />
        <span>Aide recherche</span>
      </motion.button>

      {/* Modal d'aide */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Recherche avancée</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                Vous pouvez rechercher dans tous ces champs :
              </p>

              {/* Liste des champs de recherche */}
              <div className="space-y-2 mb-4">
                {searchFields.map((field, index) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{field.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{field.label}</div>
                      <div className="text-xs text-gray-500 italic">Ex: {field.example}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Conseils */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="font-medium text-sm text-blue-900 mb-2">💡 Conseils</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• La recherche n'est pas sensible à la casse</li>
                  <li>• Tapez juste quelques lettres pour trouver</li>
                  <li>• Ex: "mode" trouvera tous les agents liés à la mode</li>
                  <li>• Ex: "français" trouvera tous les agents parlant français</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Recherche instantanée dans <strong>{searchFields.length} champs différents</strong>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};