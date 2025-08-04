import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export const SessionTimer: React.FC = () => {
  const { hasAccessToSite } = useAuthStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const SESSION_DURATION = 60 * 60 * 1000; // 1 heure
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes avant expiration

    const updateTimer = () => {
      const loginTime = localStorage.getItem('oxo-login-time');
      
      if (!loginTime || !hasAccessToSite) {
        setTimeLeft(0);
        setShowWarning(false);
        return;
      }

      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      const remaining = Math.max(0, SESSION_DURATION - sessionAge);
      
      setTimeLeft(remaining);
      setShowWarning(remaining <= WARNING_TIME && remaining > 0);

      if (remaining <= 0) {
        setTimeLeft(0);
        setShowWarning(false);
      }
    };

    if (hasAccessToSite) {
      updateTimer();
      const interval = setInterval(updateTimer, 1000); // Mise à jour chaque seconde
      
      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
      setShowWarning(false);
    }
  }, [hasAccessToSite]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!hasAccessToSite || timeLeft === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 4px 20px rgba(239, 68, 68, 0.3)",
                "0 8px 30px rgba(239, 68, 68, 0.5)",
                "0 4px 20px rgba(239, 68, 68, 0.3)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3 shadow-lg"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </motion.div>
              
              <div className="text-sm">
                <div className="font-bold text-red-700">
                  ⏰ Session expire bientôt !
                </div>
                <div className="text-red-600 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">
                    {formatTime(timeLeft)}
                  </span>
                  <span>restantes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Indicateur discret en permanence */}
      <div className="fixed bottom-4 right-4 z-40">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`text-xs px-3 py-2 rounded-full border transition-all duration-300 ${
            showWarning 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <span className="font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};