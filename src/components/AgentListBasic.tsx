import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Star, CheckCircle, Phone, MessageCircle, Edit, Trash2, Eye, MoreVertical, MessageSquare } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import { ReviewsModal } from './ReviewsModalBasic';

interface AgentListBasicProps {
  onEditAgent?: (agent: any) => void;
  onCreateAgent: () => void;
  onDeleteAgent?: (agentId: string) => Promise<boolean>;
  onSaveAgent?: (agentData: any, isEdit?: boolean) => Promise<boolean>;
}

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

export const AgentListBasic: React.FC<AgentListBasicProps> = ({ 
  onEditAgent, 
  onCreateAgent, 
  onDeleteAgent, 
  onSaveAgent 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const { mode, user } = useAuthStore();
  const { filteredAgents, isLoading, error, loadAgents, setFilters } = useAgentStore();
  const { getReviewStats, addReview, loadReviews } = useReviewStore();

  // Fonction pour gérer l'expansion des descriptions
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

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    loadAgents();
    loadReviews();
  }, [loadAgents, loadReviews]);

  useEffect(() => {
    setFilters({ search: searchQuery });
  }, [searchQuery, setFilters]);

  const handleDeleteAgent = async (agent: any) => {
    if (window.confirm(`Supprimer l'agent ${agent.name} ?`)) {
      if (onDeleteAgent) {
        await onDeleteAgent(agent.id);
      }
    }
  };

  const handleReviewAgent = (agent: any) => {
    setSelectedAgent(agent);
    setNewReviewRating(5);
    setNewReviewComment('');
    setShowReviewModal(true);
  };

  const handleViewAllReviews = (agent: any) => {
    setSelectedAgent(agent);
    setShowReviewsModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedAgent || !user) return;

    const success = await addReview({
      agentId: selectedAgent.id,
      rating: newReviewRating,
      comment: newReviewComment
    }, user.id || user.email, user.email);

    if (success) {
      // Force la sauvegarde des avis aussi
      localStorage.setItem('oxo-reviews-backup', JSON.stringify({
        timestamp: new Date().toISOString(),
        reviewCount: getReviewStats(selectedAgent.id).totalReviews + 1
      }));
      
      setShowReviewModal(false);
      setSelectedAgent(null);
      setNewReviewComment('');
      setNewReviewRating(5);
      
      console.log('✅ Avis ajouté et sauvegardé');
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onStarClick?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${
            interactive ? 'cursor-pointer hover:text-yellow-400' : ''
          }`}
          onClick={() => interactive && onStarClick?.(i)}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-medium">Chargement des agents...</div>
        <div className="mt-2 text-sm text-gray-600">Recherche des agents vérifiés</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white">
        <div className="text-red-600 font-medium mb-4">Erreur: {error}</div>
        <button 
          onClick={loadAgents}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen">
      {/* En-tête ultra-moderne */}
      <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-8 relative overflow-hidden border border-orange-200 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200 to-transparent rounded-bl-full opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200 to-transparent rounded-tr-full opacity-30"></div>
        <motion.h1 
          className="text-4xl font-black text-gray-900 mb-3 relative z-10 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎆 Base d'Agents Vérifiés
        </motion.h1>
        <motion.p 
          className="text-gray-700 mb-6 text-lg relative z-10 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Découvrez notre réseau d'agents professionnels de confiance
        </motion.p>

        {/* Recherche */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom d'agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white shadow-lg text-gray-900 placeholder-gray-500 text-lg font-medium transition-all duration-300 hover:shadow-xl"
            />
          </div>
          
          {mode === 'admin' && (
            <motion.button
              onClick={onCreateAgent}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-2xl hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-500 shadow-xl flex items-center font-bold text-lg relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
              <Plus className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">Nouvel Agent</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Résumé moderne */}
      <motion.div 
        className="flex items-center justify-between text-sm text-gray-600 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="font-bold text-lg text-gray-800">
          👥 {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} disponible{filteredAgents.length > 1 ? 's' : ''}
        </span>
        <span className="text-green-600 font-medium">✨ Tous vérifiés</span>
      </motion.div>

      {/* Grille des agents */}
      {filteredAgents.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-400 text-lg mb-2">Aucun agent trouvé</div>
          <p className="text-gray-500 mb-6">
            Essayez de modifier votre recherche ou ajoutez un nouvel agent.
          </p>
          {mode === 'admin' && (
            <button 
              onClick={onCreateAgent}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Ajouter un agent
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAgents.map((agent, index) => {
              const stats = getReviewStats(agent.id);
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group backdrop-blur-sm"
                  whileHover={{ 
                    y: -8, 
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.15)"
                  }}
                >
                  {/* Effet subtil au hover */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Statut badge */}
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className="w-18 h-18 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/30">
                        <span className="relative z-10 transition-transform duration-300 hover:scale-110">{agent.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-xl tracking-tight">{agent.name}</h3>
                          <motion.span
                            className="text-green-500 text-lg"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            ✓
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 shadow-sm">
                      ✅ Actif
                    </span>
                  </div>

                  {/* Plateformes et catégorie */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${platformColors[agent.platform]} shadow-sm`}>
                      {platformIcons[agent.platform]} {agent.platform}
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800 shadow-sm">
                      {categoryLabels[agent.category]}
                    </span>
                    {agent.location && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-800 shadow-sm">
                        📍 {agent.location}
                      </span>
                    )}
                  </div>

                  {/* Avis et note - Section ultra-moderne */}
                  <div className="mb-4 p-5 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl border border-orange-200 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-200 to-transparent rounded-bl-full opacity-30"></div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(Math.round(stats.averageRating))}
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                          {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '-'}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => handleViewAllReviews(agent)}
                        className="flex items-center space-x-1 text-sm text-orange-700 hover:text-orange-800 font-bold bg-white px-3 py-1.5 rounded-full shadow-sm"
                        whileHover={{ scale: 1.08, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{stats.totalReviews} avis</span>
                      </motion.button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleViewAllReviews(agent)}
                        className="flex-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-3 rounded-xl hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-500 text-sm font-bold shadow-lg relative overflow-hidden"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                        <span className="relative z-10">💬 Voir Avis ({stats.totalReviews})</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {agent.phoneNumber && (
                        <motion.a
                          href={`tel:${agent.phoneNumber}`}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Appeler"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Phone className="w-4 h-4" />
                        </motion.a>
                      )}
                      <motion.button
                        className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Contacter"
                        whileHover={{ scale: 1.1 }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {mode === 'admin' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditAgent?.(agent)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description/Notes publiques */}
                  {(agent.description || agent.notes) && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 relative">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 mt-0.5 text-lg">
                          ℹ️
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-blue-800 mb-2">À propos</h4>
                          <div className="text-sm text-blue-700 leading-relaxed">
                            {(() => {
                              const description = (agent.description || agent.notes || 'Aucune description disponible').trim();
                              const isExpanded = expandedDescriptions.has(agent.id);
                              const shouldTruncate = description.length > 120;
                              
                              if (!shouldTruncate) {
                                return <p className="whitespace-pre-wrap break-words">{description}</p>;
                              }
                              
                              return (
                                <div>
                                  <p className={`whitespace-pre-wrap break-words ${!isExpanded ? 'mb-3' : ''}`}>
                                    {isExpanded ? description : truncateText(description, 120)}
                                  </p>
                                  <motion.button
                                    onClick={() => toggleDescription(agent.id)}
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold text-xs bg-white px-2 py-1 rounded-full border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                    whileHover={{ scale: 1.05, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span className="mr-1">▲</span>
                                        <span>Voir moins</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="mr-1">▼</span>
                                        <span>Voir plus</span>
                                      </>
                                    )}
                                  </motion.button>
                                </div>
                              );
                            })()} 
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spécialités */}
                  {agent.specialties && agent.specialties.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">🎯 Spécialités</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                          <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                            {specialty}
                          </span>
                        ))}
                        {agent.specialties.length > 3 && (
                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            +{agent.specialties.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Langues parlées */}
                  {agent.languages && agent.languages.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">🌍 Langues</h4>
                      <div className="flex flex-wrap gap-1">
                        {agent.languages.map((language: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal d'ajout d'avis */}
      <AnimatePresence>
        {showReviewModal && selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Avis pour {selectedAgent.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <div className="flex items-center space-x-1">
                      {renderStars(newReviewRating, true, setNewReviewRating)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire
                    </label>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Partagez votre expérience..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSubmitReview}
                      className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                    >
                      Publier l'avis
                    </button>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal pour voir tous les avis */}
      <ReviewsModal
        isOpen={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        agent={selectedAgent}
      />
    </div>
  );
};