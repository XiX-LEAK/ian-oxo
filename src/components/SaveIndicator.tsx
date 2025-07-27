import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Save, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  error?: string | null;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ 
  isSaving = false, 
  lastSaved = null, 
  error = null 
}) => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isSaving || lastSaved || error) {
      setShowIndicator(true);
      
      // Masquer automatiquement après 3 secondes si pas d'erreur
      if (!isSaving && !error) {
        const timer = setTimeout(() => {
          setShowIndicator(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSaving, lastSaved, error]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`
            flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg border
            ${error ? 'bg-red-50 border-red-200 text-red-800' : 
              isSaving ? 'bg-blue-50 border-blue-200 text-blue-800' : 
              'bg-green-50 border-green-200 text-green-800'}
          `}>
            {error ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Erreur de sauvegarde</span>
              </>
            ) : isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Save className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-medium">Sauvegarde...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Sauvegardé à {lastSaved ? formatTime(lastSaved) : 'maintenant'}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};