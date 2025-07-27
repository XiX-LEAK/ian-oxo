// Intercepteur global pour déconnexion automatique stricte
import { useAuthStore } from '@/stores/authStore';

let isInterceptorActive = false;
let originalPushState: typeof history.pushState;
let originalReplaceState: typeof history.replaceState;

export const activateGlobalLogoutInterceptor = () => {
  if (isInterceptorActive) return;
  
  console.log('🚨 Activation de l\'intercepteur global de déconnexion');
  
  // Intercepter les changements d'historique
  originalPushState = history.pushState;
  originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    console.log('🚨 Navigation détectée (pushState) - Vérification déconnexion');
    checkAndLogout('Navigation pushState');
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    console.log('🚨 Navigation détectée (replaceState) - Vérification déconnexion');
    checkAndLogout('Navigation replaceState');
    return originalReplaceState.apply(this, args);
  };
  
  // Intercepter les événements de navigation
  window.addEventListener('popstate', () => {
    console.log('🚨 Navigation détectée (popstate) - Vérification déconnexion');
    checkAndLogout('Navigation popstate');
  });
  
  // Intercepter les événements de hashchange
  window.addEventListener('hashchange', () => {
    console.log('🚨 Hash change détecté - Vérification déconnexion');
    checkAndLogout('Hash change');
  });
  
  // Intercepter le retour de page depuis le cache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('🚨 Page restaurée depuis le cache - DÉCONNEXION');
      checkAndLogout('Page restaurée depuis le cache');
    }
  });
  
  isInterceptorActive = true;
};

export const deactivateGlobalLogoutInterceptor = () => {
  if (!isInterceptorActive) return;
  
  console.log('🛑 Désactivation de l\'intercepteur global de déconnexion');
  
  // Restaurer les méthodes originales
  if (originalPushState) {
    history.pushState = originalPushState;
  }
  if (originalReplaceState) {
    history.replaceState = originalReplaceState;
  }
  
  isInterceptorActive = false;
};

const checkAndLogout = (reason: string) => {
  const { user, forceLogout } = useAuthStore.getState();
  
  if (user) {
    console.log(`🚨 DÉCONNEXION AUTOMATIQUE - Raison: ${reason}`);
    forceLogout();
  }
};

// Activer automatiquement l'intercepteur
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(activateGlobalLogoutInterceptor, 1000);
    });
  } else {
    setTimeout(activateGlobalLogoutInterceptor, 1000);
  }
}

export { isInterceptorActive };