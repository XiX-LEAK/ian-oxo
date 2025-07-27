// 🎯 SERVICE AGENT SIMPLE - SANS SUPABASE !
import { databaseService } from './databaseService';

// Interface simple qui marche
export interface SimpleAgent {
  id?: string;
  name: string;
  identifier: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  platform: string;
  platforms?: string[];
  category: string;
  categories?: string[];
  status: string;
  description?: string;
  about_description?: string;
  internal_notes?: string;
  created_at?: string;
}

class AgentServiceSimple {
  
  // 📋 RÉCUPÉRER TOUS LES AGENTS
  async getAll(): Promise<{ data: SimpleAgent[], error: any }> {
    try {
      console.log('🔄 Récupération de tous les agents...');
      const result = await databaseService.getAll();
      console.log('✅', result.data.length, 'agents récupérés');
      return result;
    } catch (error) {
      console.error('💥 Exception récupération:', error);
      return { data: [], error };
    }
  }

  // ➕ CRÉER UN AGENT
  async create(agentData: SimpleAgent): Promise<{ data: SimpleAgent[], error: any }> {
    try {
      console.log('➕ Création agent...');
      console.log('📤 Données envoyées:', agentData);
      
      const result = await databaseService.create(agentData);
      
      if (result.error) {
        console.error('❌ Erreur création:', result.error);
        throw new Error('Échec de création');
      }
      
      console.log('✅ Agent créé avec succès');
      return result;
    } catch (error) {
      console.error('💥 Exception création:', error);
      throw new Error('Échec de création');
    }
  }

  // ✏️ MODIFIER UN AGENT
  async update(id: string, updates: Partial<SimpleAgent>): Promise<{ data: SimpleAgent[], error: any }> {
    try {
      console.log('✏️ Modification agent:', id);
      const result = await databaseService.update(id, updates);
      
      if (result.error) {
        console.error('❌ Erreur modification:', result.error);
        throw new Error('Échec de modification');
      }
      
      console.log('✅ Agent modifié avec succès');
      return result;
    } catch (error) {
      console.error('💥 Exception modification:', error);
      throw new Error('Échec de modification');
    }
  }

  // 🗑️ SUPPRIMER UN AGENT
  async delete(id: string): Promise<{ data: any, error: any }> {
    try {
      console.log('🗑️ Suppression agent:', id);
      const result = await databaseService.delete(id);
      
      if (result.error) {
        console.error('❌ Erreur suppression:', result.error);
        throw new Error('Échec de suppression');
      }
      
      console.log('✅ Agent supprimé avec succès');
      return result;
    } catch (error) {
      console.error('💥 Exception suppression:', error);
      throw new Error('Échec de suppression');
    }
  }

  // 👁️ RÉCUPÉRER UN AGENT
  async getById(id: string): Promise<{ data: SimpleAgent | null, error: any }> {
    try {
      console.log('👁️ Récupération agent:', id);
      const result = await databaseService.getOne(id);
      return result;
    } catch (error) {
      console.error('💥 Exception récupération agent:', error);
      return { data: null, error };
    }
  }
}

export const agentServiceSimple = new AgentServiceSimple();