import { firebaseServiceSync } from '../services/firebaseServiceSync';

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  created_at: string;
  updated_at: string;
}

export class SiteSettingsService {
  
  // Récupérer un paramètre par sa clé
  static async getSetting(key: string): Promise<string | null> {
    try {
      if (key === 'site_password') {
        return firebaseServiceSync.getSitePassword();
      }
      if (key === 'admin_password') {
        return firebaseServiceSync.getAdminPassword();
      }
      return null;
    } catch (error) {
      console.error(`Erreur récupération paramètre ${key}:`, error);
      return null;
    }
  }

  // Mettre à jour ou créer un paramètre
  static async setSetting(key: string, value: string): Promise<boolean> {
    try {
      if (key === 'site_password') {
        return await firebaseServiceSync.setSitePassword(value);
      }
      if (key === 'admin_password') {
        return await firebaseServiceSync.setAdminPassword(value);
      }
      console.log(`✅ Paramètre ${key} sauvegardé:`, value);
      return true;
    } catch (error) {
      console.error(`Erreur sauvegarde paramètre ${key}:`, error);
      return false;
    }
  }

  // Récupérer tous les paramètres
  static async getAllSettings(): Promise<Record<string, string>> {
    try {
      return {
        'site_password': firebaseServiceSync.getSitePassword(),
        'admin_password': firebaseServiceSync.getAdminPassword()
      };
    } catch (error) {
      console.error('Erreur récupération de tous les paramètres:', error);
      return {};
    }
  }

  // Récupérer le mot de passe du site
  static async getSitePassword(): Promise<string> {
    return firebaseServiceSync.getSitePassword();
  }

  // Mettre à jour le mot de passe du site
  static async setSitePassword(newPassword: string): Promise<boolean> {
    return await firebaseServiceSync.setSitePassword(newPassword);
  }

  // Récupérer le mot de passe admin
  static async getAdminPassword(): Promise<string> {
    return firebaseServiceSync.getAdminPassword();
  }

  // Mettre à jour le mot de passe admin
  static async setAdminPassword(newPassword: string): Promise<boolean> {
    return await firebaseServiceSync.setAdminPassword(newPassword);
  }

  // Initialiser les paramètres par défaut si ils n'existent pas
  static async initializeDefaultSettings(): Promise<void> {
    try {
      // Les paramètres par défaut sont déjà définis dans databaseService
      console.log('✅ Paramètres par défaut initialisés');
    } catch (error) {
      console.error('Erreur initialisation paramètres par défaut:', error);
    }
  }
}