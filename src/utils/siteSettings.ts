import { supabase } from './supabase';

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
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .maybeSingle();

      if (error) {
        console.error(`Erreur récupération paramètre ${key}:`, error);
        return null;
      }

      return data?.setting_value || null;
    } catch (error) {
      console.error(`Erreur récupération paramètre ${key}:`, error);
      return null;
    }
  }

  // Mettre à jour ou créer un paramètre
  static async setSetting(key: string, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            setting_key: key,
            setting_value: value,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'setting_key'
          }
        );

      if (error) {
        console.error(`Erreur sauvegarde paramètre ${key}:`, error);
        return false;
      }

      console.log(`✅ Paramètre ${key} sauvegardé dans Supabase:`, value);
      return true;
    } catch (error) {
      console.error(`Erreur sauvegarde paramètre ${key}:`, error);
      return false;
    }
  }

  // Récupérer tous les paramètres
  static async getAllSettings(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Erreur récupération de tous les paramètres:', error);
        return {};
      }

      const settings: Record<string, string> = {};
      data?.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error('Erreur récupération de tous les paramètres:', error);
      return {};
    }
  }

  // Récupérer le mot de passe du site
  static async getSitePassword(): Promise<string> {
    const password = await this.getSetting('site_password');
    return password || 'oxo2024'; // Valeur par défaut
  }

  // Mettre à jour le mot de passe du site
  static async setSitePassword(newPassword: string): Promise<boolean> {
    return this.setSetting('site_password', newPassword);
  }

  // Récupérer le mot de passe admin
  static async getAdminPassword(): Promise<string> {
    const password = await this.getSetting('admin_password');
    return password || 'oxo2025admin'; // Valeur par défaut
  }

  // Mettre à jour le mot de passe admin
  static async setAdminPassword(newPassword: string): Promise<boolean> {
    return this.setSetting('admin_password', newPassword);
  }

  // Initialiser les paramètres par défaut si ils n'existent pas
  static async initializeDefaultSettings(): Promise<void> {
    try {
      const settings = await this.getAllSettings();
      
      if (!settings.site_password) {
        await this.setSitePassword('oxo2024');
      }
      
      if (!settings.admin_password) {
        await this.setAdminPassword('oxo2025admin');
      }

      console.log('✅ Paramètres par défaut initialisés');
    } catch (error) {
      console.error('Erreur initialisation paramètres par défaut:', error);
    }
  }
}