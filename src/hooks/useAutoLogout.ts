import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAutoLogout = () => {
  const { hasAccessToSite, forceLogout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Durée de session : 1 heure exacte
    const SESSION_DURATION = 60 * 60 * 1000; // 1 heure = 3,600,000 ms
    
    // Nettoyer le timeout précédent
    const clearExistingTimeout = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    // Déconnexion forcée avec nettoyage complet
    const performAutoLogout = () => {
      console.log('⏰ DÉCONNEXION AUTOMATIQUE - Session expirée après 1 heure');
      localStorage.removeItem('oxo-login-time');
      localStorage.removeItem('oxo-last-activity');
      forceLogout();
    };
    
    // Vérifier si la session a expiré
    const checkSessionExpiry = () => {
      const loginTime = localStorage.getItem('oxo-login-time');
      
      if (!loginTime || !hasAccessToSite) {
        return false;
      }
      
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      
      if (sessionAge >= SESSION_DURATION) {
        performAutoLogout();
        return true;
      }
      
      // Calculer le temps restant et programmer la déconnexion
      const timeLeft = SESSION_DURATION - sessionAge;
      if (timeLeft > 0) {
        clearExistingTimeout();
        timeoutRef.current = setTimeout(performAutoLogout, timeLeft);
        console.log(`⏰ Déconnexion programmée dans ${Math.round(timeLeft / 60000)} minutes`);
      }
      
      return false;
    };
    
    // Marquer le temps de connexion
    const markLoginTime = () => {
      if (hasAccessToSite) {
        const existingTime = localStorage.getItem('oxo-login-time');
        if (!existingTime) {
          const now = Date.now().toString();
          localStorage.setItem('oxo-login-time', now);
          localStorage.setItem('oxo-last-activity', now);
          console.log('🕐 Session démarrée - expiration dans 1 heure');
          
          // Programmer la déconnexion dans exactement 1 heure
          clearExistingTimeout();
          timeoutRef.current = setTimeout(performAutoLogout, SESSION_DURATION);
        }
      }
    };
    
    // Gestion du retour sur la page (onglet redevient actif)
    const handleVisibilityChange = () => {
      if (!document.hidden && hasAccessToSite) {
        console.log('👁️ Retour sur la page - vérification session');
        checkSessionExpiry();
      }
    };
    
    // Gestion du rechargement/navigation
    const handlePageShow = (event: PageTransitionEvent) => {
      if (hasAccessToSite) {
        console.log('🔄 Page affichée - vérification session');
        // Vérifier immédiatement si la session a expiré
        if (!checkSessionExpiry()) {
          // Si pas expirée, mettre à jour la dernière activité
          localStorage.setItem('oxo-last-activity', Date.now().toString());
        }
      }
    };
    
    // Gestion de la fermeture de page
    const handleBeforeUnload = () => {
      // Marquer la dernière activité avant de quitter
      localStorage.setItem('oxo-last-activity', Date.now().toString());
      console.log('🚪 Page fermée - dernière activité sauvegardée');
    };
    
    // Initialisation
    if (hasAccessToSite) {
      markLoginTime();
      checkSessionExpiry();
    } else {
      clearExistingTimeout();
      localStorage.removeItem('oxo-login-time');
      localStorage.removeItem('oxo-last-activity');
    }
    
    // Event listeners pour détecter les changements de visibilité/navigation
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleVisibilityChange);
    
    // Vérification périodique toutes les 5 minutes pour s'assurer
    const periodicCheck = setInterval(() => {
      if (hasAccessToSite) {
        checkSessionExpiry();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    // Nettoyage
    return () => {
      clearExistingTimeout();
      clearInterval(periodicCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [hasAccessToSite, forceLogout]);
};

// Hook pour nettoyer la session lors de la déconnexion manuelle
export const useSessionCleanup = () => {
  const { hasAccessToSite } = useAuthStore();
  
  useEffect(() => {
    // Si l'utilisateur n'a plus accès, nettoyer le temps de connexion
    if (!hasAccessToSite) {
      localStorage.removeItem('oxo-login-time');
      console.log('🧹 Session nettoyée');
    }
  }, [hasAccessToSite]);
};