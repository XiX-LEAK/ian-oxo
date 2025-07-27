import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockDomains, getAllEnterprises, searchEnterprises } from '@/data/domains';
import type { Domain, Enterprise, SearchFilters } from '@/types';

interface DomainState {
  domains: Domain[];
  currentDomain: Domain | null;
  enterprises: Enterprise[];
  filteredEnterprises: Enterprise[];
  searchQuery: string;
  filters: SearchFilters;
  isLoading: boolean;
  error: string | null;
}

interface DomainActions {
  // Domain actions
  setCurrentDomain: (domain: Domain | null) => void;
  getDomainById: (id: string) => Domain | undefined;
  
  // Search actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  
  // Enterprise actions
  getEnterprisesByDomain: (domainId: string) => Enterprise[];
  searchAllEnterprises: (query: string) => Enterprise[];
  
  // CRUD operations (admin)
  addEnterprise: (domainId: string, enterprise: Omit<Enterprise, 'id'>) => void;
  updateEnterprise: (enterpriseId: string, updates: Partial<Enterprise>) => void;
  deleteEnterprise: (enterpriseId: string) => void;
  
  // Domain CRUD
  addDomain: (domain: Omit<Domain, 'id'>) => void;
  updateDomain: (domainId: string, updates: Partial<Domain>) => void;
  deleteDomain: (domainId: string) => void;
  
  // Utility
  refreshData: () => void;
  setError: (error: string | null) => void;
}

type DomainStore = DomainState & DomainActions;

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useDomainStore = create<DomainStore>()(
  persist(
    (set, get) => ({
      // Initial state
      domains: mockDomains,
      currentDomain: null,
      enterprises: getAllEnterprises(),
      filteredEnterprises: [],
      searchQuery: '',
      filters: {},
      isLoading: false,
      error: null,

      // Domain actions
      setCurrentDomain: (domain) => {
        set({ currentDomain: domain });
      },

      getDomainById: (id) => {
        return get().domains.find(domain => domain.id === id);
      },

      // Search actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        
        if (query.trim()) {
          const results = searchEnterprises(query);
          set({ filteredEnterprises: results });
        } else {
          set({ filteredEnterprises: [] });
        }
      },

      clearSearch: () => {
        set({ searchQuery: '', filteredEnterprises: [] });
      },

      // Filter actions
      setFilters: (newFilters) => {
        const { filters } = get();
        const updatedFilters = { ...filters, ...newFilters };
        set({ filters: updatedFilters });
        
        // Apply filters to current results
        // Cette logique pourrait être étendue pour filtrer selon les critères
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      // Enterprise actions
      getEnterprisesByDomain: (domainId) => {
        const domain = get().domains.find(d => d.id === domainId);
        return domain ? domain.entreprises : [];
      },

      searchAllEnterprises: (query) => {
        return searchEnterprises(query);
      },

      // CRUD operations
      addEnterprise: (domainId, enterprise) => {
        const { domains } = get();
        const newEnterprise: Enterprise = {
          ...enterprise,
          id: generateId(),
          dateAjout: new Date()
        };
        
        const updatedDomains = domains.map(domain => {
          if (domain.id === domainId) {
            return {
              ...domain,
              entreprises: [...domain.entreprises, newEnterprise]
            };
          }
          return domain;
        });
        
        set({ 
          domains: updatedDomains,
          enterprises: getAllEnterprises()
        });
      },

      updateEnterprise: (enterpriseId, updates) => {
        const { domains } = get();
        
        const updatedDomains = domains.map(domain => ({
          ...domain,
          entreprises: domain.entreprises.map(enterprise => 
            enterprise.id === enterpriseId 
              ? { ...enterprise, ...updates }
              : enterprise
          )
        }));
        
        set({ 
          domains: updatedDomains,
          enterprises: getAllEnterprises()
        });
      },

      deleteEnterprise: (enterpriseId) => {
        const { domains } = get();
        
        const updatedDomains = domains.map(domain => ({
          ...domain,
          entreprises: domain.entreprises.filter(enterprise => 
            enterprise.id !== enterpriseId
          )
        }));
        
        set({ 
          domains: updatedDomains,
          enterprises: getAllEnterprises()
        });
      },

      // Domain CRUD
      addDomain: (domain) => {
        const { domains } = get();
        const newDomain: Domain = {
          ...domain,
          id: generateId(),
          dateCreation: new Date(),
          entreprises: []
        };
        
        set({ domains: [...domains, newDomain] });
      },

      updateDomain: (domainId, updates) => {
        const { domains } = get();
        
        const updatedDomains = domains.map(domain =>
          domain.id === domainId
            ? { ...domain, ...updates }
            : domain
        );
        
        set({ domains: updatedDomains });
      },

      deleteDomain: (domainId) => {
        const { domains } = get();
        const updatedDomains = domains.filter(domain => domain.id !== domainId);
        
        set({ 
          domains: updatedDomains,
          enterprises: getAllEnterprises(),
          currentDomain: get().currentDomain?.id === domainId ? null : get().currentDomain
        });
      },

      // Utility
      refreshData: () => {
        set({ 
          enterprises: getAllEnterprises(),
          isLoading: false,
          error: null 
        });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      }
    }),
    {
      name: 'oxo-domain-storage',
      partialize: (state) => ({
        domains: state.domains,
        searchQuery: state.searchQuery,
        filters: state.filters
      })
    }
  )
);

// Sélecteurs pour faciliter l'utilisation
export const useDomains = () => useDomainStore(state => state.domains);
export const useCurrentDomain = () => useDomainStore(state => state.currentDomain);
export const useSearchQuery = () => useDomainStore(state => state.searchQuery);
export const useFilteredEnterprises = () => useDomainStore(state => state.filteredEnterprises);

// Actions exportées pour faciliter l'utilisation
export const domainActions = {
  setCurrentDomain: useDomainStore.getState().setCurrentDomain,
  setSearchQuery: useDomainStore.getState().setSearchQuery,
  clearSearch: useDomainStore.getState().clearSearch,
  addEnterprise: useDomainStore.getState().addEnterprise,
  updateEnterprise: useDomainStore.getState().updateEnterprise,
  deleteEnterprise: useDomainStore.getState().deleteEnterprise,
};