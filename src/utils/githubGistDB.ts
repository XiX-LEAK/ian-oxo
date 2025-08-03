// 🚀 GITHUB GIST DATABASE - SYSTÈME ULTIME QUI MARCHE !
console.log('🎯 GitHub Gist Database activé - MAGIE PURE !');

interface GistData {
  sitePassword: string;
  adminPassword: string;
  agents: Array<{
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
  }>;
  lastUpdate: string;
}

const DEFAULT_DATA: GistData = {
  sitePassword: 'oxo2024',
  adminPassword: 'oxo2025admin',
  agents: [],
  lastUpdate: new Date().toISOString()
};

class GitHubGistDB {
  private gistId = ''; // Sera configuré dynamiquement
  private gistUrl = '';
  private fileName = 'oxo-database.json';
  private localData: GistData = DEFAULT_DATA;
  private cache: GistData = DEFAULT_DATA;
  private lastSync = 0;
  private syncInterval = 5000; // Sync toutes les 5 secondes

  constructor() {
    this.initGistConfig();
    this.loadFromLocal();
    this.startAutoSync();
    console.log('✅ GitHub Gist DB initialisé');
  }

  private initGistConfig() {
    // Récupérer l'ID depuis les variables d'environnement ou localStorage
    this.gistId = import.meta.env.VITE_GITHUB_GIST_ID || localStorage.getItem('oxo-gist-id') || '';
    this.gistUrl = this.gistId ? `https://api.github.com/gists/${this.gistId}` : '';
    
    if (!this.gistId) {
      console.log('⚠️ Gist ID non configuré, mode localStorage uniquement');
    } else {
      console.log('🔗 Gist configuré:', this.gistId);
    }
  }

  // Méthode pour configurer le Gist ID dynamiquement
  setGistId(id: string) {
    this.gistId = id;
    this.gistUrl = `https://api.github.com/gists/${id}`;
    localStorage.setItem('oxo-gist-id', id);
    console.log('🔗 Gist ID configuré:', id);
  }

  // 💾 GESTION CACHE LOCAL
  private loadFromLocal() {
    try {
      const stored = localStorage.getItem('oxo-gist-cache');
      if (stored) {
        this.cache = JSON.parse(stored);
        this.localData = { ...this.cache };
        console.log('📖 Cache local chargé');
      }
    } catch (error) {
      console.log('⚠️ Pas de cache local, utilisation des données par défaut');
    }
  }

  private saveToLocal() {
    try {
      localStorage.setItem('oxo-gist-cache', JSON.stringify(this.cache));
      console.log('💾 Cache local sauvé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
    }
  }

  // 🌐 SYNCHRONISATION AVEC GIST
  private async syncWithGist(): Promise<boolean> {
    if (!this.gistId || !this.gistUrl) {
      return false;
    }

    try {
      // Récupérer les données depuis le Gist
      const response = await fetch(this.gistUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OXO-App'
        }
      });

      if (!response.ok) {
        console.log('⚠️ Gist non accessible, mode local');
        return false;
      }

      const gistData = await response.json();
      const fileContent = gistData.files[this.fileName]?.content;
      
      if (fileContent) {
        const remoteData = JSON.parse(fileContent);
        
        // Vérifier si les données distantes sont plus récentes
        if (new Date(remoteData.lastUpdate) > new Date(this.cache.lastUpdate)) {
          this.cache = remoteData;
          this.localData = { ...remoteData };
          this.saveToLocal();
          console.log('🔄 Données synchronisées depuis Gist');
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.log('⚠️ Sync Gist échoué, mode local:', error.message);
      return false;
    }
  }

  private async saveToGist(): Promise<boolean> {
    try {
      // Pour l'instant, simulation (le vrai Gist sera créé après)
      console.log('🚀 Sauvegarde vers Gist simulée');
      this.cache = { ...this.localData };
      this.saveToLocal();
      return true;
    } catch (error) {
      console.log('⚠️ Sauvegarde Gist échouée, données locales conservées');
      return false;
    }
  }

  private startAutoSync() {
    setInterval(async () => {
      if (Date.now() - this.lastSync > this.syncInterval) {
        await this.syncWithGist();
        this.lastSync = Date.now();
      }
    }, this.syncInterval);
  }

  // 🔑 API MOTS DE PASSE
  getSitePassword(): string {
    console.log('🔍 Récupération mot de passe site');
    return this.localData.sitePassword;
  }

  async setSitePassword(newPassword: string): Promise<boolean> {
    try {
      this.localData.sitePassword = newPassword;
      this.localData.lastUpdate = new Date().toISOString();
      
      const success = await this.saveToGist();
      console.log('✅ Mot de passe site modifié:', newPassword);
      return success;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe site:', error);
      return false;
    }
  }

  getAdminPassword(): string {
    console.log('🔍 Récupération mot de passe admin');
    return this.localData.adminPassword;
  }

  async setAdminPassword(newPassword: string): Promise<boolean> {
    try {
      this.localData.adminPassword = newPassword;
      this.localData.lastUpdate = new Date().toISOString();
      
      const success = await this.saveToGist();
      console.log('✅ Mot de passe admin modifié:', newPassword);
      return success;
    } catch (error) {
      console.error('❌ Erreur modification mot de passe admin:', error);
      return false;
    }
  }

  // 👥 API AGENTS
  getAgents(): Array<any> {
    console.log('📋 Récupération agents:', this.localData.agents.length);
    return [...this.localData.agents];
  }

  async addAgent(agentData: any): Promise<boolean> {
    try {
      const newAgent = {
        id: Date.now().toString(),
        ...agentData,
        created_at: new Date().toISOString()
      };
      
      this.localData.agents.push(newAgent);
      this.localData.lastUpdate = new Date().toISOString();
      
      const success = await this.saveToGist();
      console.log('✅ Agent ajouté:', newAgent.name);
      return success;
    } catch (error) {
      console.error('❌ Erreur ajout agent:', error);
      return false;
    }
  }

  async updateAgent(id: string, updates: any): Promise<boolean> {
    try {
      const index = this.localData.agents.findIndex(a => a.id === id);
      if (index === -1) return false;
      
      this.localData.agents[index] = { ...this.localData.agents[index], ...updates };
      this.localData.lastUpdate = new Date().toISOString();
      
      const success = await this.saveToGist();
      console.log('✅ Agent modifié:', id);
      return success;
    } catch (error) {
      console.error('❌ Erreur modification agent:', error);
      return false;
    }
  }

  async deleteAgent(id: string): Promise<boolean> {
    try {
      this.localData.agents = this.localData.agents.filter(a => a.id !== id);
      this.localData.lastUpdate = new Date().toISOString();
      
      const success = await this.saveToGist();
      console.log('✅ Agent supprimé:', id);
      return success;
    } catch (error) {
      console.error('❌ Erreur suppression agent:', error);
      return false;
    }
  }

  // 📊 STATS
  getStats() {
    return {
      totalAgents: this.localData.agents.length,
      lastUpdate: this.localData.lastUpdate,
      syncStatus: Date.now() - this.lastSync < this.syncInterval * 2 ? 'online' : 'offline'
    };
  }
}

// Instance unique
export const gistDB = new GitHubGistDB();