// Système d'authentification alternatif pour contourner les limites Supabase
import { supabase } from './supabase';

interface AlternativeUser {
  id: string;
  email: string;
  username: string;
  password: string; // Hashé
  role: 'visitor' | 'admin';
  createdAt: Date;
  isVerified: boolean;
}

class AlternativeAuthSystem {
  private storageKey = 'oxo-alternative-users';
  private currentLimits = new Map<string, number>();
  
  // Hash simple pour les mots de passe (à remplacer par bcrypt en production)
  private simpleHash(password: string): string {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36) + password.length;
  }
  
  // Sauvegarder les utilisateurs localement
  private saveUsers(users: AlternativeUser[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }
  
  // Charger les utilisateurs locaux
  private loadUsers(): AlternativeUser[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  // Vérifier si Supabase est disponible
  private async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.getSession();
      return !error || error.message !== 'Failed to fetch';
    } catch {
      return false;
    }
  }
  
  // Inscription alternative (locale)
  async registerAlternative(email: string, username: string, password: string): Promise<{
    success: boolean;
    user?: AlternativeUser;
    error?: string;
  }> {
    console.log('🔄 Inscription alternative pour:', email);
    
    const users = this.loadUsers();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'Un compte existe déjà avec cet email ou identifiant'
      };
    }
    
    // Créer le nouvel utilisateur
    const newUser: AlternativeUser = {
      id: `alt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: this.simpleHash(password),
      role: 'visitor',
      createdAt: new Date(),
      isVerified: true // Auto-vérifié pour l'instant
    };
    
    // Sauvegarder
    users.push(newUser);
    this.saveUsers(users);
    
    console.log('✅ Utilisateur alternatif créé:', {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username
    });
    
    return { success: true, user: newUser };
  }
  
  // Connexion alternative
  async loginAlternative(emailOrUsername: string, password: string): Promise<{
    success: boolean;
    user?: AlternativeUser;
    error?: string;
  }> {
    console.log('🔄 Connexion alternative pour:', emailOrUsername);
    
    const users = this.loadUsers();
    const hashedPassword = this.simpleHash(password);
    
    // Chercher l'utilisateur
    const user = users.find(u => 
      (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
       u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
      u.password === hashedPassword
    );
    
    if (!user) {
      return {
        success: false,
        error: 'Email/Identifiant ou mot de passe incorrect'
      };
    }
    
    console.log('✅ Connexion alternative réussie:', {
      id: user.id,
      email: user.email,
      username: user.username
    });
    
    return { success: true, user };
  }
  
  // Migration vers Supabase quand disponible
  async migrateToSupabase(): Promise<number> {
    console.log('🔄 Migration vers Supabase...');
    
    const isAvailable = await this.isSupabaseAvailable();
    if (!isAvailable) {
      console.log('⚠️ Supabase non disponible pour la migration');
      return 0;
    }
    
    const users = this.loadUsers();
    let migrated = 0;
    
    for (const user of users) {
      try {
        // Tenter de créer l'utilisateur dans Supabase
        const { error } = await supabase.auth.signUp({
          email: user.email,
          password: 'migrated_' + Date.now(), // Mot de passe temporaire
          options: {
            data: {
              username: user.username,
              role: user.role,
              migrated: true,
              originalId: user.id
            }
          }
        });
        
        if (!error) {
          migrated++;
          console.log('✅ Migré:', user.email);
        } else {
          console.log('⚠️ Échec migration:', user.email, error.message);
        }
        
        // Pause entre les migrations pour éviter les limites
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log('❌ Erreur migration:', user.email, error);
      }
    }
    
    console.log(`✅ Migration terminée: ${migrated}/${users.length} utilisateurs`);
    return migrated;
  }
  
  // Obtenir les statistiques
  getStats(): {
    totalUsers: number;
    recentUsers: number;
    oldestUser?: Date;
  } {
    const users = this.loadUsers();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter(u => new Date(u.createdAt) > oneDayAgo).length;
    const oldestUser = users.length > 0 ? 
      users.reduce((oldest, user) => 
        new Date(user.createdAt) < new Date(oldest.createdAt) ? user : oldest
      ).createdAt : undefined;
    
    return {
      totalUsers: users.length,
      recentUsers,
      oldestUser
    };
  }
}

// Instance globale
export const alternativeAuth = new AlternativeAuthSystem();

// Fonction helper pour déterminer quel système utiliser
export const intelligentSignUp = async (email: string, username: string, password: string) => {
  console.log('🧠 Inscription intelligente - détection du meilleur système...');
  
  try {
    // D'abord essayer Supabase
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { 
          username: username.toLowerCase(),
          role: 'visitor',
          isAdmin: false
        }
      }
    });
    
    if (!error && data?.user) {
      console.log('✅ Inscription Supabase réussie');
      return { 
        success: true, 
        user: data.user, 
        system: 'supabase' as const
      };
    }
    
    // Si erreur 429 ou autre, essayer le système alternatif
    if (error?.status === 429 || error?.message?.includes('rate') || error?.message?.includes('limit')) {
      console.log('🔄 Limite Supabase atteinte, basculement vers le système alternatif...');
      
      const altResult = await alternativeAuth.registerAlternative(email, username, password);
      
      if (altResult.success) {
        return {
          success: true,
          user: altResult.user,
          system: 'alternative' as const,
          message: 'Compte créé en mode hors-ligne. Il sera synchronisé avec Supabase dès que possible.'
        };
      }
    }
    
    // Si tout échoue
    return {
      success: false,
      error: error?.message || 'Erreur lors de la création du compte',
      system: 'none' as const
    };
    
  } catch (exception) {
    console.log('💥 Exception, basculement vers le système alternatif...');
    
    const altResult = await alternativeAuth.registerAlternative(email, username, password);
    
    if (altResult.success) {
      return {
        success: true,
        user: altResult.user,
        system: 'alternative' as const,
        message: 'Compte créé en mode hors-ligne. Il sera synchronisé avec Supabase dès que possible.'
      };
    }
    
    return {
      success: false,
      error: altResult.error || 'Erreur lors de la création du compte',
      system: 'none' as const
    };
  }
};