import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MessageCircle,
  Phone,
  X,
  ArrowUpDown,
  Grid,
  List
} from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { useAuthStore } from '@/stores/authStore';
import { LoadingSpinner } from './animations/LoadingSpinner';
import { ExpandableText } from '@/components/ExpandableText';
import { ScrollingTags } from '@/components/animations/ScrollingTags';
import type { Agent, Platform, AgentStatus } from '@/types/agent';

const platformIcons = {
  whatsapp: '📱',
  wechat: '💬',
  telegram: '✈️',
  instagram: '📷',
  tiktok: '🎵',
  discord: '🎮',
  signal: '🔒'
};

const statusColors = {
  active: 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white',
  inactive: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
  suspended: 'bg-gradient-to-r from-red-400 to-red-500 text-white',
  pending: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
};

interface AgentListProps {
  onEditAgent?: (agent: Agent) => void;
  onCreateAgent?: () => void;
}

export const AgentList: React.FC<AgentListProps> = ({ onEditAgent, onCreateAgent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentDetail, setShowAgentDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'platform'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const { mode } = useAuthStore();
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
    setFilters({ search: searchQuery });
  }, [searchQuery, setFilters]);

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentDetail(true);
  };

  const handleDeleteAgent = async (agent: Agent) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'agent ${agent.name} ?`)) {
      await deleteAgent(agent.id);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearFilters();
  };

  const toggleDescription = (agentId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        break;
      case 'platform':
        comparison = a.platform.localeCompare(b.platform);
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-red-50 rounded-xl border border-red-200"
      >
        <div className="text-red-600 font-semibold mb-4">Erreur: {error}</div>
        <button onClick={loadAgents} className="btn-primary">Réessayer</button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec animation ultra moderne */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl backdrop-blur-md border-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,247,237,0.4) 50%, rgba(255,237,213,0.3) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
        }}
      >
        {/* Éléments de fond subtils pour intégration */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100/30 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/40 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-orange-50/20 to-white/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-4" style={{ minHeight: '80px' }}>
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl font-black text-gray-800 tracking-tight"
                style={{
                  lineHeight: '1.4',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Agents
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex items-center space-x-3 text-sm font-semibold text-gray-500"
              >
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{filteredAgents.length} agents actifs</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex items-center space-x-4"
            >
              {/* Toggle View Mode */}
              <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-md rounded-xl p-1 border border-gray-200 shadow-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as any);
                    setSortOrder(order as any);
                  }}
                  className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl px-4 py-2 pr-8 text-gray-700 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm appearance-auto"
                >
                  <option value="name-asc">Nom A-Z</option>
                  <option value="name-desc">Nom Z-A</option>
                  <option value="date-desc">Plus récent</option>
                  <option value="date-asc">Plus ancien</option>
                  <option value="platform-asc">Plateforme A-Z</option>
                </select>
              </div>

              {/* Create Agent Button */}
              {mode === 'admin' && onCreateAgent && (
                <motion.button
                  onClick={onCreateAgent}
                  className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouvel Agent</span>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Recherche Intelligente */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Barre de recherche améliorée */}
            <div className="relative">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Recherche intelligente : nom, services, description, langues, spécialités..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl pl-12 pr-12 py-4 text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-base"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                    backdropFilter: 'blur(40px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderTop: '1px solid rgba(255,255,255,1)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 20px rgba(0,0,0,0.08)'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Agent List/Grid */}
      {sortedAgents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center py-12 backdrop-blur-md rounded-2xl border-0 shadow-lg relative"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,247,237,0.4) 50%, rgba(255,237,213,0.3) 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          {/* Éléments de fond subtils pour intégration */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-orange-100/25 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/30 to-transparent rounded-full blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16" fill="none" stroke="#000000" viewBox="0 0 24 24" strokeWidth={1.5}>
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucun résultat pour cette recherche
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou ajoutez un nouvel agent.
            </p>
            {searchQuery ? (
              <motion.button 
                onClick={clearSearch} 
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Effacer la recherche
              </motion.button>
            ) : null}
          </div>
        </motion.div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence>
            {sortedAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  delay: index * 0.08,
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                className={`
                  relative overflow-hidden rounded-2xl group cursor-pointer
                  ${viewMode === 'list' 
                    ? 'flex items-center space-x-6 p-6' 
                    : 'p-8'
                  }
                `}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.03,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  transition: { duration: 0.3, ease: 'easeOut' }
                }}
              >
                {/* Background gradient décoratif */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-2xl"></div>
                </div>
                
                {/* Agent Avatar amélioré */}
                <div className={`
                  relative ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-6'} z-10
                `}>
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-2xl"
                    whileHover={{ 
                      rotate: [0, -5, 5, -5, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'gradientShift 4s ease-in-out infinite'
                    }}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </motion.div>
                </div>

                {/* Agent Info amélioré */}
                <div className={`${viewMode === 'list' ? 'flex-1' : ''} relative z-10`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <motion.h3 
                        className="text-xl font-bold text-gray-800 leading-tight"
                        whileHover={{ scale: 1.02 }}
                      >
                        {agent.name}
                      </motion.h3>
                    </div>
                    
                    {mode === 'admin' && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditAgent?.(agent)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description et À propos simplifiées */}
                  {(agent.notes || agent.about) && (
                    <motion.div 
                      className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {agent.notes && (
                        <div className="mb-2 max-w-full overflow-hidden">
                          <div className="max-w-full overflow-hidden">
                            <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
                              {expandedDescriptions.has(agent.id) 
                                ? agent.notes 
                                : truncateText(agent.notes, 100)
                              }
                              {agent.notes.length > 100 && (
                                <button
                                  onClick={() => toggleDescription(agent.id)}
                                  className="ml-1 text-orange-600 hover:text-orange-700 text-xs font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-200/50"
                                >
                                  {expandedDescriptions.has(agent.id) ? ' moins' : ' plus'}
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {agent.about && (
                        <div className="max-w-full overflow-hidden">
                          <div className="max-w-full overflow-hidden">
                            <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
                              {expandedDescriptions.has(agent.id + '-about') 
                                ? agent.about 
                                : truncateText(agent.about, 120)
                              }
                              {agent.about.length > 120 && (
                                <button
                                  onClick={() => {
                                    const key = agent.id + '-about';
                                    setExpandedDescriptions(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(key)) {
                                        newSet.delete(key);
                                      } else {
                                        newSet.add(key);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className="ml-1 text-orange-600 hover:text-orange-700 text-xs font-medium bg-orange-50 px-2 py-1 rounded-md border border-orange-200/50"
                                >
                                  {expandedDescriptions.has(agent.id + '-about') ? ' moins' : ' plus'}
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Spécialités et Langues avec animation */}
                  {((agent.specialties && agent.specialties.length > 0) || (agent.languages && agent.languages.length > 0)) && (
                    <motion.div 
                      className="mb-3 space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {agent.specialties && agent.specialties.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">🎯 Spécialités</div>
                          <ScrollingTags 
                            items={agent.specialties}
                            maxVisible={2}
                            tagClassName="px-2 py-1 bg-gradient-to-r from-purple-400 to-purple-500 text-white text-xs rounded-lg font-medium"
                            speed={2}
                            pauseOnHover={true}
                          />
                        </div>
                      )}
                      
                      {agent.languages && agent.languages.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">🌍 Langues</div>
                          <ScrollingTags 
                            items={agent.languages}
                            maxVisible={2}
                            tagClassName="px-2 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs rounded-lg font-medium"
                            speed={2.5}
                            pauseOnHover={true}
                          />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Contact Actions simplifiées */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {agent.phoneNumber && (
                        <a
                          href={`tel:${agent.phoneNumber}`}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-200"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {(agent.email || agent.contactInfo?.email) && (
                        <a
                          href={`mailto:${agent.email || agent.contactInfo?.email}`}
                          className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewAgent(agent)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium border border-orange-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Voir</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Agent Detail Modal - Design Ultra Moderne */}
      <AnimatePresence>
        {showAgentDetail && selectedAgent && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateX: -10 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="relative max-w-5xl w-full max-h-[95vh] overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.9) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: `
                  0 32px 64px rgba(0,0,0,0.2),
                  0 0 0 1px rgba(255,255,255,0.1),
                  inset 0 1px 0 rgba(255,255,255,0.8),
                  inset 0 0 20px rgba(255,255,255,0.1)
                `
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec design iOS/Material moderne */}
              <div className="relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientFlow 8s ease infinite'
                }}
              >
                {/* Texture overlay moderne */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20"></div>
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                   radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 0%, transparent 50%)`
                }}></div>
                
                <div className="relative z-10 p-8 flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <motion.div 
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-3xl blur-xl"></div>
                      <div className="relative w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-white font-black text-4xl border border-white/30 shadow-2xl">
                        {selectedAgent.name.charAt(0).toUpperCase()}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      </div>
                    </motion.div>
                    
                    <div className="space-y-3">
                      <motion.h2 
                        className="text-4xl font-black text-white tracking-tight"
                        style={{ 
                          textShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.1)' 
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {selectedAgent.name}
                      </motion.h2>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/25 backdrop-blur-md rounded-2xl border border-white/30"
                      >
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                        <span className="text-white font-bold text-sm tracking-wide uppercase">
                          {selectedAgent.status}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => setShowAgentDetail(false)}
                    className="group relative p-4 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-2xl transition-all border border-white/30 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-white group-hover:text-gray-100" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>
                </div>
              </div>

              {/* Content avec design ultra moderne */}
              <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-8 space-y-8">
                {/* À propos - Card flottante moderne */}
                {selectedAgent.about && (
                  <motion.div 
                    className="group relative overflow-hidden rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1)'
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-purple-500/5"></div>
                    <div className="relative p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">📋</span>
                        </div>
                        <h4 className="text-2xl font-black text-gray-800 tracking-tight">À propos & Services</h4>
                      </div>
                      <div className="text-gray-700 leading-relaxed text-lg font-medium max-w-full overflow-hidden">
                        <ExpandableText 
                          text={selectedAgent.about} 
                          maxLength={250}
                          className="text-gray-700 leading-relaxed max-w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Grid Cards moderne avec hover effects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informations Card */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      border: '1px solid rgba(34, 197, 94, 0.1)',
                      boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                    }}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-green-500/5"></div>
                    <div className="relative p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">💼</span>
                        </div>
                        <h4 className="text-2xl font-black text-gray-800">Informations</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 flex items-center justify-between group hover:bg-white/80 transition-all">
                          <span className="text-gray-600 font-semibold">Plateforme</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{platformIcons[selectedAgent.platform]}</span>
                            <span className="text-gray-800 font-bold capitalize">{selectedAgent.platform}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Contact Card */}
                  <motion.div 
                    className="group relative overflow-hidden rounded-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                      border: '1px solid rgba(168, 85, 247, 0.1)',
                      boxShadow: '0 8px 32px rgba(168, 85, 247, 0.1)'
                    }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-purple-500/5"></div>
                    <div className="relative p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white text-lg">📱</span>
                        </div>
                        <h4 className="text-2xl font-black text-gray-800">Contact</h4>
                      </div>
                      <div className="space-y-4">
                        {selectedAgent.phoneNumber && (
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 flex items-center justify-between hover:bg-white/80 transition-all">
                            <span className="text-gray-600 font-semibold">Téléphone</span>
                            <a href={`tel:${selectedAgent.phoneNumber}`} 
                               className="text-purple-600 hover:text-purple-700 font-bold transition-colors text-right">
                              {selectedAgent.phoneNumber}
                            </a>
                          </div>
                        )}
                        {(selectedAgent.email || selectedAgent.contactInfo?.email) && (
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 flex items-center justify-between hover:bg-white/80 transition-all">
                            <span className="text-gray-600 font-semibold">Email</span>
                            <a href={`mailto:${selectedAgent.email || selectedAgent.contactInfo?.email}`} 
                               className="text-purple-600 hover:text-purple-700 font-bold transition-colors text-right">
                              {selectedAgent.email || selectedAgent.contactInfo?.email}
                            </a>
                          </div>
                        )}
                        {selectedAgent.contactInfo?.websiteUrl && (
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 flex items-center justify-between hover:bg-white/80 transition-all">
                            <span className="text-gray-600 font-semibold">Site web</span>
                            <a href={selectedAgent.contactInfo.websiteUrl} target="_blank" rel="noopener noreferrer" 
                               className="text-purple-600 hover:text-purple-700 font-bold transition-colors text-right">
                              Visiter →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Spécialités et Langues - Design futuriste */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {selectedAgent.specialties && selectedAgent.specialties.length > 0 && (
                    <motion.div 
                      className="group relative overflow-hidden rounded-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(251, 113, 133, 0.05) 100%)',
                        border: '1px solid rgba(251, 146, 60, 0.1)',
                        boxShadow: '0 8px 32px rgba(251, 146, 60, 0.1)'
                      }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-orange-500/5"></div>
                      <div className="relative p-8">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🎯</span>
                          </div>
                          <h4 className="text-2xl font-black text-gray-800">Spécialités</h4>
                        </div>
                        <ScrollingTags 
                          items={selectedAgent.specialties}
                          maxVisible={5}
                          tagClassName="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-sm shadow-xl backdrop-blur-sm border border-white/20"
                          speed={2.5}
                          pauseOnHover={true}
                        />
                      </div>
                    </motion.div>
                  )}

                  {selectedAgent.languages && selectedAgent.languages.length > 0 && (
                    <motion.div 
                      className="group relative overflow-hidden rounded-3xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                        border: '1px solid rgba(20, 184, 166, 0.1)',
                        boxShadow: '0 8px 32px rgba(20, 184, 166, 0.1)'
                      }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-teal-500/5"></div>
                      <div className="relative p-8">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white text-lg">🌐</span>
                          </div>
                          <h4 className="text-2xl font-black text-gray-800">Langues</h4>
                        </div>
                        <ScrollingTags 
                          items={selectedAgent.languages}
                          maxVisible={5}
                          tagClassName="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-sm shadow-xl backdrop-blur-sm border border-white/20"
                          speed={3}
                          pauseOnHover={true}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Actions CTA modernes */}
                <motion.div 
                  className="flex flex-wrap justify-center gap-6 pt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {selectedAgent.phoneNumber && (
                    <motion.a
                      href={`tel:${selectedAgent.phoneNumber}`}
                      className="group relative overflow-hidden flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-2xl border border-green-400/20"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <Phone className="w-6 h-6 relative z-10" />
                      <span className="relative z-10 text-lg">Appeler maintenant</span>
                    </motion.a>
                  )}
                  {(selectedAgent.email || selectedAgent.contactInfo?.email) && (
                    <motion.a
                      href={`mailto:${selectedAgent.email || selectedAgent.contactInfo?.email}`}
                      className="group relative overflow-hidden flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-2xl border border-blue-400/20"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <MessageCircle className="w-6 h-6 relative z-10" />
                      <span className="relative z-10 text-lg">Envoyer un email</span>
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};