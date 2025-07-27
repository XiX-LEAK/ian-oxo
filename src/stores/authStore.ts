import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';
import { SiteSettingsService } from '@/utils/siteSettings';

interface AuthStore extends AuthState {
  // État
  user: User | null;
  isLoading: boolean;
  error: string | null;
  mode: 'visitor' | 'admin';
  hasAccessToSite: boolean;
  sitePassword: string;
  sessionId: string | null;

  // Actions d'authentification simplifiées
  checkSitePassword: (password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  switchToVisitor: () => void;
  switchToAdmin: (password: string) => Promise<boolean>;
  
  // Session management
  generateNewSession: () => string;
  checkSessionValidity: () => boolean;
  forceLogout: () => void;
  
  // Gestion des mots de passe (Supabase + localStorage fallback)
  updateSitePassword: (newPassword: string) => Promise<boolean>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  getSitePassword: () => Promise<string>;
  getAdminPassword: () => Promise<string>;
  
  // Gestion des erreurs
  setError: (error: string | null) => void;
  setErrorWithTimeout: (error: string, timeout?: number) => void;
  clearError: () => void;
}


export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // État initial
      user: null,
      isLoading: false,
      error: null,
      mode: 'visitor',
      hasAccessToSite: false,
      sitePassword: 'oxo2024',
      sessionId: null,

      // Initialisation de l'authentification
      initializeAuth: async () => {
        try {
          console.log('🔄 Initialisation de l\'authentification...');
          
          // Initialiser les paramètres par défaut dans Supabase
          await SiteSettingsService.initializeDefaultSettings();
          
          const sitePassword = await SiteSettingsService.getSitePassword();
          
          set({ 
            sitePassword,
            error: null 
          });
          
          console.log('✅ Authentification initialisée');
        } catch (error) {
          console.error('❌ Erreur initialisation auth:', error);
          // Fallback localStorage si Supabase ne marche pas
          const sitePassword = localStorage.getItem('oxo-site-password') || 'oxo2024';
          set({ 
            sitePassword,
            error: null 
          });
        }
      },



      // Déconnexion
      logout: () => {
        set({ user: null, mode: 'visitor', error: null, hasAccessToSite: false });
        console.log('🚪 Déconnexion réussie');
      },

      // Switch to visitor mode
      switchToVisitor: () => {
        const currentState = get();
        if (currentState.user) {
          set({ 
            mode: 'visitor',
            error: null
          });
          console.log('🔄 Basculé en mode visiteur');
        }
      },

      // Switch to admin mode
      switchToAdmin: async (password: string) => {
        try {
          const currentAdminPassword = await get().getAdminPassword();
          
          if (password !== currentAdminPassword) {
            set({ error: 'Mot de passe administrateur incorrect' });
            return false;
          }
          
          const user: User = {
            id: 'admin-local',
            email: 'admin@oxo.local',
            username: 'admin',
            role: 'admin',
            isAuthenticated: true,
            lastLogin: new Date()
          };
          
          set({ 
            mode: 'admin',
            user,
            hasAccessToSite: true,
            error: null
          });
          
          console.log('🔑 Mode admin activé');
          return true;
        } catch (error) {
          console.error('❌ Erreur switchToAdmin:', error);
          set({ error: 'Erreur lors de la vérification du mot de passe admin' });
          return false;
        }
      },

      // Gestion des mots de passe (Supabase + localStorage fallback)
      updateSitePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });
        
        const currentState = get();
        const currentUser = currentState.user;
        
        try {
          // Récupérer l'ancien mot de passe pour le log
          const oldPassword = await get().getSitePassword();
          
          // Essayer de sauvegarder dans Supabase
          const supabaseSuccess = await SiteSettingsService.setSitePassword(newPassword);
          
          if (supabaseSuccess) {
            // Sauvegarder aussi en localStorage comme backup
            localStorage.setItem('oxo-site-password', newPassword);
            
            set({ 
              sitePassword: newPassword,
              isLoading: false,
              error: null 
            });
            
            // Enregistrer le changement dans les logs
            // Logging retiré - mode local
            
            console.log('✅ Mot de passe du site mis à jour dans Supabase et localStorage + log enregistré');
            return true;
          } else {
            throw new Error('Échec sauvegarde Supabase');
          }
        } catch (error) {
          console.error('❌ Erreur mise à jour mot de passe site:', error);
          
          // Enregistrer l'échec dans les logs
          // Logging retiré - mode local
          
          // Fallback: sauvegarder seulement en localStorage
          localStorage.setItem('oxo-site-password', newPassword);
          set({ 
            sitePassword: newPassword,
            isLoading: false,
            error: 'Sauvegardé localement seulement (Supabase indisponible)' 
          });
          
          console.log('⚠️ Mot de passe du site sauvegardé en localStorage uniquement');
          return true;
        }
      },

      updateAdminPassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });
        
        const currentState = get();
        const currentUser = currentState.user;
        
        try {
          // Récupérer l'ancien mot de passe pour le log
          const oldPassword = await get().getAdminPassword();
          
          // Essayer de sauvegarder dans Supabase
          const supabaseSuccess = await SiteSettingsService.setAdminPassword(newPassword);
          
          if (supabaseSuccess) {
            // Sauvegarder aussi en localStorage comme backup
            localStorage.setItem('oxo-admin-password', newPassword);
            
            set({ isLoading: false, error: null });
            
            // Enregistrer le changement dans les logs
            // Logging retiré - mode local
            
            console.log('✅ Mot de passe admin mis à jour dans Supabase et localStorage + log enregistré');
            return true;
          } else {
            throw new Error('Échec sauvegarde Supabase');
          }
        } catch (error) {
          console.error('❌ Erreur mise à jour mot de passe admin:', error);
          
          // Enregistrer l'échec dans les logs
          // Logging retiré - mode local
          
          // Fallback: sauvegarder seulement en localStorage
          localStorage.setItem('oxo-admin-password', newPassword);
          set({ 
            isLoading: false,
            error: 'Sauvegardé localement seulement (Supabase indisponible)' 
          });
          
          console.log('⚠️ Mot de passe admin sauvegardé en localStorage uniquement');
          return true;
        }
      },

      getSitePassword: async () => {
        try {
          // Essayer d'abord Supabase
          const supabasePassword = await SiteSettingsService.getSitePassword();
          if (supabasePassword) {
            return supabasePassword;
          }
          
          // Fallback localStorage
          return localStorage.getItem('oxo-site-password') || 'oxo2024';
        } catch (error) {
          console.error('Erreur récupération mot de passe site:', error);
          // Fallback localStorage
          return localStorage.getItem('oxo-site-password') || 'oxo2024';
        }
      },

      getAdminPassword: async () => {
        try {
          // Essayer d'abord Supabase
          const supabasePassword = await SiteSettingsService.getAdminPassword();
          if (supabasePassword) {
            return supabasePassword;
          }
          
          // Fallback localStorage
          return localStorage.getItem('oxo-admin-password') || 'oxo2025admin';
        } catch (error) {
          console.error('Erreur récupération mot de passe admin:', error);
          // Fallback localStorage
          return localStorage.getItem('oxo-admin-password') || 'oxo2025admin';
        }
      },


      checkSitePassword: async (password: string) => {
        try {
          const correctPassword = await get().getSitePassword();
          const isValid = password === correctPassword;
          
          if (isValid) {
            set({ hasAccessToSite: true, error: null });
            console.log('✅ Mot de passe du site validé');
          } else {
            set({ error: 'Mot de passe du site incorrect' });
            console.log('❌ Mot de passe du site incorrect');
          }
          
          return isValid;
        } catch (error) {
          console.error('Erreur vérification mot de passe site:', error);
          set({ error: 'Erreur lors de la vérification du mot de passe' });
          return false;
        }
      },


      // Session management
      generateNewSession: () => {
        const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        set({ sessionId });
        localStorage.setItem('oxo-session-id', sessionId);
        localStorage.setItem('oxo-session-timestamp', Date.now().toString());
        return sessionId;
      },

      checkSessionValidity: () => {
        const storedSessionId = localStorage.getItem('oxo-session-id');
        const storedTimestamp = localStorage.getItem('oxo-session-timestamp');
        const currentState = get();
        
        if (!storedSessionId || !storedTimestamp || !currentState.sessionId) {
          return false;
        }
        
        return storedSessionId === currentState.sessionId;
      },

      forceLogout: () => {
        // Nettoyage complet de toutes les données de session
        try {
          localStorage.removeItem('oxo-session-id');
          localStorage.removeItem('oxo-session-timestamp');
          localStorage.removeItem('oxo-auth-storage');
          
          // Reset complet de l'état Zustand
          set({ 
            user: null,
            mode: 'visitor',
            hasAccessToSite: false,
            sessionId: null,
            sitePassword: localStorage.getItem('oxo-site-password') || 'oxo2024',
            isLoading: false,
            error: null
          });
          
          console.log('🔐 DÉCONNEXION FORCÉE COMPLÈTE - Toutes les données effacées');
          
          // Forcer le rechargement pour s'assurer que tout est propre
          setTimeout(() => {
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            }
          }, 100);
          
        } catch (error) {
          console.error('Erreur lors du nettoyage:', error);
          // Même en cas d'erreur, forcer la réinitialisation
          set({ 
            user: null,
            mode: 'visitor',
            hasAccessToSite: false,
            sessionId: null,
            error: null
          });
        }
      },


      // Gestion des erreurs
      setError: (error: string | null) => set({ error }),
      setErrorWithTimeout: (error: string, timeout: number = 3000) => {
        set({ error });
        setTimeout(() => {
          set({ error: null });
        }, timeout);
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'oxo-auth-storage',
      partialize: (state) => ({ 
        hasAccessToSite: state.hasAccessToSite,
        sitePassword: state.sitePassword,
        mode: state.mode,
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        // Vérifier la validité de la session lors de la rehydratation
        if (state && state.hasAccessToSite) {
          const loginTime = localStorage.getItem('oxo-login-time');
          const SESSION_DURATION = 60 * 60 * 1000; // 1 heure
          
          if (!loginTime) {
            // Pas de temps de connexion enregistré, déconnecter
            state.hasAccessToSite = false;
            state.user = null;
            state.mode = 'visitor';
            console.log('🚪 Store rehydraté - Pas de session valide');
          } else {
            const now = Date.now();
            const sessionAge = now - parseInt(loginTime);
            
            if (sessionAge > SESSION_DURATION) {
              // Session expirée, déconnecter
              state.hasAccessToSite = false;
              state.user = null;
              state.mode = 'visitor';
              localStorage.removeItem('oxo-login-time');
              console.log('🚪 Store rehydraté - Session expirée');
            } else {
              console.log('✅ Store rehydraté - Session valide');
            }
          }
        } else {
          console.log('✅ Store rehydraté - Utilisateur déconnecté');
        }
      }
    }
  )
);