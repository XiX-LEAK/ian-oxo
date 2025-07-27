import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AgentFilters, CreateAgentRequest, UpdateAgentRequest, Platform, AgentCategory, AgentStatus } from '@/types/agent';
import { agentServiceSimple } from '@/services/agentServiceSimple';
import { databaseService } from '@/services/databaseService';

interface AgentStore {
  // State
  agents: Agent[];
  filteredAgents: Agent[];
  filters: AgentFilters;
  isLoading: boolean;
  error: string | null;
  
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
  
  // Nouvelles actions pour la persistance
  saveToStorage: () => void;
  resetToDefaults: () => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Nouvelles actions pour Supabase
  syncWithSupabase: () => Promise<boolean>;
  getSupabaseStatus: () => { configured: boolean; connected: boolean };
  
  // Actions pour notes locales
  saveAgentNotes: (agentId: string, notes: string, adminNotes: string) => void;
}

// Pas d'agents par défaut - utilisation de Supabase
const mockAgents: Agent[] = [];

// Helper function to transform Supabase Agent to Client Agent
const transformSupabaseAgent = (supabaseAgent: SupabaseAgent): Agent => {
  return {
    id: supabaseAgent.id,
    name: supabaseAgent.name || '',
    identifier: supabaseAgent.identifier || '',
    phoneNumber: supabaseAgent.phone_number,
    platform: (supabaseAgent.platform as Platform) || 'whatsapp',
    category: (supabaseAgent.category as AgentCategory) || 'other',
    categories: supabaseAgent.categories || [], // Support catégories multiples
    status: (supabaseAgent.status as AgentStatus) || 'active',
    rating: supabaseAgent.rating || 0,
    totalSales: 0, // Not in Supabase schema
    lastActivity: new Date(supabaseAgent.updated_at || supabaseAgent.created_at),
    notes: '', // Notes internes - restent vides depuis Supabase (stockage local uniquement)
    about: supabaseAgent.description,
    adminNotes: '', // Admin notes - restent vides depuis Supabase (stockage local uniquement)
    isVerified: !!supabaseAgent.verification_date,
    avatar: undefined, // Not in Supabase schema
    languages: supabaseAgent.languages || [],
    specialties: supabaseAgent.specialties || [],
    contactInfo: {
      platform: (supabaseAgent.platform as Platform) || 'whatsapp',
      identifier: supabaseAgent.identifier || '',
      phoneNumber: supabaseAgent.phone_number,
      email: supabaseAgent.email,
      websiteUrl: (supabaseAgent as any).website_url // Ajouté dans Supabase
    },
    stats: {
      totalContacts: 0,
      responseRate: 0,
      avgResponseTime: 0,
      successfulDeals: 0,
      customerRating: supabaseAgent.rating || 0
    }
  };
};

// Helper function to transform Client Agent to Supabase Agent
// NOTE: notes et adminNotes sont EXCLUS volontairement pour rester locaux uniquement
const transformClientAgent = (clientAgent: CreateAgentRequest | UpdateAgentRequest): Partial<SupabaseAgent> => {
  return {
    name: clientAgent.name,
    identifier: clientAgent.identifier,
    phone_number: clientAgent.phoneNumber,
    email: clientAgent.contactInfo?.email,
    website_url: clientAgent.contactInfo?.websiteUrl,
    platform: clientAgent.platform,
    category: clientAgent.category,
    categories: clientAgent.categories, // Support catégories multiples
    specialties: clientAgent.specialties,
    status: 'status' in clientAgent ? clientAgent.status || 'active' : 'active',
    description: clientAgent.about,
    // admin_notes: SUPPRIMÉ - notes internes restent locales
    location: undefined,
    languages: clientAgent.languages
  };
};

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      filteredAgents: [],
      filters: {},
      isLoading: false,
      error: null,

      // Load agents - utilise Supabase ou localStorage comme fallback
      loadAgents: async () => {
        set({ isLoading: true, error: null });
        
        try {
          let agents: Agent[] = [];
          
          if (isSupabaseConfigured) {
            // Charger depuis Supabase
            console.log('🔄 Chargement des agents depuis Supabase...');
            const supabaseAgents = await agentServiceSimple.getAll();
            agents = supabaseAgents.map(transformSupabaseAgent);
            console.log(`✅ ${agents.length} agents chargés depuis Supabase`);
            
            // Charger les notes locales et les fusionner
            const localNotes = localStorage.getItem('oxo-agent-notes');
            if (localNotes) {
              const notesMap = JSON.parse(localNotes);
              agents = agents.map(agent => ({
                ...agent,
                notes: notesMap[agent.id]?.notes || '',
                adminNotes: notesMap[agent.id]?.adminNotes || ''
              }));
              console.log('📝 Notes locales fusionnées');
            }
            
            // Synchroniser avec localStorage pour le cache
            localStorage.setItem('oxo-agents', JSON.stringify(agents));
          } else {
            // Fallback vers localStorage
            console.log('⚠️ Supabase non configuré, utilisation de localStorage');
            const stored = localStorage.getItem('oxo-agents');
            agents = stored ? JSON.parse(stored) : [];
            console.log(`📱 ${agents.length} agents chargés depuis localStorage`);
          }
          
          set({ 
            agents,
            filteredAgents: agents,
            isLoading: false 
          });
          
          // Appliquer les filtres existants
          get().applyFilters();
        } catch (error) {
          console.error('❌ Erreur chargement agents:', error);
          
          // En cas d'erreur avec Supabase, essayer localStorage
          try {
            const stored = localStorage.getItem('oxo-agents');
            const fallbackAgents = stored ? JSON.parse(stored) : [];
            console.log(`🔄 Fallback: ${fallbackAgents.length} agents depuis localStorage`);
            
            set({ 
              agents: fallbackAgents,
              filteredAgents: fallbackAgents,
              error: null,
              isLoading: false 
            });
          } catch (fallbackError) {
            console.error('❌ Erreur fallback localStorage:', fallbackError);
            set({ 
              agents: [],
              filteredAgents: [],
              error: 'Erreur lors du chargement des agents',
              isLoading: false 
            });
          }
        }
      },

      // Add agent - VERSION DIRECTE DATABASESERVICE
      addAgent: async (agentData: CreateAgentRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('➕ Création agent directe...');
          console.log('📦 Agent data:', agentData);
          
          // Créer directement avec databaseService
          const createData = {
            name: agentData.name,
            identifier: agentData.identifier,
            phone_number: agentData.phoneNumber,
            email: agentData.contactInfo?.email,
            website_url: agentData.contactInfo?.websiteUrl,
            platform: agentData.platform,
            category: agentData.category,
            description: agentData.about || '',
            internal_notes: agentData.notes || ''
          };
          
          console.log('📤 Create data préparé:', createData);
          
          const result = await databaseService.create(createData);
          
          console.log('📥 Résultat création:', result);
          
          if (result.error) {
            console.error('❌ Erreur création:', result.error);
            throw new Error('Échec de création: ' + result.error);
          }
          
          // Transformer en Agent pour le store
          const createdAgent = result.data[0];
          const newAgent: Agent = {
            id: createdAgent.id!,
            name: createdAgent.name,
            identifier: createdAgent.identifier,
            phoneNumber: createdAgent.phone_number,
            platform: agentData.platform,
            platforms: agentData.platforms || [],
            status: 'active',
            rating: 0,
            totalSales: 0,
            lastActivity: new Date(),
            about: agentData.about || '',
            adminNotes: agentData.adminNotes || '',
            isVerified: true,
            languages: agentData.languages || [],
            specialties: agentData.specialties || [],
            contactInfo: {
              platform: agentData.platform,
              identifier: agentData.identifier,
              phoneNumber: agentData.phoneNumber,
              email: agentData.contactInfo?.email,
              websiteUrl: agentData.contactInfo?.websiteUrl
            },
            stats: {
              totalContacts: 0,
              responseRate: 0,
              avgResponseTime: 0,
              successfulDeals: 0,
              customerRating: 0
            }
          };

          // Mettre à jour le store
          const currentAgents = get().agents;
          const updatedAgents = [...currentAgents, newAgent];
          
          set({ 
            agents: updatedAgents,
            filteredAgents: updatedAgents,
            isLoading: false,
            error: null
          });
          
          get().applyFilters();
          console.log('✅ Agent ajouté avec succès:', newAgent.name);
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

      // Update agent - VERSION DIRECTE DATABASESERVICE
      updateAgent: async (agentData: UpdateAgentRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔄 Mise à jour agent directe...');
          console.log('📦 Agent data:', agentData);
          
          // Mettre à jour directement avec databaseService
          const updateData = {
            name: agentData.name,
            identifier: agentData.identifier,
            phone_number: agentData.phoneNumber,
            email: agentData.contactInfo?.email,
            website_url: agentData.contactInfo?.websiteUrl,
            platform: agentData.platform,
            category: agentData.category,
            description: agentData.about || '',
            internal_notes: agentData.notes || ''
          };
          
          console.log('📤 Update data préparé:', updateData);
          
          const result = await databaseService.update(agentData.id, updateData);
          
          console.log('📥 Résultat databaseService:', result);
          
          if (result.error) {
            console.error('❌ Erreur databaseService:', result.error);
            throw new Error('Échec de mise à jour: ' + result.error);
          }
          
          // Mise à jour locale directe
          const currentAgents = get().agents;
          const updatedAgents = currentAgents.map(agent => 
            agent.id === agentData.id 
              ? { 
                  ...agent, 
                  name: agentData.name,
                  identifier: agentData.identifier,
                  phoneNumber: agentData.phoneNumber,
                  platform: agentData.platform,
                  platforms: agentData.platforms || [],
                  category: agentData.category,
                  categories: agentData.categories || [],
                  notes: agentData.notes,
                  about: agentData.about,
                  adminNotes: agentData.adminNotes,
                  languages: agentData.languages || [],
                  specialties: agentData.specialties || [],
                  contactInfo: {
                    ...agent.contactInfo,
                    ...agentData.contactInfo
                  }
                }
              : agent
          );
          
          localStorage.setItem('oxo-agents', JSON.stringify(updatedAgents));
          
          set({ 
            agents: updatedAgents,
            filteredAgents: updatedAgents,
            isLoading: false 
          });
          
          get().applyFilters();
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

      // Delete agent - VERSION DIRECTE DATABASESERVICE
      deleteAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🗑️ Suppression agent directe...');
          console.log('🆔 ID à supprimer:', id);
          
          // Supprimer directement avec databaseService
          const result = await databaseService.delete(id);
          
          console.log('📥 Résultat suppression:', result);
          
          if (result.error) {
            console.error('❌ Erreur suppression:', result.error);
            throw new Error('Échec de suppression: ' + result.error);
          }
          
          // Mettre à jour le store local
          const currentAgents = get().agents;
          const updatedAgents = currentAgents.filter(agent => agent.id !== id);
          
          set({ 
            agents: updatedAgents,
            filteredAgents: updatedAgents,
            isLoading: false,
            error: null 
          });
          
          get().applyFilters();
          console.log('✅ Agent supprimé avec succès:', id);
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

      // Set filters
      setFilters: (newFilters: Partial<AgentFilters>) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters }
        }));
        get().applyFilters();
      },

      // Apply filters
      applyFilters: () => {
        const { agents, filters } = get();
        let filtered = [...agents];

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(agent =>
            // Recherche dans les infos de base
            agent.name.toLowerCase().includes(searchLower) ||
            agent.identifier.toLowerCase().includes(searchLower) ||
            agent.contactInfo.email?.toLowerCase().includes(searchLower) ||
            
            // Recherche dans les notes (locales uniquement)
            (agent.notes && agent.notes.toLowerCase().includes(searchLower)) ||
            
            // ✅ NOUVEAU: Recherche dans la description "À propos"
            (agent.about && agent.about.toLowerCase().includes(searchLower)) ||
            
            // ✅ NOUVEAU: Recherche dans les spécialités
            agent.specialties.some(specialty => 
              specialty.toLowerCase().includes(searchLower)
            ) ||
            
            // ✅ NOUVEAU: Recherche dans les langues
            agent.languages.some(language => 
              language.toLowerCase().includes(searchLower)
            ) ||
            
            
            // ✅ NOUVEAU: Recherche dans l'URL du site web
            (agent.contactInfo.websiteUrl && 
              agent.contactInfo.websiteUrl.toLowerCase().includes(searchLower))
          );
        }

        if (filters.platform) {
          filtered = filtered.filter(agent => agent.platform === filters.platform);
        }


        if (filters.status) {
          filtered = filtered.filter(agent => agent.status === filters.status);
        }

        if (filters.isVerified !== undefined) {
          filtered = filtered.filter(agent => agent.isVerified === filters.isVerified);
        }

        if (filters.minRating !== undefined) {
          filtered = filtered.filter(agent => agent.rating >= filters.minRating!);
        }

        set({ filteredAgents: filtered });
      },

      // Clear filters
      clearFilters: () => {
        set({ filters: {} });
        get().applyFilters();
      },

      // Get agent by ID
      getAgentById: (id: string) => {
        return get().agents.find(agent => agent.id === id);
      },

      // Get agents by platform
      getAgentsByPlatform: (platform: Platform) => {
        return get().agents.filter(agent => agent.platform === platform);
      },


      // Search agents
      searchAgents: (query: string) => {
        get().setFilters({ search: query });
      },

      // Error management
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Storage management
      saveToStorage: () => {
        const { agents } = get();
        localStorage.setItem('oxo-agents', JSON.stringify(agents));
      },

      resetToDefaults: () => {
        localStorage.removeItem('oxo-agents');
        set({
          agents: [],
          filteredAgents: [],
          filters: {},
          error: null
        });
      },

      exportData: () => {
        const { agents } = get();
        return JSON.stringify(agents, null, 2);
      },

      importData: (data: string) => {
        try {
          const importedAgents = JSON.parse(data);
          if (Array.isArray(importedAgents)) {
            localStorage.setItem('oxo-agents', JSON.stringify(importedAgents));
            set({
              agents: importedAgents,
              filteredAgents: importedAgents,
              error: null
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      // Synchronisation avec Supabase
      syncWithSupabase: async () => {
        if (!isSupabaseConfigured) {
          console.log('⚠️ Supabase non configuré, synchronisation impossible');
          return false;
        }

        set({ isLoading: true, error: null });
        
        try {
          console.log('🔄 Synchronisation avec Supabase...');
          
          // Récupérer les données de Supabase
          const supabaseAgents = await AgentsService.getAll();
          const transformedAgents = supabaseAgents.map(transformSupabaseAgent);
          
          // Récupérer les données locales
          const stored = localStorage.getItem('oxo-agents');
          const localAgents: Agent[] = stored ? JSON.parse(stored) : [];
          
          // Pour cette version, on privilégie les données de Supabase
          // Dans une version plus avancée, on pourrait faire un merge intelligent
          const finalAgents = transformedAgents.length > 0 ? transformedAgents : localAgents;
          
          // Mettre à jour le cache local avec les données de Supabase
          localStorage.setItem('oxo-agents', JSON.stringify(finalAgents));
          
          set({
            agents: finalAgents,
            filteredAgents: finalAgents,
            isLoading: false,
            error: null
          });
          
          get().applyFilters();
          console.log(`✅ Synchronisation réussie: ${finalAgents.length} agents`);
          return true;
        } catch (error) {
          console.error('❌ Erreur synchronisation:', error);
          set({
            error: 'Erreur lors de la synchronisation',
            isLoading: false
          });
          return false;
        }
      },

      // Status Supabase
      getSupabaseStatus: () => {
        return {
          configured: isSupabaseConfigured,
          connected: isSupabaseConfigured, // Dans une version plus avancée, on pourrait tester la connexion
        };
      },

      // Sauvegarder les notes localement (séparément de Supabase)
      saveAgentNotes: (agentId: string, notes: string, adminNotes: string) => {
        try {
          // Charger les notes existantes
          const stored = localStorage.getItem('oxo-agent-notes');
          const notesMap = stored ? JSON.parse(stored) : {};
          
          // Mettre à jour les notes pour cet agent
          notesMap[agentId] = { notes, adminNotes };
          
          // Sauvegarder dans localStorage
          localStorage.setItem('oxo-agent-notes', JSON.stringify(notesMap));
          
          // Mettre à jour le state local
          const currentAgents = get().agents;
          const updatedAgents = currentAgents.map(agent => 
            agent.id === agentId 
              ? { ...agent, notes, adminNotes }
              : agent
          );
          
          set({ 
            agents: updatedAgents,
            filteredAgents: updatedAgents 
          });
          
          get().applyFilters();
          console.log('📝 Notes sauvegardées localement pour agent:', agentId);
        } catch (error) {
          console.error('❌ Erreur sauvegarde notes locales:', error);
        }
      }
    }),
    {
      name: 'oxo-agent-storage',
      partialize: (state) => ({
        agents: state.agents,
        filters: state.filters
      })
    }
  )
);