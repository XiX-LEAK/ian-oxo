// 🎯 SERVICE DATABASE - REMPLACE TOUT SUPABASE !
console.log('🚀 Database Service - SYSTÈME PROPRE !');

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

interface DatabaseData {
  sitePassword: string;
  adminPassword: string;
  agents: Agent[];
}

const DEFAULT_DATA: DatabaseData = {
  sitePassword: 'oxo2024',
  adminPassword: 'oxo2025admin',
  agents: [
    {
      id: '1',
      name: 'Agent Demo',
      identifier: 'demo@oxo.com',
      phone_number: '+33 1 23 45 67 89',
      email: 'demo@oxo.com',
      website_url: 'https://example.com',
      about: 'Agent de démonstration',
      categories: ['Tech', 'Business'],
      platforms: ['LinkedIn', 'Email'],
      internal_notes: 'Notes internes demo',
      created_at: new Date().toISOString()
    }
  ]
};

class DatabaseService {
  private data: DatabaseData = DEFAULT_DATA;
  private storageKey = 'oxo-database';

  constructor() {
    this.loadData();
    console.log('✅ Database Service initialisé avec', this.data.agents.length, 'agents');
  }

  private loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = { ...DEFAULT_DATA, ...JSON.parse(stored) };
      } else {
        this.saveData();
      }
    } catch (error) {
      console.log('⚠️ Données par défaut utilisées');
      this.data = DEFAULT_DATA;
      this.saveData();
    }
  }

  private saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      console.log('💾 Données sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }

  // 🔑 GESTION MOTS DE PASSE
  getSitePassword(): string {
    return this.data.sitePassword;
  }

  setSitePassword(password: string): boolean {
    try {
      this.data.sitePassword = password;
      this.saveData();
      console.log('✅ Mot de passe site modifié:', password);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe site:', error);
      return false;
    }
  }

  getAdminPassword(): string {
    return this.data.adminPassword;
  }

  setAdminPassword(password: string): boolean {
    try {
      this.data.adminPassword = password;
      this.saveData();
      console.log('✅ Mot de passe admin modifié:', password);
      return true;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe admin:', error);
      return false;
    }
  }

  // 👥 GESTION AGENTS
  async getAll(): Promise<{ data: Agent[], error: any }> {
    try {
      console.log('📋 Récupération de', this.data.agents.length, 'agents');
      return { data: [...this.data.agents], error: null };
    } catch (error) {
      console.error('❌ Erreur récupération agents:', error);
      return { data: [], error };
    }
  }

  async create(agentData: any): Promise<{ data: Agent[], error: any }> {
    try {
      // Transformer les données pour correspondre à l'interface Agent interne
      const newAgent: Agent = {
        id: Date.now().toString(),
        name: agentData.name,
        identifier: agentData.identifier,
        phone_number: agentData.phone_number || agentData.phoneNumber,
        email: agentData.email,
        website_url: agentData.website_url || agentData.websiteUrl,
        about: agentData.description || agentData.about_description || agentData.about,
        internal_notes: agentData.internal_notes || agentData.notes,
        platforms: agentData.platforms || [agentData.platform],
        categories: agentData.categories || [agentData.category],
        created_at: new Date().toISOString()
      };
      
      this.data.agents.push(newAgent);
      this.saveData();
      console.log('✅ Agent créé:', newAgent.name);
      return { data: [newAgent], error: null };
    } catch (error) {
      console.error('❌ Erreur création agent:', error);
      return { data: [], error };
    }
  }

  async update(id: string, updates: any): Promise<{ data: Agent[], error: any }> {
    try {
      console.log('🔄 Début modification agent:', id);
      console.log('📦 Updates reçus:', updates);
      
      const index = this.data.agents.findIndex(a => a.id === id || String(a.id) === String(id));
      if (index === -1) {
        console.error('❌ Agent non trouvé:', id);
        return { data: [], error: new Error('Agent non trouvé') };
      }

      console.log('📍 Agent trouvé à l\'index:', index);
      
      // Transformer les updates de manière sécurisée
      const transformedUpdates: any = {};
      
      // Copier les champs de base
      if (updates.name) transformedUpdates.name = updates.name;
      if (updates.identifier) transformedUpdates.identifier = updates.identifier;
      
      // Mapper les champs avec fallbacks
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

      console.log('🔄 Updates transformés:', transformedUpdates);

      this.data.agents[index] = { ...this.data.agents[index], ...transformedUpdates };
      this.saveData();
      console.log('✅ Agent modifié avec succès:', id);
      return { data: [this.data.agents[index]], error: null };
    } catch (error) {
      console.error('❌ Erreur modification agent:', error);
      return { data: [], error: error };
    }
  }

  async delete(id: string): Promise<{ data: any, error: any }> {
    try {
      console.log('🗑️ DELETE - ID reçu:', id, 'type:', typeof id);
      console.log('📋 Agents avant suppression:', this.data.agents.length);
      console.log('🔍 IDs existants:', this.data.agents.map(a => `${a.id} (${typeof a.id})`));
      
      const initialLength = this.data.agents.length;
      
      // Comparaison en string ET en number
      this.data.agents = this.data.agents.filter(a => {
        const match = a.id !== id && a.id !== String(id) && String(a.id) !== String(id);
        if (!match) {
          console.log('🎯 Agent trouvé pour suppression:', a.id, a.name);
        }
        return match;
      });
      
      console.log('📋 Agents après suppression:', this.data.agents.length);
      
      if (this.data.agents.length < initialLength) {
        this.saveData();
        console.log('✅ Agent supprimé avec succès:', id);
        return { data: { id }, error: null };
      } else {
        console.error('❌ Aucun agent trouvé avec ID:', id);
        return { data: null, error: new Error('Agent non trouvé avec ID: ' + id) };
      }
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return { data: null, error };
    }
  }

  async getOne(id: string): Promise<{ data: Agent | null, error: any }> {
    try {
      const agent = this.data.agents.find(a => a.id === id);
      return { data: agent || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const databaseService = new DatabaseService();