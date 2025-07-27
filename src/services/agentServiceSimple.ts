// 🎯 SERVICE AGENT SIMPLE - QUI MARCHE COMME LE TEST HTML
// Remplace le service complexe par celui-ci

import { supabase } from '@/utils/supabase';

// Interface simple qui matche exactement la base
export interface SimpleAgent {
  id?: string;
  name: string;
  identifier: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  platform: string; // Garde pour compatibilité
  platforms?: string[]; // Nouveau : plateformes multiples
  category: string; // Garde pour compatibilité  
  categories?: string[]; // Nouveau : catégories multiples
  status: string;
  description?: string;           // ✅ Description publique
  about_description?: string;     // ✅ À propos public (visible par tous)
  internal_notes?: string;        // ✅ Notes internes (admin seulement)
  full_name?: string;
  specialties?: string[];
  languages?: string[];
  rating?: number;
  total_reviews?: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export const SimpleAgentService = {
  // Créer un agent - EXACTEMENT comme le test HTML qui marche
  async create(agentData: Omit<SimpleAgent, 'id' | 'created_at' | 'updated_at'>): Promise<SimpleAgent | null> {
    try {
      console.log('🚀 Création agent simple...', agentData);
      
      // ✅ NOUVEAU: Mapper correctement les champs publics et privés
      const supabaseData = {
        ...agentData,
        about_description: agentData.about_description || agentData.description || '',  // Public
        internal_notes: agentData.internal_notes || '',                                 // Privé admin
        // Garder description pour compatibilité
        description: agentData.about_description || agentData.description || ''
      };
      
      const { data, error } = await supabase
        .from('agents')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création:', error);
        console.error('🔍 Code:', error.code);
        console.error('🔍 Message:', error.message);
        console.error('🔍 Détails:', error.details);
        return null;
      }

      console.log('✅ Agent créé avec succès:', data);
      return data;
    } catch (err) {
      console.error('💥 Exception création:', err);
      return null;
    }
  },

  // Lister tous les agents
  async getAll(): Promise<SimpleAgent[]> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération:', error);
        return [];
      }

      console.log('✅ Agents récupérés:', data?.length || 0);
      return data || [];
    } catch (err) {
      console.error('💥 Exception récupération:', err);
      return [];
    }
  },

  // Mettre à jour un agent
  async update(id: string, agentData: Partial<SimpleAgent>): Promise<SimpleAgent | null> {
    try {
      console.log('🔄 Mise à jour agent simple...', id, agentData);
      
      // ✅ NOUVEAU: Mapper correctement les champs publics et privés
      const supabaseData = { ...agentData };
      if (agentData.about_description !== undefined) {
        supabaseData.about_description = agentData.about_description;
        // Garder description pour compatibilité
        supabaseData.description = agentData.about_description;
      }
      if (agentData.description !== undefined && !agentData.about_description) {
        supabaseData.about_description = agentData.description;
      }
      // Gérer les notes internes séparément
      if (agentData.internal_notes !== undefined) {
        supabaseData.internal_notes = agentData.internal_notes;
      }
      
      const { data, error } = await supabase
        .from('agents')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour:', error);
        console.error('🔍 Code:', error.code);
        console.error('🔍 Message:', error.message);
        return null;
      }

      console.log('✅ Agent mis à jour avec succès:', data);
      return data;
    } catch (err) {
      console.error('💥 Exception mise à jour:', err);
      return null;
    }
  },

  // Supprimer un agent - VRAIE SUPPRESSION SUPABASE
  async delete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression agent Supabase...', id);
      
      // Vérifier d'abord que l'agent existe
      const { data: existingAgent, error: checkError } = await supabase
        .from('agents')
        .select('id, name')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Agent non trouvé pour suppression:', checkError);
        return false;
      }

      console.log('📋 Agent trouvé, suppression en cours:', existingAgent.name);

      // Supprimer l'agent de Supabase (suppression DEFINITIVE)
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur suppression Supabase:', error);
        console.error('🔍 Code:', error.code);
        console.error('🔍 Message:', error.message);
        console.error('🔍 Détails:', error.details);
        return false;
      }

      console.log('✅ Agent supprimé définitivement de Supabase:', id);
      return true;
    } catch (err) {
      console.error('💥 Exception suppression:', err);
      return false;
    }
  },

  // ✅ NOUVELLE METHODE: Suppression douce (marquer comme supprimé)
  async softDelete(id: string): Promise<boolean> {
    try {
      console.log('🗑️ Suppression douce agent...', id);
      
      const { data, error } = await supabase
        .from('agents')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur suppression douce:', error);
        return false;
      }

      console.log('✅ Agent marqué comme supprimé:', data);
      return true;
    } catch (err) {
      console.error('💥 Exception suppression douce:', err);
      return false;
    }
  },

  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.error('❌ Test connexion échoué:', error);
        return false;
      }

      console.log('✅ Connexion OK');
      return true;
    } catch (err) {
      console.error('💥 Test connexion exception:', err);
      return false;
    }
  }
};