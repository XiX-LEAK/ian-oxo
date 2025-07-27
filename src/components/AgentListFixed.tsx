import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  MessageCircle,
  Phone,
  Star,
  CheckCircle,
  X
} from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from './animations/LoadingSpinner';
import { AgentContactInfo } from '@/components/AgentContactInfo';
import { ExpandableText } from '@/components/ExpandableText';
import { ScrollingCategories } from '@/components/ScrollingCategories';
import { SearchHelp } from '@/components/SearchHelp';
import type { Agent, Platform, AgentCategory, AgentStatus } from '@/types/agent';

const platformIcons = {
  whatsapp: '📱',
  wechat: '💬',
  telegram: '✈️',
  instagram: '📷',
  tiktok: '🎵',
  discord: '🎮',
  signal: '🔒'
};

const platformColors = {
  whatsapp: 'bg-green-100 text-green-800',
  wechat: 'bg-green-100 text-green-800',
  telegram: 'bg-blue-100 text-blue-800',
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-gray-100 text-gray-800',
  discord: 'bg-purple-100 text-purple-800',
  signal: 'bg-indigo-100 text-indigo-800'
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const categoryLabels = {
  electronics: 'Électronique',
  fashion: 'Mode',
  accessories: 'Accessoires',
  'home-garden': 'Maison & Jardin',
  beauty: 'Beauté',
  sports: 'Sport',
  'books-media': 'Livres & Médias',
  automotive: 'Automobile',
  travel: 'Voyage',
  food: 'Alimentation',
  services: 'Services',
  other: 'Autre'
};

interface AgentListProps {
  onEditAgent?: (agent: Agent) => void;
  onCreateAgent: () => void;
}

export const AgentListFixed: React.FC<AgentListProps> = ({ onEditAgent, onCreateAgent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<AgentCategory | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<AgentStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetail, setShowAgentDetail] = useState(false);

  const { mode, user } = useAuthStore();
  const { 
    filteredAgents, 
    isLoading, 
    error, 
    loadAgents, 
    deleteAgent, 
    setFilters, 
    clearFilters 
  } = useAgentStore();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    setFilters({
      search: searchQuery,
      platform: selectedPlatform || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined
    });
  }, [searchQuery, selectedPlatform, selectedCategory, selectedStatus, setFilters]);

  const handleDeleteAgent = async (agent: Agent) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'agent ${agent.name} ?`)) {
      await deleteAgent(agent.id);
    }
  };

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDetail(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('');
    setSelectedCategory('');
    setSelectedStatus('');
    clearFilters();
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Aujourd\'hui';
    if (diffDays === 2) return 'Hier';
    if (diffDays <= 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-12 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative">
          <LoadingSpinner variant="spiral" size="lg" color="#f97316" />
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-100"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900">Chargement des agents...</h3>
          <p className="text-sm text-gray-500">Recherche des agents vérifiés disponibles</p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-medium">{error}</div>
        <button 
          onClick={loadAgents}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, description, spécialité, langue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          {/* Aide à la recherche */}
          <SearchHelp className="mt-1" />
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </motion.button>

          {mode === 'admin' && (
            <motion.button
              onClick={onCreateAgent}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvel agent
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-lg shadow border"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plateforme
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes les plateformes</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="wechat">WeChat</option>
                  <option value="telegram">Telegram</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="discord">Discord</option>
                  <option value="signal">Signal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as AgentCategory)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Toutes les catégories</option>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as AgentStatus)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{filteredAgents.length} agent(s) trouvé(s)</span>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
              whileHover={{ 
                y: -4,
                scale: 1.01,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                transition: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <motion.img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full ring-2 ring-transparent transition-all duration-300"
                    whileHover={{ 
                      scale: 1.1,
                      ring: "2px solid #f97316"
                    }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      {agent.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    {/* Informations de contact avec composant réutilisable */}
                    <AgentContactInfo agent={agent} size="sm" showEmpty={false} />
                  </div>
                </div>

                {mode === 'admin' && (
                  <div className="relative group">
                    <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleViewAgent(agent)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </button>
                      <button
                        onClick={() => onEditAgent?.(agent)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteAgent(agent)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform and Categories */}
              <div className="flex items-center space-x-2 mt-3">
                <motion.span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[agent.platform]} transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                >
                  {platformIcons[agent.platform]} {agent.platform}
                </motion.span>
                <motion.span 
                  className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.05,
                    y: -2
                  }}
                >
                  {categoryLabels[agent.category]}
                </motion.span>
              </div>

              {/* Rating */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="text-2xl font-bold text-orange-600">
                      {agent.rating > 0 ? agent.rating.toFixed(1) : '-'}
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(agent.rating)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Contact */}
              <div className="flex items-center justify-between mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                  {agent.status === 'active' ? 'Actif' :
                   agent.status === 'inactive' ? 'Inactif' :
                   agent.status === 'pending' ? 'En attente' : 'Suspendu'}
                </span>

                <div className="flex items-center space-x-2">
                  {agent.phoneNumber && (
                    <motion.a
                      href={`tel:${agent.phoneNumber}`}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-300"
                      title="Appeler"
                      whileHover={{ 
                        scale: 1.1,
                        y: -2,
                        backgroundColor: "#dbeafe",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Phone className="w-4 h-4" />
                    </motion.a>
                  )}
                  <motion.button
                    onClick={() => handleViewAgent(agent)}
                    className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all duration-300"
                    title="Contacter"
                    whileHover={{ 
                      scale: 1.1,
                      y: -2,
                      backgroundColor: "#dcfce7",
                      boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Last Activity */}
              <div className="mt-3 text-xs text-gray-500">
                Dernière activité: {formatLastActivity(agent.lastActivity)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Aucun agent trouvé</div>
          <p className="text-gray-500 mb-4">
            Essayez de modifier vos critères de recherche ou d'ajouter un nouvel agent.
          </p>
          {mode === 'admin' && (
            <button onClick={onCreateAgent} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2 inline" />
              Ajouter un agent
            </button>
          )}
        </div>
      )}

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {showAgentDetail && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAgentDetail(false)}>
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Détails de l'agent</h2>
                  <button
                    onClick={() => setShowAgentDetail(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Agent Info */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedAgent.avatar}
                      alt={selectedAgent.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {selectedAgent.name}
                        </h3>
                        {selectedAgent.isVerified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-gray-600">{selectedAgent.identifier}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {renderStars(selectedAgent.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          {selectedAgent.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${platformColors[selectedAgent.platform]}`}>
                          {platformIcons[selectedAgent.platform]} {selectedAgent.platform}
                        </span>
                        <span className="text-gray-600">{selectedAgent.identifier}</span>
                      </div>
                      {selectedAgent.phoneNumber && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${selectedAgent.phoneNumber}`} className="text-blue-600 hover:underline">{selectedAgent.phoneNumber}</a>
                        </div>
                      )}
                      {selectedAgent.contactInfo?.email && (
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">✉️</span>
                          <a href={`mailto:${selectedAgent.contactInfo.email}`} className="text-blue-600 hover:underline">{selectedAgent.contactInfo.email}</a>
                        </div>
                      )}
                      {selectedAgent.contactInfo?.websiteUrl && (
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">🌐</span>
                          <a href={selectedAgent.contactInfo.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedAgent.contactInfo.websiteUrl}</a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Specialties */}
                  {selectedAgent.specialties.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Spécialités</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {selectedAgent.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Langues</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.languages.map((language, index) => (
                          <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* À propos */}
                  {selectedAgent.about && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">À propos</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <ExpandableText 
                          text={selectedAgent.about} 
                          maxLength={150}
                          className="text-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedAgent.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                      <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                        {selectedAgent.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};