import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { PageLoadDetector, isPageReloaded } from '@/utils/pageLoadDetector';

export const useSessionManager = () => {
  const { forceLogout, user } = useAuthStore();

  const autoLogoutOnPageLoad = useCallback(() => {
    console.log('🔍 Session manager - Mode déconnexion désactivé temporairement');
    
    // TEMPORAIREMENT DÉSACTIVÉ pour corriger le bug d'écran blanc
    // La déconnexion automatique sera réimplémentée de manière moins agressive
    
    // Nettoyer seulement le détecteur de page
    PageLoadDetector.clearLoadId();
  }, [user]);

  const autoLogoutOnVisibilityChange = useCallback(() => {
    // DÉSACTIVÉ - Causait l'écran blanc
    console.log('🔍 Visibility change détecté - Déconnexion désactivée');
  }, [user]);

  const autoLogoutOnFocus = useCallback(() => {
    // DÉSACTIVÉ - Causait l'écran blanc
    console.log('🔍 Focus détecté - Déconnexion désactivée');
  }, [user]);

  const autoLogoutOnPageShow = useCallback(() => {
    // DÉSACTIVÉ - Causait l'écran blanc
    console.log('🔍 PageShow détecté - Déconnexion désactivée');
  }, [user]);

  useEffect(() => {
    // Déconnexion immédiate au montage du composant
    autoLogoutOnPageLoad();

    // Écouter tous les événements de retour/focus/visibilité
    window.addEventListener('focus', autoLogoutOnFocus);
    window.addEventListener('pageshow', autoLogoutOnPageShow);
    document.addEventListener('visibilitychange', autoLogoutOnVisibilityChange);

    // Déconnexion lors de la fermeture/rechargement de la page
    const handleBeforeUnload = () => {
      if (user) {
        console.log('🚨 Page fermée/rechargée - nettoyage session');
        // Nettoyer les données de session
        localStorage.removeItem('oxo-session-id');
        localStorage.removeItem('oxo-session-timestamp');
        localStorage.removeItem('oxo-auth-storage');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Nettoyage
    return () => {
      window.removeEventListener('focus', autoLogoutOnFocus);
      window.removeEventListener('pageshow', autoLogoutOnPageShow);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', autoLogoutOnVisibilityChange);
    };
  }, [autoLogoutOnPageLoad, autoLogoutOnFocus, autoLogoutOnPageShow, autoLogoutOnVisibilityChange, user]);

  // Fonction pour invalider manuellement toutes les sessions
  const invalidateAllSessions = useCallback(() => {
    localStorage.removeItem('oxo-session-id');
    localStorage.removeItem('oxo-session-timestamp');
    localStorage.removeItem('oxo-auth-storage');
    forceLogout();
    console.log('🧹 Toutes les sessions ont été invalidées manuellement');
  }, [forceLogout]);

  return {
    invalidateAllSessions,
    autoLogoutOnPageLoad
  };
};