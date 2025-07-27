import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAutoLogout = () => {
  const { hasAccessToSite, logout } = useAuthStore();

  useEffect(() => {
    // Durée de session : 1 heure (3600000 ms)
    const SESSION_DURATION = 60 * 60 * 1000; // 1 heure
    
    // Vérifier si la session a expiré
    const checkSessionExpiry = () => {
      const loginTime = localStorage.getItem('oxo-login-time');
      
      if (!loginTime) {
        return false; // Pas de session active
      }
      
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      
      if (sessionAge > SESSION_DURATION) {
        console.log('⏰ Session expirée après 1 heure - déconnexion');
        localStorage.removeItem('oxo-login-time');
        return true; // Session expirée
      }
      
      return false; // Session encore valide
    };
    
    // Marquer le temps de connexion quand l'utilisateur se connecte
    const markLoginTime = () => {
      if (hasAccessToSite) {
        const existingTime = localStorage.getItem('oxo-login-time');
        if (!existingTime) {
          localStorage.setItem('oxo-login-time', Date.now().toString());
          console.log('🕐 Temps de connexion enregistré');
        }
      }
    };
    
    // Vérification à l'initialisation et toutes les 30 secondes
    const checkAndLogout = () => {
      if (hasAccessToSite && checkSessionExpiry()) {
        logout();
      }
    };
    
    // Gestion de la visibilité (quitter/revenir sur la page)
    const handleVisibilityChange = () => {
      if (!document.hidden && hasAccessToSite) {
        // L'utilisateur revient sur la page, vérifier l'expiration
        console.log('👁️ Retour sur la page - vérification de session');
        if (checkSessionExpiry()) {
          logout();
        }
      }
    };
    
    // Gestion du rafraîchissement de page
    const handlePageShow = () => {
      if (hasAccessToSite) {
        console.log('🔄 Page chargée - vérification de session');
        if (checkSessionExpiry()) {
          logout();
        }
      }
    };
    
    // Nettoyage de la session lors de la fermeture
    const handleBeforeUnload = () => {
      // Ne pas supprimer le temps de connexion, juste marquer qu'on quitte
      console.log('🚪 Page sur le point de se fermer');
    };
    
    // Marquer le temps de connexion si l'utilisateur est connecté
    markLoginTime();
    
    // Vérification initiale
    checkAndLogout();
    
    // Timer de vérification toutes les 30 secondes
    const sessionCheckInterval = setInterval(() => {
      checkAndLogout();
    }, 30000); // 30 secondes
    
    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Nettoyage
    return () => {
      clearInterval(sessionCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAccessToSite, logout]);
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