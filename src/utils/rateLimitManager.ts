// Gestionnaire intelligent des limites de taux
import { supabase } from './supabase';

interface RateLimitInfo {
  isBlocked: boolean;
  resetTime?: Date;
  attemptsRemaining?: number;
  blockType: 'ip' | 'email' | 'global' | 'none';
}

class RateLimitManager {
  private lastAttempts: Map<string, Date[]> = new Map();
  private blockedUntil: Map<string, Date> = new Map();
  
  // Vérifier si on peut faire une tentative
  canAttempt(email: string): RateLimitInfo {
    const now = new Date();
    const emailKey = email.toLowerCase();
    
    // Vérifier si l'email est bloqué temporairement
    const blockedUntil = this.blockedUntil.get(emailKey);
    if (blockedUntil && now < blockedUntil) {
      return {
        isBlocked: true,
        resetTime: blockedUntil,
        blockType: 'email'
      };
    }
    
    // Nettoyer les anciennes tentatives (plus de 1 heure)
    const attempts = this.lastAttempts.get(emailKey) || [];
    const recentAttempts = attempts.filter(attempt => 
      now.getTime() - attempt.getTime() < 60 * 60 * 1000 // 1 heure
    );
    
    this.lastAttempts.set(emailKey, recentAttempts);
    
    // Vérifier le nombre de tentatives récentes (max 3 par heure)
    if (recentAttempts.length >= 3) {
      const oldestAttempt = recentAttempts[0];
      const resetTime = new Date(oldestAttempt.getTime() + 60 * 60 * 1000);
      
      return {
        isBlocked: true,
        resetTime: resetTime,
        blockType: 'email',
        attemptsRemaining: 0
      };
    }
    
    return {
      isBlocked: false,
      blockType: 'none',
      attemptsRemaining: 3 - recentAttempts.length
    };
  }
  
  // Enregistrer une tentative
  recordAttempt(email: string, success: boolean, supabaseError?: any) {
    const now = new Date();
    const emailKey = email.toLowerCase();
    
    // Enregistrer la tentative
    const attempts = this.lastAttempts.get(emailKey) || [];
    attempts.push(now);
    this.lastAttempts.set(emailKey, attempts);
    
    // Si c'est une erreur 429 de Supabase, bloquer temporairement
    if (supabaseError?.status === 429) {
      const blockUntil = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
      this.blockedUntil.set(emailKey, blockUntil);
      
      console.log(`🚫 Email ${email} bloqué jusqu'à ${blockUntil.toLocaleTimeString()}`);
    }
    
    // Si succès, nettoyer les blocages
    if (success) {
      this.blockedUntil.delete(emailKey);
      this.lastAttempts.delete(emailKey);
    }
  }
  
  // Obtenir un message d'erreur approprié
  getErrorMessage(rateLimitInfo: RateLimitInfo, email: string): string {
    if (!rateLimitInfo.isBlocked) return '';
    
    const resetTime = rateLimitInfo.resetTime;
    const minutesLeft = resetTime ? 
      Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60)) : 10;
    
    switch (rateLimitInfo.blockType) {
      case 'email':
        return `Cette adresse email a fait trop de tentatives. Réessayez dans ${minutesLeft} minutes ou utilisez une autre adresse email.`;
      
      case 'ip':
        return `Trop de tentatives depuis cette connexion internet. Réessayez dans ${minutesLeft} minutes.`;
      
      case 'global':
        return `Limite globale atteinte. Réessayez dans ${minutesLeft} minutes.`;
      
      default:
        return `Trop de tentatives. Réessayez dans ${minutesLeft} minutes.`;
    }
  }
  
  // Suggérer des solutions
  getSuggestions(rateLimitInfo: RateLimitInfo): string[] {
    const suggestions: string[] = [];
    
    if (rateLimitInfo.blockType === 'email') {
      suggestions.push('💡 Utilisez une adresse email différente');
      suggestions.push('📧 Vérifiez vos spams, un email de confirmation a peut-être été envoyé');
    }
    
    if (rateLimitInfo.blockType === 'ip') {
      suggestions.push('🌐 Essayez depuis une autre connexion internet');
      suggestions.push('📱 Utilisez les données mobiles au lieu du Wi-Fi');
    }
    
    suggestions.push('⏰ Attendez quelques minutes avant de réessayer');
    suggestions.push('🔄 Rechargez la page et réessayez');
    
    return suggestions;
  }
}

// Instance globale
export const rateLimitManager = new RateLimitManager();

// Fonction helper pour l'inscription avec gestion des limites
export const smartSignUp = async (email: string, password: string, options?: any) => {
  console.log('🧠 Inscription intelligente pour:', email);
  
  // Vérifier les limites locales
  const rateLimitInfo = rateLimitManager.canAttempt(email);
  
  if (rateLimitInfo.isBlocked) {
    const errorMessage = rateLimitManager.getErrorMessage(rateLimitInfo, email);
    const suggestions = rateLimitManager.getSuggestions(rateLimitInfo);
    
    console.log('🚫 Inscription bloquée:', errorMessage);
    console.log('💡 Suggestions:', suggestions);
    
    return {
      data: null,
      error: {
        message: errorMessage,
        suggestions,
        status: 429,
        retryAfter: rateLimitInfo.resetTime
      }
    };
  }
  
  // Tentative d'inscription
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options
    });
    
    // Enregistrer le résultat
    rateLimitManager.recordAttempt(email, !error, error);
    
    if (error) {
      console.log('❌ Erreur Supabase:', error);
      
      // Si c'est une limite de taux Supabase
      if (error.status === 429) {
        const suggestions = rateLimitManager.getSuggestions({ 
          isBlocked: true, 
          blockType: 'ip' 
        } as RateLimitInfo);
        
        return {
          data: null,
          error: {
            ...error,
            message: 'Limite de Supabase atteinte. Essayez avec une autre adresse email ou attendez quelques minutes.',
            suggestions
          }
        };
      }
    }
    
    return { data, error };
    
  } catch (exception) {
    rateLimitManager.recordAttempt(email, false);
    throw exception;
  }
};