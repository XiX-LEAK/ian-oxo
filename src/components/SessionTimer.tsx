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

  // Timer caché mais système de déconnexion toujours actif
  // Le timer continue de fonctionner en arrière-plan pour la déconnexion automatique
  return null;
};