// 🚀 SERVICE GITHUB GIST - REMPLACE SUPABASE DÉFINITIVEMENT !
console.log('🎯 Gist Service - SYSTÈME ULTRA SIMPLE !');

import { gistDB } from '../utils/githubGistDB';

interface Agent {
  id: string;
  name: string;
  identifier: string;
  phone_number?: string;
  email?: string;
  website_url?: string;
  about?: string;
  categories?: string[];
  platforms?: string[];
  internal_notes?: string;
  created_at: string;
}

class GistService {
  constructor() {
    console.log('✅ Gist Service initialisé');
  }

  // Configuration du Gist
  configureGist(gistId: string) {
    gistDB.setGistId(gistId);
    console.log('🔗 Gist configuré avec ID:', gistId);
  }

  // 🔑 GESTION MOTS DE PASSE
  getSitePassword(): string {
    return gistDB.getSitePassword();
  }

  async setSitePassword(password: string): Promise<boolean> {
    return await gistDB.setSitePassword(password);
  }

  getAdminPassword(): string {
    return gistDB.getAdminPassword();
  }

  async setAdminPassword(password: string): Promise<boolean> {
    return await gistDB.setAdminPassword(password);
  }

  // 👥 GESTION AGENTS (Compatible avec l'interface existante)
  async getAll(): Promise<{ data: Agent[], error: any }> {
    try {
      const agents = gistDB.getAgents();
      console.log('📋 Agents récupérés:', agents.length);
      return { data: agents, error: null };
    } catch (error) {
      console.error('❌ Erreur récupération agents:', error);
      return { data: [], error };
    }
  }

  async create(agentData: any): Promise<{ data: Agent[], error: any }> {
    try {
      // Transformer les données pour correspondre au format Gist
      const transformedData = {
        name: agentData.name,
        identifier: agentData.identifier,
        phone_number: agentData.phone_number || agentData.phoneNumber,
        email: agentData.email,
        website_url: agentData.website_url || agentData.websiteUrl,
        about: agentData.description || agentData.about_description || agentData.about,
        internal_notes: agentData.internal_notes || agentData.notes,
        platforms: agentData.platforms || [agentData.platform],
        categories: agentData.categories || [agentData.category],
      };
      
      const success = await gistDB.addAgent(transformedData);
      if (success) {
        const agents = gistDB.getAgents();
        const newAgent = agents[agents.length - 1];
        console.log('✅ Agent créé via Gist:', newAgent.name);
        return { data: [newAgent], error: null };
      } else {
        throw new Error('Échec création agent');
      }
    } catch (error) {
      console.error('❌ Erreur création agent:', error);
      return { data: [], error };
    }
  }

  async update(id: string, updates: any): Promise<{ data: Agent[], error: any }> {
    try {
      // Transformer les updates de manière cohérente
      const transformedUpdates: any = {};
      
      if (updates.name) transformedUpdates.name = updates.name;
      if (updates.identifier) transformedUpdates.identifier = updates.identifier;
      if (updates.phone_number || updates.phoneNumber) {
        transformedUpdates.phone_number = updates.phone_number || updates.phoneNumber;
      }
      if (updates.email) transformedUpdates.email = updates.email;
      if (updates.website_url || updates.websiteUrl) {
        transformedUpdates.website_url = updates.website_url || updates.websiteUrl;
      }
      if (updates.description || updates.about_description || updates.about) {
        transformedUpdates.about = updates.description || updates.about_description || updates.about;
      }
      if (updates.internal_notes || updates.notes) {
        transformedUpdates.internal_notes = updates.internal_notes || updates.notes;
      }
      if (updates.platforms) {
        transformedUpdates.platforms = updates.platforms;
      } else if (updates.platform) {
        transformedUpdates.platforms = [updates.platform];
      }
      if (updates.categories) {
        transformedUpdates.categories = updates.categories;
      } else if (updates.category) {
        transformedUpdates.categories = [updates.category];
      }

      const success = await gistDB.updateAgent(id, transformedUpdates);
      if (success) {
        const agents = gistDB.getAgents();
        const updatedAgent = agents.find(a => a.id === id);
        console.log('✅ Agent modifié via Gist:', id);
        return { data: updatedAgent ? [updatedAgent] : [], error: null };
      } else {
        throw new Error('Agent non trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur modification agent:', error);
      return { data: [], error };
    }
  }

  async delete(id: string): Promise<{ data: any, error: any }> {
    try {
      const success = await gistDB.deleteAgent(id);
      if (success) {
        console.log('✅ Agent supprimé via Gist:', id);
        return { data: { id }, error: null };
      } else {
        throw new Error('Agent non trouvé');
      }
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return { data: null, error };
    }
  }

  async getOne(id: string): Promise<{ data: Agent | null, error: any }> {
    try {
      const agents = gistDB.getAgents();
      const agent = agents.find(a => a.id === id);
      return { data: agent || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // 📊 STATS ET MONITORING
  getStats() {
    return gistDB.getStats();
  }
}

export const gistService = new GistService();