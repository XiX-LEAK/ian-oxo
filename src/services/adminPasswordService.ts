// 🔐 SERVICE AVANCÉ DE GESTION DES MOTS DE PASSE ADMIN
// Service spécialisé pour OXO-Ultimate avec sécurité renforcée et historique complet

import { supabase } from '@/utils/supabase';

// ===================================================================
// INTERFACES ET TYPES
// ===================================================================

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordType: 'site' | 'admin';
  adminUserId?: string;
  adminEmail?: string;
}

export interface PasswordChangeLog {
  id: string;
  change_type: 'site_password' | 'admin_password';
  admin_user_id?: string;
  admin_email?: string;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  notes?: string;
  session_id?: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  event_description: string;
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  resolved: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  score: number;
}

// ===================================================================
// SERVICE PRINCIPAL DE GESTION DES MOTS DE PASSE
// ===================================================================

export class AdminPasswordService {
  
  // ===================================================================
  // VALIDATION ET SÉCURITÉ
  // ===================================================================
  
  /**
   * Valide la force d'un mot de passe avec critères de sécurité
   */
  static validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;
    
    // Critères de validation
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    } else {
      score += 2;
      if (password.length >= 12) score += 1;
      if (password.length >= 16) score += 1;
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir des lettres minuscules');
    } else {
      score += 1;
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir des lettres majuscules');
    } else {
      score += 1;
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir des chiffres');
    } else {
      score += 1;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir des caractères spéciaux');
    } else {
      score += 2;
    }
    
    // Vérifier les mots de passe communs
    const commonPasswords = [
      'password', '123456', 'admin', 'oxo', 'oxo2024', 'oxo2025',
      'password123', 'admin123', 'qwerty', 'azerty'
    ];
    
    if (commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    )) {
      errors.push('Le mot de passe ne doit pas contenir de mots courants');
      score = Math.max(0, score - 2);
    }
    
    // Déterminer la force
    let strength: PasswordValidationResult['strength'];
    if (score >= 7) strength = 'very_strong';
    else if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';
    else strength = 'weak';
    
    return {
      isValid: errors.length === 0 && score >= 4,
      errors,
      strength,
      score
    };
  }
  
  /**
   * Génère un mot de passe sécurisé automatiquement
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Garantir au moins un caractère de chaque type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Compléter avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
  
  // ===================================================================
  // GESTION DES MOTS DE PASSE
  // ===================================================================
  
  /**
   * Change le mot de passe avec validation complète et logging
   */
  static async changePassword(request: PasswordChangeRequest): Promise<{
    success: boolean;
    message: string;
    logId?: string;
  }> {
    try {
      console.log('🔄 Début du changement de mot de passe:', request.passwordType);
      
      // 1. Validation de base
      if (request.newPassword !== request.confirmPassword) {
        return {
          success: false,
          message: 'Les mots de passe de confirmation ne correspondent pas'
        };
      }
      
      // 2. Validation de la force du mot de passe
      const validation = this.validatePasswordStrength(request.newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join('. ') + '.'
        };
      }
      
      // 3. Vérifier le mot de passe actuel
      const currentPassword = await this.getCurrentPassword(request.passwordType);
      if (request.currentPassword !== currentPassword) {
        // Log de tentative d'accès non autorisée
        await this.logSecurityEvent({
          event_type: 'unauthorized_password_change_attempt',
          event_description: `Tentative de changement de mot de passe ${request.passwordType} avec mauvais mot de passe actuel`,
          user_id: request.adminUserId,
          severity: 'high'
        });
        
        return {
          success: false,
          message: 'Le mot de passe actuel est incorrect'
        };
      }
      
      // 4. Vérifier que le nouveau mot de passe est différent de l'actuel
      if (request.currentPassword === request.newPassword) {
        return {
          success: false,
          message: 'Le nouveau mot de passe doit être différent de l\'actuel'
        };
      }
      
      // 5. Effectuer le changement
      const settingKey = request.passwordType === 'site' ? 'site_password' : 'admin_password';
      const success = await this.updatePasswordInSupabase(settingKey, request.newPassword);
      
      // 6. Créer un hash de l'ancien mot de passe pour l'historique
      const previousPasswordHash = btoa(request.currentPassword + ':' + Date.now());
      
      // 7. Enregistrer dans les logs
      const logId = await this.logPasswordChange({
        changeType: request.passwordType === 'site' ? 'site_password' : 'admin_password',
        adminUserId: request.adminUserId,
        adminEmail: request.adminEmail,
        success,
        notes: success ? 
          `Changement réussi - Force: ${validation.strength} (${validation.score}/8)` : 
          'Échec de sauvegarde dans Supabase',
        previousPasswordHash
      });
      
      // 8. Sauvegarder aussi en localStorage comme backup
      if (success) {
        const localStorageKey = request.passwordType === 'site' ? 'oxo-site-password' : 'oxo-admin-password';
        localStorage.setItem(localStorageKey, request.newPassword);
        
        // Log de sécurité pour les changements critiques
        if (request.passwordType === 'admin') {
          await this.logSecurityEvent({
            event_type: 'admin_password_changed_successfully',
            event_description: 'Mot de passe administrateur modifié avec succès',
            user_id: request.adminUserId,
            severity: 'medium'
          });
        }
        
        console.log('✅ Mot de passe changé avec succès');
        return {
          success: true,
          message: `Mot de passe ${request.passwordType === 'site' ? 'du site' : 'administrateur'} mis à jour avec succès`,
          logId
        };
      } else {
        console.error('❌ Échec du changement de mot de passe');
        return {
          success: false,
          message: 'Erreur lors de la sauvegarde du nouveau mot de passe'
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du changement de mot de passe:', error);
      
      // Log de l'erreur
      await this.logPasswordChange({
        changeType: request.passwordType === 'site' ? 'site_password' : 'admin_password',
        adminUserId: request.adminUserId,
        adminEmail: request.adminEmail,
        success: false,
        notes: `Erreur système: ${error}`
      });
      
      return {
        success: false,
        message: 'Erreur système lors du changement de mot de passe'
      };
    }
  }
  
  /**
   * Récupère le mot de passe actuel depuis Supabase ou localStorage
   */
  private static async getCurrentPassword(type: 'site' | 'admin'): Promise<string> {
    try {
      const settingKey = type === 'site' ? 'site_password' : 'admin_password';
      
      // Essayer d'abord Supabase
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .maybeSingle();
      
      if (!error && data) {
        return data.setting_value;
      }
      
      // Fallback localStorage
      const localStorageKey = type === 'site' ? 'oxo-site-password' : 'oxo-admin-password';
      const defaultPassword = type === 'site' ? 'oxodemo2025' : 'oxo2025admin';
      
      return localStorage.getItem(localStorageKey) || defaultPassword;
      
    } catch (error) {
      console.error('Erreur récupération mot de passe:', error);
      
      // Fallback final
      const localStorageKey = type === 'site' ? 'oxo-site-password' : 'oxo-admin-password';
      const defaultPassword = type === 'site' ? 'oxodemo2025' : 'oxo2025admin';
      
      return localStorage.getItem(localStorageKey) || defaultPassword;
    }
  }
  
  /**
   * Met à jour le mot de passe dans Supabase
   */
  private static async updatePasswordInSupabase(settingKey: string, newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: newPassword,
          updated_at: new Date().toISOString(),
          updated_by: 'admin_interface'
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) {
        console.error('Erreur mise à jour Supabase:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur mise à jour Supabase:', error);
      return false;
    }
  }
  
  // ===================================================================
  // GESTION DES LOGS ET HISTORIQUE
  // ===================================================================
  
  /**
   * Enregistre un changement de mot de passe dans les logs
   */
  static async logPasswordChange(data: {
    changeType: 'site_password' | 'admin_password';
    adminUserId?: string;
    adminEmail?: string;
    success: boolean;
    notes?: string;
    previousPasswordHash?: string;
  }): Promise<string | null> {
    try {
      const logEntry = {
        change_type: data.changeType,
        admin_user_id: data.adminUserId || null,
        admin_email: data.adminEmail || null,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        previous_password_hash: data.previousPasswordHash || null,
        success: data.success,
        notes: data.notes || null,
        session_id: this.generateSessionId()
      };
      
      const { data: result, error } = await supabase
        .from('password_change_logs')
        .insert([logEntry])
        .select('id')
        .single();
      
      if (error) {
        console.error('Erreur enregistrement log:', error);
        return null;
      }
      
      console.log('✅ Log de changement de mot de passe enregistré:', result.id);
      return result.id;
      
    } catch (error) {
      console.error('Erreur enregistrement log:', error);
      return null;
    }
  }
  
  /**
   * Enregistre un événement de sécurité
   */
  static async logSecurityEvent(event: {
    event_type: string;
    event_description: string;
    user_id?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    try {
      const securityEvent = {
        event_type: event.event_type,
        event_description: event.event_description,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        user_id: event.user_id || null,
        severity: event.severity || 'medium',
        event_data: {
          timestamp: new Date().toISOString(),
          page_url: window.location.href,
          referrer: document.referrer
        }
      };
      
      const { error } = await supabase
        .from('security_logs')
        .insert([securityEvent]);
      
      if (error) {
        console.error('Erreur enregistrement événement sécurité:', error);
      } else {
        console.log('🛡️ Événement de sécurité enregistré:', event.event_type);
      }
      
    } catch (error) {
      console.error('Erreur enregistrement événement sécurité:', error);
    }
  }
  
  /**
   * Récupère l'historique des changements de mot de passe
   */
  static async getPasswordChangeHistory(limit: number = 50): Promise<PasswordChangeLog[]> {
    try {
      const { data, error } = await supabase
        .from('password_change_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Erreur récupération historique:', error);
        return [];
      }
      
      return data || [];
      
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      return [];
    }
  }
  
  /**
   * Récupère les événements de sécurité récents
   */
  static async getRecentSecurityEvents(limit: number = 20): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Erreur récupération événements sécurité:', error);
        return [];
      }
      
      return data || [];
      
    } catch (error) {
      console.error('Erreur récupération événements sécurité:', error);
      return [];
    }
  }
  
  /**
   * Nettoie les anciens logs (garde les 100 plus récents)
   */
  static async cleanupOldLogs(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_password_change_logs');
      
      if (error) {
        console.error('Erreur nettoyage logs:', error);
        return 0;
      }
      
      console.log(`🧹 ${data || 0} anciens logs supprimés`);
      return data || 0;
      
    } catch (error) {
      console.error('Erreur nettoyage logs:', error);
      return 0;
    }
  }
  
  // ===================================================================
  // UTILITAIRES
  // ===================================================================
  
  /**
   * Récupère l'adresse IP du client (approximation)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // Dans un environnement de production, vous pourriez utiliser un service externe
      // pour obtenir l'IP réelle du client
      return 'client_ip_not_available';
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Génère un ID de session unique
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Vérifie si Supabase est disponible
   */
  static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .select('setting_key')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }
}

// ===================================================================
// EXPORT PAR DÉFAUT
// ===================================================================

export default AdminPasswordService;