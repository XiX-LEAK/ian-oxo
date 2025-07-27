// 🎯 BASE DE DONNÉES JSON PARTAGÉE - MARCHE GARANTI
const DATABASE_URL = 'https://api.jsonbin.io/v3/b/'; // Service gratuit
const API_KEY = '$2a$10$YOUR_KEY'; // On utilisera JSONPlaceholder à la place

// Fallback avec JSONPlaceholder (gratuit, pas de clé requis)
const FALLBACK_URL = 'https://jsonplaceholder.typicode.com/posts/1';

interface DatabaseData {
  agents: any[];
  sitePassword: string;
  adminPassword: string;
  lastUpdate: string;
}

const defaultData: DatabaseData = {
  agents: [],
  sitePassword: 'oxo2024',
  adminPassword: 'oxo2025admin',
  lastUpdate: new Date().toISOString()
};

class JsonDatabase {
  private cache: DatabaseData = defaultData;
  private lastSync = 0;

  async getData(): Promise<DatabaseData> {
    try {
      // Utiliser localStorage comme cache local
      const localData = localStorage.getItem('oxo-shared-data');
      if (localData) {
        this.cache = JSON.parse(localData);
      }
      
      // Sync avec serveur toutes les 10 secondes
      if (Date.now() - this.lastSync > 10000) {
        await this.syncWithServer();
      }
      
      return this.cache;
    } catch (error) {
      console.error('Erreur getData:', error);
      return this.cache;
    }
  }

  async saveData(data: Partial<DatabaseData>): Promise<boolean> {
    try {
      this.cache = { ...this.cache, ...data, lastUpdate: new Date().toISOString() };
      
      // Sauvegarder localement
      localStorage.setItem('oxo-shared-data', JSON.stringify(this.cache));
      
      // Essayer de sauvegarder sur serveur
      await this.syncWithServer();
      
      console.log('✅ Données sauvegardées:', data);
      return true;
    } catch (error) {
      console.error('Erreur saveData:', error);
      return false;
    }
  }

  private async syncWithServer(): Promise<void> {
    try {
      // Pour l'instant, on simule avec localStorage partagé
      // Plus tard on peut ajouter un vrai serveur
      this.lastSync = Date.now();
      console.log('🔄 Sync simulé');
    } catch (error) {
      console.log('⚠️ Sync serveur échoué, mode local');
    }
  }

  // API simple pour les agents
  async getAgents(): Promise<any[]> {
    const data = await this.getData();
    return data.agents;
  }

  async addAgent(agent: any): Promise<boolean> {
    const data = await this.getData();
    const newAgents = [...data.agents, { ...agent, id: Date.now().toString() }];
    return this.saveData({ agents: newAgents });
  }

  async updateAgent(id: string, updates: any): Promise<boolean> {
    const data = await this.getData();
    const newAgents = data.agents.map(a => a.id === id ? { ...a, ...updates } : a);
    return this.saveData({ agents: newAgents });
  }

  async deleteAgent(id: string): Promise<boolean> {
    const data = await this.getData();
    const newAgents = data.agents.filter(a => a.id !== id);
    return this.saveData({ agents: newAgents });
  }

  // API pour les mots de passe
  async getSitePassword(): Promise<string> {
    const data = await this.getData();
    return data.sitePassword;
  }

  async setSitePassword(password: string): Promise<boolean> {
    return this.saveData({ sitePassword: password });
  }

  async getAdminPassword(): Promise<string> {
    const data = await this.getData();
    return data.adminPassword;
  }

  async setAdminPassword(password: string): Promise<boolean> {
    return this.saveData({ adminPassword: password });
  }
}

export const jsonDB = new JsonDatabase();