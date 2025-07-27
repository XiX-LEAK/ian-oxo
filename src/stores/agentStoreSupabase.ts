import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentsService, type Agent as SupabaseAgent } from '@/services/supabaseService';
import type { Agent, AgentFilters, CreateAgentRequest, UpdateAgentRequest, Platform, AgentCategory } from '@/types/agent';

// Helper function to convert Supabase agent format to client format
const mapSupabaseAgentToClient = (supabaseAgent: SupabaseAgent): Agent => {
  return {
    id: supabaseAgent.id,
    name: supabaseAgent.name,
    identifier: supabaseAgent.identifier,
    phoneNumber: supabaseAgent.phone_number,
    platform: supabaseAgent.platform as any,
    category: supabaseAgent.category as any,
    status: supabaseAgent.status as any,
    rating: supabaseAgent.rating,
    totalSales: 0, // Not stored in Supabase schema
    lastActivity: new Date(supabaseAgent.updated_at),
    notes: '', // Short notes - not directly mapped
    about: supabaseAgent.description || '', // Map description to about
    adminNotes: supabaseAgent.admin_notes || '', // Map admin_notes to adminNotes
    isVerified: Boolean(supabaseAgent.verification_date),
    avatar: `https://via.placeholder.com/40/3b82f6/ffffff?text=${supabaseAgent.name.charAt(0).toUpperCase()}`,
    languages: supabaseAgent.languages || ['Français'],
    specialties: supabaseAgent.specialties || [],
    contactInfo: {
      platform: supabaseAgent.platform as any,
      identifier: supabaseAgent.identifier,
      phoneNumber: supabaseAgent.phone_number,
      email: supabaseAgent.email
    },
    stats: {
      totalContacts: 0,
      responseRate: 0,
      avgResponseTime: 0,
      successfulDeals: 0,
      customerRating: supabaseAgent.rating
    }
  };
};

// Helper function to convert client agent format to Supabase format for create/update
const mapClientAgentToSupabase = (clientAgent: CreateAgentRequest | UpdateAgentRequest): Partial<SupabaseAgent> => {
  return {
    name: clientAgent.name,
    identifier: clientAgent.identifier,
    phone_number: clientAgent.phoneNumber,
    platform: clientAgent.platform,
    category: clientAgent.category,
    specialties: clientAgent.specialties,
    description: clientAgent.about, // Map about to description
    admin_notes: clientAgent.adminNotes, // Map adminNotes to admin_notes
    languages: clientAgent.languages,
    email: clientAgent.contactInfo?.email,
    status: (clientAgent as UpdateAgentRequest).status || 'pending'
  };
};

interface AgentStore {
  // State
  agents: Agent[];
  filteredAgents: Agent[];
  filters: AgentFilters;
  isLoading: boolean;
  error: string | null;
  useSupabase: boolean; // Mode Supabase ou localStorage
  
  // Actions
  loadAgents: () => Promise<void>;
  addAgent: (agentData: CreateAgentRequest) => Promise<boolean>;
  updateAgent: (agentData: UpdateAgentRequest) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  setFilters: (filters: Partial<AgentFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  getAgentById: (id: string) => Agent | undefined;
  getAgentsByPlatform: (platform: Platform) => Agent[];
  getAgentsByCategory: (category: AgentCategory) => Agent[];
  searchAgents: (query: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Nouvelles actions
  toggleSupabaseMode: () => void;
  syncWithSupabase: () => Promise<void>;
  exportData: () => string;
  importData: (data: string) => boolean;
}

// Données par défaut pour localStorage
const defaultAgents: Agent[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    identifier: 'sophie.martin.pro',
    email: 'sophie.martin@example.com',
    phone_number: '+33123456789',
    platform: 'whatsapp',
    category: 'fashion',
    specialties: ['Mode femme', 'Accessoires', 'Tendances'],
    status: 'active',
    description: 'Spécialiste mode avec 5 ans d\'expérience',
    location: 'Paris, France',
    languages: ['Français', 'Anglais'],
    rating: 4.8,
    total_reviews: 24,
    verification_date: new Date('2024-01-15').toISOString(),
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-12-20').toISOString()
  },
  {
    id: '2',
    name: 'Liu Wei',
    identifier: 'liu.tech.expert',
    email: 'liu.wei@example.com',
    phone_number: '+33987654321',
    platform: 'wechat',
    category: 'electronics',
    specialties: ['Smartphones', 'Ordinateurs', 'Gaming'],
    status: 'active',
    description: 'Expert en technologie et gadgets électroniques',
    location: 'Lyon, France',
    languages: ['Français', 'Mandarin', 'Anglais'],
    rating: 4.6,
    total_reviews: 18,
    verification_date: new Date('2024-02-01').toISOString(),
    created_at: new Date('2024-02-01').toISOString(),
    updated_at: new Date('2024-12-18').toISOString()
  },
  {
    id: '3',
    name: 'Ahmad Hassan',
    identifier: 'ahmad.garden.pro',
    email: 'ahmad.hassan@example.com',
    phone_number: '+33555666777',
    platform: 'telegram',
    category: 'home-garden',
    specialties: ['Jardinage', 'Décoration', 'Bricolage'],
    status: 'active',
    description: 'Passionné de jardinage et décoration maison',
    location: 'Marseille, France',
    languages: ['Français', 'Arabe'],
    rating: 4.9,
    total_reviews: 31,
    verification_date: new Date('2024-01-20').toISOString(),
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-12-19').toISOString()
  },
  {
    id: '4',
    name: 'Maria Gonzalez',
    identifier: 'maria.beauty.expert',
    email: 'maria.gonzalez@example.com',
    phone_number: '+33444333222',
    platform: 'instagram',
    category: 'beauty',
    specialties: ['Cosmétiques', 'Soins', 'Parfums'],
    status: 'active',
    description: 'Experte beauté et cosmétiques naturels',
    location: 'Nice, France',
    languages: ['Français', 'Espagnol', 'Italien'],
    rating: 4.7,
    total_reviews: 22,
    verification_date: new Date('2024-02-10').toISOString(),
    created_at: new Date('2024-02-10').toISOString(),
    updated_at: new Date('2024-12-21').toISOString()
  },
  {
    id: '5',
    name: 'Chen Yang',
    identifier: 'chen.sport.coach',
    email: 'chen.yang@example.com',
    phone_number: '+33111222333',
    platform: 'discord',
    category: 'sports',
    specialties: ['Fitness', 'Running', 'Équipements'],
    status: 'active',
    description: 'Coach sportif et spécialiste équipements',
    location: 'Toulouse, France',
    languages: ['Français', 'Mandarin'],
    rating: 4.5,
    total_reviews: 15,
    verification_date: new Date('2024-03-01').toISOString(),
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date('2024-12-17').toISOString()
  }
];

// Détection automatique de Supabase
const checkSupabaseAvailability = (): boolean => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url_here');
  } catch {
    return false;
  }
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // État initial
      agents: [],
      filteredAgents: [],
      filters: {
        search: '',
        platform: 'all',
        category: 'all',
        status: 'all'
      },
      isLoading: false,
      error: null,
      useSupabase: checkSupabaseAvailability(),

      // Charger les agents
      loadAgents: async () => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          let agents: Agent[] = [];

          if (state.useSupabase) {
            console.log('🔄 Chargement agents depuis Supabase...');
            const supabaseAgents = await AgentsService.getAll();
            
            if (supabaseAgents.length === 0) {
              console.log('📝 Aucun agent dans Supabase, utilisation des données par défaut');
              agents = defaultAgents;
            } else {
              // Convert Supabase format to client format
              agents = supabaseAgents.map(mapSupabaseAgentToClient);
            }
          } else {
            console.log('🔄 Mode localStorage - utilisation des données par défaut');
            agents = defaultAgents;
          }

          set({ 
            agents, 
            filteredAgents: agents,
            isLoading: false 
          });

          // Appliquer les filtres
          get().applyFilters();
          
          console.log(`✅ ${agents.length} agents chargés avec succès`);
        } catch (error) {
          console.error('❌ Erreur chargement agents:', error);
          
          // Fallback vers localStorage
          if (state.useSupabase) {
            console.log('🔄 Fallback vers les données par défaut');
            set({ 
              agents: defaultAgents,
              filteredAgents: defaultAgents,
              isLoading: false,
              useSupabase: false,
              error: 'Connexion Supabase échouée - mode hors ligne activé'
            });
          } else {
            set({ 
              error: 'Erreur lors du chargement des agents',
              isLoading: false 
            });
          }
        }
      },

      // Ajouter un agent
      addAgent: async (agentData: CreateAgentRequest) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          let newAgent: Agent;

          if (state.useSupabase) {
            const supabaseData = mapClientAgentToSupabase(agentData);
            const supabaseAgent = await AgentsService.create({
              ...supabaseData,
              status: 'active',
              location: agentData.location
            });

            if (!supabaseAgent) throw new Error('Échec création agent Supabase');
            newAgent = mapSupabaseAgentToClient(supabaseAgent);
          } else {
            // Mode localStorage - create client format directly
            newAgent = {
              id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: agentData.name,
              identifier: agentData.identifier,
              phoneNumber: agentData.phoneNumber,
              platform: agentData.platform,
              category: agentData.category,
              specialties: agentData.specialties,
              status: 'active',
              rating: 0,
              totalSales: 0,
              lastActivity: new Date(),
              notes: agentData.notes || '',
              about: agentData.about || '',
              adminNotes: agentData.adminNotes || '',
              isVerified: false,
              avatar: `https://via.placeholder.com/40/3b82f6/ffffff?text=${agentData.name.charAt(0).toUpperCase()}`,
              languages: agentData.languages || ['Français'],
              contactInfo: {
                platform: agentData.platform,
                identifier: agentData.identifier,
                phoneNumber: agentData.phoneNumber,
                email: agentData.contactInfo?.email
              },
              stats: {
                totalContacts: 0,
                responseRate: 0,
                avgResponseTime: 0,
                successfulDeals: 0,
                customerRating: 0
              }
            };
          }

          const updatedAgents = [...state.agents, newAgent];
          set({ 
            agents: updatedAgents,
            isLoading: false 
          });

          // Réappliquer les filtres
          get().applyFilters();

          console.log('✅ Agent ajouté avec succès');
          return true;
        } catch (error) {
          console.error('❌ Erreur ajout agent:', error);
          set({ 
            error: 'Erreur lors de l\'ajout de l\'agent',
            isLoading: false 
          });
          return false;
        }
      },

      // Mettre à jour un agent
      updateAgent: async (agentData: UpdateAgentRequest) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          if (state.useSupabase) {
            const supabaseData = mapClientAgentToSupabase(agentData);
            const updatedSupabaseAgent = await AgentsService.update(agentData.id, {
              ...supabaseData,
              location: agentData.location
            });

            if (!updatedSupabaseAgent) throw new Error('Échec mise à jour agent Supabase');

            const updatedAgent = mapSupabaseAgentToClient(updatedSupabaseAgent);
            const updatedAgents = state.agents.map(agent => 
              agent.id === agentData.id ? updatedAgent : agent
            );
            set({ agents: updatedAgents, isLoading: false });
          } else {
            // Mode localStorage
            const updatedAgents = state.agents.map(agent => 
              agent.id === agentData.id 
                ? {
                    ...agent,
                    name: agentData.name,
                    identifier: agentData.identifier,
                    phoneNumber: agentData.phoneNumber,
                    platform: agentData.platform,
                    category: agentData.category,
                    specialties: agentData.specialties,
                    status: agentData.status,
                    notes: agentData.notes || agent.notes,
                    about: agentData.about || agent.about,
                    adminNotes: agentData.adminNotes || agent.adminNotes,
                    languages: agentData.languages,
                    lastActivity: new Date(),
                    contactInfo: agentData.contactInfo 
                      ? { ...agent.contactInfo, ...agentData.contactInfo }
                      : agent.contactInfo
                  }
                : agent
            );
            set({ agents: updatedAgents, isLoading: false });
          }

          // Réappliquer les filtres
          get().applyFilters();

          console.log('✅ Agent mis à jour avec succès');
          return true;
        } catch (error) {
          console.error('❌ Erreur mise à jour agent:', error);
          set({ 
            error: 'Erreur lors de la mise à jour de l\'agent',
            isLoading: false 
          });
          return false;
        }
      },

      // Supprimer un agent
      deleteAgent: async (id: string) => {
        const state = get();
        set({ isLoading: true, error: null });

        try {
          if (state.useSupabase) {
            const success = await AgentsService.delete(id);
            if (!success) throw new Error('Échec suppression agent Supabase');
          }

          const updatedAgents = state.agents.filter(agent => agent.id !== id);
          set({ 
            agents: updatedAgents,
            isLoading: false 
          });

          // Réappliquer les filtres
          get().applyFilters();

          console.log('✅ Agent supprimé avec succès');
          return true;
        } catch (error) {
          console.error('❌ Erreur suppression agent:', error);
          set({ 
            error: 'Erreur lors de la suppression de l\'agent',
            isLoading: false 
          });
          return false;
        }
      },

      // Définir les filtres
      setFilters: (newFilters: Partial<AgentFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      // Appliquer les filtres
      applyFilters: () => {
        const { agents, filters } = get();
        
        let filtered = agents;

        // Filtre de recherche
        if (filters.search?.trim()) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(agent =>
            agent.name.toLowerCase().includes(searchTerm) ||
            agent.identifier.toLowerCase().includes(searchTerm) ||
            agent.description?.toLowerCase().includes(searchTerm) ||
            agent.specialties?.some(s => s.toLowerCase().includes(searchTerm))
          );
        }

        // Filtre plateforme
        if (filters.platform && filters.platform !== 'all') {
          filtered = filtered.filter(agent => agent.platform === filters.platform);
        }

        // Filtre catégorie
        if (filters.category && filters.category !== 'all') {
          filtered = filtered.filter(agent => agent.category === filters.category);
        }

        // Filtre statut
        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(agent => agent.status === filters.status);
        }

        set({ filteredAgents: filtered });
      },

      // Effacer les filtres
      clearFilters: () => {
        const defaultFilters: AgentFilters = {
          search: '',
          platform: 'all',
          category: 'all',
          status: 'all'
        };
        set({ filters: defaultFilters });
        get().applyFilters();
      },

      // Obtenir un agent par ID
      getAgentById: (id: string) => {
        return get().agents.find(agent => agent.id === id);
      },

      // Obtenir les agents par plateforme
      getAgentsByPlatform: (platform: Platform) => {
        return get().agents.filter(agent => agent.platform === platform);
      },

      // Obtenir les agents par catégorie
      getAgentsByCategory: (category: AgentCategory) => {
        return get().agents.filter(agent => agent.category === category);
      },

      // Rechercher des agents
      searchAgents: (query: string) => {
        get().setFilters({ search: query });
      },

      // Définir une erreur
      setError: (error: string | null) => {
        set({ error });
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },

      // Basculer le mode Supabase
      toggleSupabaseMode: () => {
        const currentMode = get().useSupabase;
        set({ useSupabase: !currentMode });
        
        if (!currentMode && checkSupabaseAvailability()) {
          console.log('🔄 Passage en mode Supabase');
          get().loadAgents();
        } else {
          console.log('🔄 Passage en mode localStorage');
          get().loadAgents();
        }
      },

      // Synchroniser avec Supabase
      syncWithSupabase: async () => {
        if (!get().useSupabase) return;
        
        console.log('🔄 Synchronisation avec Supabase...');
        await get().loadAgents();
      },

      // Exporter les données
      exportData: () => {
        const { agents } = get();
        return JSON.stringify({
          agents,
          exportDate: new Date().toISOString(),
          version: '1.0'
        }, null, 2);
      },

      // Importer les données
      importData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.agents && Array.isArray(parsed.agents)) {
            set({ 
              agents: parsed.agents,
              filteredAgents: parsed.agents
            });
            get().applyFilters();
            console.log('✅ Données importées avec succès');
            return true;
          }
          return false;
        } catch (error) {
          console.error('❌ Erreur import données:', error);
          return false;
        }
      }
    }),
    {
      name: 'agent-storage-supabase',
      partialize: (state) => ({
        agents: state.agents,
        filters: state.filters,
        useSupabase: state.useSupabase
      })
    }
  )
);