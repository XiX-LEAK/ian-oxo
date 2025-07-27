// 🏢 AFFICHAGE CLIENT ULTRA MODERNE DES AGENTS
// Design premium, sans notes internes, animations fluides

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Grid, List, Globe, Phone, Mail,
  MessageSquare, Tag, Languages, ExternalLink, Star,
  MapPin, Clock, Zap, TrendingUp, Award, Shield, X
} from 'lucide-react';

import AgentManagementService, { type Agent } from '@/services/agentManagementService';

// ===================================================================
// INTERFACES
// ===================================================================

interface AgentListModernProps {
  searchQuery?: string;
  selectedCategories?: string[];
  selectedPlatforms?: string[];
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'recent' | 'popular';

// ===================================================================
// COMPOSANT PRINCIPAL
// ===================================================================

export const AgentListModern: React.FC<AgentListModernProps> = ({
  searchQuery = '',
  selectedCategories = [],
  selectedPlatforms = [],
  className = ''
}) => {
  // États principaux
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de l'interface
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [internalSearch, setInternalSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  // ===================================================================
  // EFFETS
  // ===================================================================

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, selectedCategories, selectedPlatforms, internalSearch, sortBy]);

  // ===================================================================
  // CHARGEMENT DES DONNÉES
  // ===================================================================

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await AgentManagementService.getAllAgentsPublic();
      setAgents(data);
    } catch (err) {
      setError('Erreur lors du chargement des agents');
      console.error('Erreur chargement agents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ===================================================================
  // FILTRAGE ET TRI
  // ===================================================================

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Filtrage par recherche
    const query = searchQuery || internalSearch;
    if (query) {
      filtered = filtered.filter(agent =>
        agent.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        agent.about_description?.toLowerCase().includes(query.toLowerCase()) ||
        agent.email?.toLowerCase().includes(query.toLowerCase()) ||
        agent.categories?.some(cat => cat.toLowerCase().includes(query.toLowerCase())) ||
        agent.platforms?.some(plat => plat.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Filtrage par catégories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(agent =>
        agent.categories?.some(cat => selectedCategories.includes(cat))
      );
    }

    // Filtrage par plateformes
    if (selectedPlatforms.length > 0) {
      filtered = filtered.filter(agent =>
        agent.platforms?.some(plat => selectedPlatforms.includes(plat))
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'popular':
          // Simuler popularité basée sur nombre de catégories/plateformes
          const aPopularity = (a.categories?.length || 0) + (a.platforms?.length || 0);
          const bPopularity = (b.categories?.length || 0) + (b.platforms?.length || 0);
          return bPopularity - aPopularity;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  // ===================================================================
  // RENDU DES COMPOSANTS
  // ===================================================================

  const renderAgentCard = (agent: Agent, index: number) => (
    <motion.div
      key={agent.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => {
        setSelectedAgent(agent);
        setShowAgentModal(true);
      }}
      className="group cursor-pointer bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:scale-[1.02]"
    >
      {/* Header avec avatar et statut */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Avatar généré */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {agent.full_name ? agent.full_name[0].toUpperCase() : '?'}
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {agent.full_name || 'Agent anonyme'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600 font-medium">En ligne</span>
            </div>
          </div>
        </div>

        {/* Badge premium */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>PRO</span>
        </div>
      </div>

      {/* Description */}
      {agent.about_description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {agent.about_description}
        </p>
      )}

      {/* Informations de contact */}
      <div className="space-y-2 mb-4">
        {agent.email && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <span>{agent.email}</span>
          </div>
        )}
        
        {agent.phone_number && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-green-600" />
            </div>
            <span>{agent.phone_number}</span>
          </div>
        )}
        
        {agent.website_url && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-600" />
            </div>
            <span className="truncate">Site web</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Tags et badges */}
      <div className="space-y-3">
        {/* Plateformes */}
        {agent.platforms && agent.platforms.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <MessageSquare className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-gray-500">PLATEFORMES</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.platforms.slice(0, 3).map((platform, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium border border-blue-200"
                >
                  {platform}
                </span>
              ))}
              {agent.platforms.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                  +{agent.platforms.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Catégories */}
        {agent.categories && agent.categories.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Tag className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium text-gray-500">SPÉCIALITÉS</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium border border-purple-200"
                >
                  {category}
                </span>
              ))}
              {agent.categories.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                  +{agent.categories.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Langues */}
        {agent.languages && agent.languages.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Languages className="w-3 h-3 text-green-500" />
              <span className="text-xs font-medium text-gray-500">LANGUES</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {agent.languages.slice(0, 3).map((language, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium border border-green-200"
                >
                  {language}
                </span>
              ))}
              {agent.languages.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                  +{agent.languages.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer avec stats */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Ajouté {new Date(agent.created_at || '').toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-1">
            {/* Indicateurs de performance simulés */}
            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center">
              <Award className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAgentListItem = (agent: Agent, index: number) => (
    <motion.div
      key={agent.id}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={() => {
        setSelectedAgent(agent);
        setShowAgentModal(true);
      }}
      className="group cursor-pointer bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
          {agent.full_name ? agent.full_name[0].toUpperCase() : '?'}
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
              {agent.full_name || 'Agent anonyme'}
            </h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          
          {agent.about_description && (
            <p className="text-gray-600 text-sm line-clamp-1 mb-2">
              {agent.about_description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {agent.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{agent.email}</span>
              </div>
            )}
            {agent.platforms && agent.platforms.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>{agent.platforms.length} plateforme{agent.platforms.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags rapides */}
        <div className="hidden md:flex items-center space-x-2">
          {agent.categories && agent.categories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Badge premium */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          PRO
        </div>
      </div>
    </motion.div>
  );

  const renderAgentModal = () => (
    <AnimatePresence>
      {showAgentModal && selectedAgent && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAgentModal(false)}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="bg-white rounded-3xl shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-t-3xl px-8 py-8 text-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 border border-white/30 shadow-2xl">
                    {selectedAgent.full_name ? selectedAgent.full_name[0].toUpperCase() : '?'}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedAgent.full_name || 'Agent anonyme'}
                  </h2>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-200 font-medium">En ligne maintenant</span>
                  </div>

                  <div className="flex items-center justify-center space-x-6 text-white/80">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedAgent.platforms?.length || 0}</div>
                      <div className="text-sm">Plateformes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedAgent.categories?.length || 0}</div>
                      <div className="text-sm">Spécialités</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedAgent.languages?.length || 0}</div>
                      <div className="text-sm">Langues</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Colonne 1 - Informations et contact */}
                  <div className="space-y-6">
                    {/* À propos */}
                    {selectedAgent.about_description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          À propos
                        </h3>
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-gray-700 leading-relaxed">
                            {selectedAgent.about_description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-green-600" />
                        Contact
                      </h3>
                      <div className="space-y-3">
                        {selectedAgent.email && (
                          <a
                            href={`mailto:${selectedAgent.email}`}
                            className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 group-hover:text-blue-600">
                                {selectedAgent.email}
                              </div>
                              <div className="text-sm text-gray-500">Email</div>
                            </div>
                          </a>
                        )}
                        
                        {selectedAgent.phone_number && (
                          <a
                            href={`tel:${selectedAgent.phone_number}`}
                            className="flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800 group-hover:text-green-600">
                                {selectedAgent.phone_number}
                              </div>
                              <div className="text-sm text-gray-500">Téléphone</div>
                            </div>
                          </a>
                        )}
                        
                        {selectedAgent.website_url && (
                          <a
                            href={selectedAgent.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                          >
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                              <Globe className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 group-hover:text-purple-600 flex items-center">
                                <span className="truncate">Site web</span>
                                <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                              </div>
                              <div className="text-sm text-gray-500">Visitez le site</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Colonne 2 - Compétences et tags */}
                  <div className="space-y-6">
                    {/* Plateformes */}
                    {selectedAgent.platforms && selectedAgent.platforms.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                          Plateformes disponibles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.platforms.map((platform, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Catégories */}
                    {selectedAgent.categories && selectedAgent.categories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Tag className="w-5 h-5 mr-2 text-purple-600" />
                          Spécialités
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.categories.map((category, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium border border-purple-200 hover:bg-purple-200 transition-colors"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Langues */}
                    {selectedAgent.languages && selectedAgent.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                          <Languages className="w-5 h-5 mr-2 text-green-600" />
                          Langues parlées
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAgent.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium border border-green-200 hover:bg-green-200 transition-colors"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Badge de confiance */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">Agent vérifié</div>
                          <div className="text-sm text-gray-600">Profil validé par notre équipe</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-gray-50 rounded-b-3xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Ajouté le {new Date(selectedAgent.created_at || '').toLocaleDateString('fr-FR')}
                  </div>
                  
                  <button
                    onClick={() => setShowAgentModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ===================================================================
  // RENDU PRINCIPAL
  // ===================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header et contrôles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Titre et stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Nos agents disponibles
          </h2>
          <p className="text-gray-600">
            {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} 
            {searchQuery || internalSearch ? ' trouvé' + (filteredAgents.length > 1 ? 's' : '') : ' au total'}
          </p>
        </div>

        {/* Contrôles */}
        <div className="flex items-center space-x-4">
          {/* Recherche interne (si pas de prop searchQuery) */}
          {!searchQuery && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
          >
            <option value="recent">Plus récents</option>
            <option value="name">Par nom</option>
            <option value="popular">Plus populaires</option>
          </select>

          {/* Mode d'affichage */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Chargement des agents...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAgents}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {searchQuery || internalSearch ? 'Aucun agent trouvé' : 'Aucun agent disponible'}
          </h3>
          <p className="text-gray-600">
            {searchQuery || internalSearch 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Les agents seront bientôt disponibles'
            }
          </p>
        </div>
      ) : (
        <>
          {/* Grille ou liste */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAgents.map((agent, index) => renderAgentCard(agent, index))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAgents.map((agent, index) => renderAgentListItem(agent, index))}
            </div>
          )}
        </>
      )}

      {/* Modal détail agent */}
      {renderAgentModal()}
    </div>
  );
};

export default AgentListModern;