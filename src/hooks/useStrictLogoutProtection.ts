import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useStrictLogoutProtection = () => {
  const { user, forceLogout } = useAuthStore();

  useEffect(() => {
    // Protection stricte : déconnecter sur TOUTE interaction
    const protectPageInteraction = (event: Event) => {
      if (user) {
        console.log('🚨 Interaction détectée avec utilisateur connecté - DÉCONNEXION:', event.type);
        forceLogout();
      }
    };

    // Écouter tous les événements d'interaction
    const events = [
      'click',
      'keydown', 
      'touchstart',
      'scroll',
      'mousemove',
      'focus',
      'blur'
    ];

    // Délai avant d'activer la protection (pour éviter la déconnexion immédiate)
    const timeoutId = setTimeout(() => {
      events.forEach(eventType => {
        document.addEventListener(eventType, protectPageInteraction, { passive: true });
      });
      console.log('🛡️ Protection stricte de déconnexion ACTIVÉE');
    }, 2000); // 2 secondes de délai

    return () => {
      clearTimeout(timeoutId);
      events.forEach(eventType => {
        document.removeEventListener(eventType, protectPageInteraction);
      });
      console.log('🛡️ Protection stricte de déconnexion DÉSACTIVÉE');
    };
  }, [user, forceLogout]);
};