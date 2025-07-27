// 🏢 SERVICE DE GESTION D'AGENTS - SIMPLE ET COMPLET
// Tout est facultatif, logs automatiques, gestion complète

import { supabase } from '@/utils/supabase';

// ===================================================================
// INTERFACES ET TYPES
// ===================================================================

export interface Agent {
  id?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  about_description?: string;
  internal_notes?: string;
  status?: 'active' | 'inactive';
  platforms?: string[];
  categories?: string[];
  languages?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Language {
  id: string;
  name: string;
  code?: string;
  created_at: string;
}

export interface ActionLog {
  id: string;
  action_type: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  admin_user_id?: string;
  admin_email?: string;
  created_at: string;
}

// ===================================================================
// SERVICE PRINCIPAL
// ===================================================================

export class AgentManagementService {

  // ===================================================================
  // GESTION DES AGENTS
  // ===================================================================

  /**
   * Récupérer tous les agents (version admin avec notes internes)
   */
  static async getAllAgentsAdmin(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_complete_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération agents admin:', error);
      return [];
    }
  }

  /**
   * Récupérer tous les agents (version publique sans notes internes)
   */
  static async getAllAgentsPublic(): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération agents publics:', error);
      return [];
    }
  }

  /**
   * Récupérer un agent par ID (admin)
   */
  static async getAgentByIdAdmin(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents_complete_admin')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération agent admin:', error);
      return null;
    }
  }

  /**
   * Récupérer un agent par ID (public)
   */
  static async getAgentByIdPublic(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération agent public:', error);
      return null;
    }
  }

  /**
   * Créer un nouvel agent
   */
  static async createAgent(agentData: Agent, adminUserId?: string, adminEmail?: string): Promise<Agent | null> {
    try {
      // 1. Créer l'agent principal
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert([{
          full_name: agentData.full_name || null,
          phone_number: agentData.phone_number || null,
          email: agentData.email || null,
          website_url: agentData.website_url || null,
          about_description: agentData.about_description || null,
          internal_notes: agentData.internal_notes || null,
          status: agentData.status || 'active'
        }])
        .select()
        .single();

      if (agentError) throw agentError;

      const agentId = agent.id;

      // 2. Ajouter les plateformes
      if (agentData.platforms && agentData.platforms.length > 0) {
        await this.updateAgentPlatforms(agentId, agentData.platforms);
      }

      // 3. Ajouter les catégories
      if (agentData.categories && agentData.categories.length > 0) {
        await this.updateAgentCategories(agentId, agentData.categories);
      }

      // 4. Ajouter les langues
      if (agentData.languages && agentData.languages.length > 0) {
        await this.updateAgentLanguages(agentId, agentData.languages);
      }

      // 5. Logger l'action
      await this.logAction(
        'CREATE',
        'agents',
        agentId,
        null,
        agent,
        adminUserId,
        adminEmail
      );

      console.log('✅ Agent créé avec succès:', agentId);
      return await this.getAgentByIdAdmin(agentId);

    } catch (error) {
      console.error('❌ Erreur création agent:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un agent
   */
  static async updateAgent(id: string, agentData: Agent, adminUserId?: string, adminEmail?: string): Promise<Agent | null> {
    try {
      // 1. Récupérer l'ancienne version pour les logs
      const oldAgent = await this.getAgentByIdAdmin(id);

      // 2. Mettre à jour l'agent principal
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .update({
          full_name: agentData.full_name || null,
          phone_number: agentData.phone_number || null,
          email: agentData.email || null,
          website_url: agentData.website_url || null,
          about_description: agentData.about_description || null,
          internal_notes: agentData.internal_notes || null,
          status: agentData.status || 'active'
        })
        .eq('id', id)
        .select()
        .single();

      if (agentError) throw agentError;

      // 3. Mettre à jour les relations
      if (agentData.platforms !== undefined) {
        await this.updateAgentPlatforms(id, agentData.platforms);
      }

      if (agentData.categories !== undefined) {
        await this.updateAgentCategories(id, agentData.categories);
      }

      if (agentData.languages !== undefined) {
        await this.updateAgentLanguages(id, agentData.languages);
      }

      // 4. Logger l'action
      await this.logAction(
        'UPDATE',
        'agents',
        id,
        oldAgent,
        agent,
        adminUserId,
        adminEmail
      );

      console.log('✅ Agent mis à jour avec succès:', id);
      return await this.getAgentByIdAdmin(id);

    } catch (error) {
      console.error('❌ Erreur mise à jour agent:', error);
      return null;
    }
  }

  /**
   * Supprimer un agent
   */
  static async deleteAgent(id: string, adminUserId?: string, adminEmail?: string): Promise<boolean> {
    try {
      // 1. Récupérer l'agent pour les logs
      const agent = await this.getAgentByIdAdmin(id);

      // 2. Supprimer l'agent (les relations seront supprimées automatiquement par CASCADE)
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 3. Logger l'action
      await this.logAction(
        'DELETE',
        'agents',
        id,
        agent,
        null,
        adminUserId,
        adminEmail
      );

      console.log('✅ Agent supprimé avec succès:', id);
      return true;

    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return false;
    }
  }

  // ===================================================================
  // GESTION DES RELATIONS (PLATEFORMES, CATÉGORIES, LANGUES)
  // ===================================================================

  /**
   * Mettre à jour les plateformes d'un agent
   */
  private static async updateAgentPlatforms(agentId: string, platformNames: string[]): Promise<void> {
    try {
      // 1. Supprimer les anciennes relations
      await supabase
        .from('agent_platforms')
        .delete()
        .eq('agent_id', agentId);

      // 2. Ajouter les nouvelles relations
      if (platformNames.length > 0) {
        const { data: platforms } = await supabase
          .from('platforms')
          .select('id, name')
          .in('name', platformNames);

        if (platforms && platforms.length > 0) {
          const relations = platforms.map(platform => ({
            agent_id: agentId,
            platform_id: platform.id
          }));

          await supabase
            .from('agent_platforms')
            .insert(relations);
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour plateformes agent:', error);
    }
  }

  /**
   * Mettre à jour les catégories d'un agent
   */
  private static async updateAgentCategories(agentId: string, categoryNames: string[]): Promise<void> {
    try {
      // 1. Supprimer les anciennes relations
      await supabase
        .from('agent_categories')
        .delete()
        .eq('agent_id', agentId);

      // 2. Ajouter les nouvelles relations
      if (categoryNames.length > 0) {
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name')
          .in('name', categoryNames);

        if (categories && categories.length > 0) {
          const relations = categories.map(category => ({
            agent_id: agentId,
            category_id: category.id
          }));

          await supabase
            .from('agent_categories')
            .insert(relations);
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour catégories agent:', error);
    }
  }

  /**
   * Mettre à jour les langues d'un agent
   */
  private static async updateAgentLanguages(agentId: string, languageNames: string[]): Promise<void> {
    try {
      // 1. Supprimer les anciennes relations
      await supabase
        .from('agent_languages')
        .delete()
        .eq('agent_id', agentId);

      // 2. Ajouter les nouvelles relations
      if (languageNames.length > 0) {
        const { data: languages } = await supabase
          .from('languages')
          .select('id, name')
          .in('name', languageNames);

        if (languages && languages.length > 0) {
          const relations = languages.map(language => ({
            agent_id: agentId,
            language_id: language.id
          }));

          await supabase
            .from('agent_languages')
            .insert(relations);
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour langues agent:', error);
    }
  }

  // ===================================================================
  // GESTION DES RÉFÉRENCES (PLATEFORMES, CATÉGORIES, LANGUES)
  // ===================================================================

  /**
   * Récupérer toutes les plateformes
   */
  static async getAllPlatforms(): Promise<Platform[]> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération plateformes:', error);
      return [];
    }
  }

  /**
   * Ajouter une nouvelle plateforme
   */
  static async addPlatform(name: string, adminUserId?: string, adminEmail?: string): Promise<Platform | null> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'CREATE',
        'platforms',
        data.id,
        null,
        data,
        adminUserId,
        adminEmail
      );

      console.log('✅ Plateforme ajoutée:', name);
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout plateforme:', error);
      return null;
    }
  }

  /**
   * Supprimer une plateforme
   */
  static async deletePlatform(id: string, adminUserId?: string, adminEmail?: string): Promise<boolean> {
    try {
      const { data: platform } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'DELETE',
        'platforms',
        id,
        platform,
        null,
        adminUserId,
        adminEmail
      );

      console.log('✅ Plateforme supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression plateforme:', error);
      return false;
    }
  }

  /**
   * Récupérer toutes les catégories
   */
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error);
      return [];
    }
  }

  /**
   * Ajouter une nouvelle catégorie
   */
  static async addCategory(name: string, adminUserId?: string, adminEmail?: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'CREATE',
        'categories',
        data.id,
        null,
        data,
        adminUserId,
        adminEmail
      );

      console.log('✅ Catégorie ajoutée:', name);
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout catégorie:', error);
      return null;
    }
  }

  /**
   * Supprimer une catégorie
   */
  static async deleteCategory(id: string, adminUserId?: string, adminEmail?: string): Promise<boolean> {
    try {
      const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'DELETE',
        'categories',
        id,
        category,
        null,
        adminUserId,
        adminEmail
      );

      console.log('✅ Catégorie supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression catégorie:', error);
      return false;
    }
  }

  /**
   * Récupérer toutes les langues
   */
  static async getAllLanguages(): Promise<Language[]> {
    try {
      const { data, error } = await supabase
        .from('languages')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération langues:', error);
      return [];
    }
  }

  /**
   * Ajouter une nouvelle langue
   */
  static async addLanguage(name: string, code?: string, adminUserId?: string, adminEmail?: string): Promise<Language | null> {
    try {
      const { data, error } = await supabase
        .from('languages')
        .insert([{ 
          name: name.trim(), 
          code: code?.trim().toLowerCase() || null 
        }])
        .select()
        .single();

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'CREATE',
        'languages',
        data.id,
        null,
        data,
        adminUserId,
        adminEmail
      );

      console.log('✅ Langue ajoutée:', name);
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout langue:', error);
      return null;
    }
  }

  /**
   * Supprimer une langue
   */
  static async deleteLanguage(id: string, adminUserId?: string, adminEmail?: string): Promise<boolean> {
    try {
      const { data: language } = await supabase
        .from('languages')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('languages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Logger l'action
      await this.logAction(
        'DELETE',
        'languages',
        id,
        language,
        null,
        adminUserId,
        adminEmail
      );

      console.log('✅ Langue supprimée:', id);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression langue:', error);
      return false;
    }
  }

  // ===================================================================
  // RECHERCHE ET FILTRAGE
  // ===================================================================

  /**
   * Rechercher des agents (public)
   */
  static async searchAgentsPublic(query: string): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .or(`
          full_name.ilike.%${query}%,
          about_description.ilike.%${query}%,
          email.ilike.%${query}%
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur recherche agents publics:', error);
      return [];
    }
  }

  /**
   * Rechercher des agents (admin)
   */
  static async searchAgentsAdmin(query: string): Promise<Agent[]> {
    try {
      const { data, error } = await supabase
        .from('agents_complete_admin')
        .select('*')
        .or(`
          full_name.ilike.%${query}%,
          about_description.ilike.%${query}%,
          email.ilike.%${query}%,
          internal_notes.ilike.%${query}%
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur recherche agents admin:', error);
      return [];
    }
  }

  // ===================================================================
  // LOGS ET HISTORIQUE
  // ===================================================================

  /**
   * Logger une action
   */
  static async logAction(
    actionType: string,
    tableName: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any,
    adminUserId?: string,
    adminEmail?: string
  ): Promise<void> {
    try {
      await supabase
        .from('action_logs')
        .insert([{
          action_type: actionType,
          table_name: tableName,
          record_id: recordId,
          old_values: oldValues,
          new_values: newValues,
          admin_user_id: adminUserId,
          admin_email: adminEmail,
          ip_address: 'client_ip',
          user_agent: navigator.userAgent
        }]);

      console.log(`📝 Action loggée: ${actionType} sur ${tableName}`);
    } catch (error) {
      console.error('❌ Erreur logging action:', error);
    }
  }

  /**
   * Récupérer les logs d'actions
   */
  static async getActionLogs(limit: number = 50): Promise<ActionLog[]> {
    try {
      const { data, error } = await supabase
        .from('action_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération logs:', error);
      return [];
    }
  }

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  /**
   * Vérifier si Supabase est disponible
   */
  static async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('agents')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}

export default AgentManagementService;