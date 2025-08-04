// 🎯 NOUVELLE LISTE D'AGENTS - DESIGN ORIGINAL SANS BUGS !
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Phone, Mail, Globe, User, Star, MapPin, Clock, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useNewAgentStore } from '@/stores/newAgentStore';
import { useAuthStore } from '@/stores/authStore';
// Type SimpleAgentData défini dans le store

export const NewAgentList: React.FC = () => {
  const { agents, isLoading, error, loadAgents, addAgent, updateAgent, deleteAgent, clearError } = useNewAgentStore();
  const { mode } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Platform filter removed
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // 🔍 FILTRAGE DES AGENTS (recherche uniquement)
  const filteredAgents = agents.filter(agent => {
    const matchSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // 📝 FORMULAIRE D'AGENT AVEC DESIGN ORIGINAL
  const AgentForm = () => {
    const [formData, setFormData] = useState({
      name: editingAgent?.name || '',
      phoneNumber: editingAgent?.phoneNumber || '',
      email: editingAgent?.email || '',
      websiteUrl: editingAgent?.websiteUrl || '',
      category: editingAgent?.category || 'business',
      about: editingAgent?.about || '',
      notes: editingAgent?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name) {
        alert('Nom requis !');
        return;
      }

      let success = false;
      const agentData = {
        ...formData,
        identifier: formData.name.toLowerCase().replace(/\s+/g, '') // Generate identifier from name
      };
      
      if (editingAgent) {
        success = updateAgent(editingAgent.id, agentData);
      } else {
        success = addAgent(agentData);
      }

      if (success) {
        setShowForm(false);
        setEditingAgent(null);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-orange-200/30"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {editingAgent ? (
              <>
                <Edit className="w-6 h-6 text-orange-500" />
                Modifier l'agent
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-orange-500" />
                Nouvel agent
              </>
            )}
          </h3>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingAgent(null);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="jean@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Site web
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="https://example.com"
              />
            </div>
            
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              À propos
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="w-full h-24 px-4 py-3 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
              placeholder="Description de l'agent, ses spécialités..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes internes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full h-24 px-4 py-3 border-2 border-gray-200/60 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
              placeholder="Notes privées visibles uniquement par les admins..."
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-300/50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {editingAgent ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingAgent ? 'Modifier l\'agent' : 'Créer l\'agent'}
            </motion.button>
            
            <motion.button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAgent(null);
              }}
              className="px-6 h-12 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Annuler
            </motion.button>
          </div>
        </form>
      </motion.div>
    );
  };

  // 🗑️ SUPPRIMER AGENT
  const handleDelete = (agent: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${agent.name} ?`)) {
      deleteAgent(agent.id);
    }
  };

  // 👁️ TOGGLE DESCRIPTION
  const toggleDescription = (agentId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  // 🎨 ICONE PLATEFORME
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return '💬';
      case 'telegram': return '✈️';
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'linkedin': return '💼';
      case 'instagram': return '📸';
      default: return '🌐';
    }
  };

  // 🎨 COULEUR PLATEFORME
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-100 text-green-800 border-green-200';
      case 'telegram': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'email': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'phone': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'linkedin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'instagram': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  return (
    <div className="space-y-8">
      {/* STATISTIQUES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center gap-8 text-lg"
      >
        <motion.div 
          className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl backdrop-blur-sm border border-orange-300/30"
          whileHover={{ scale: 1.05 }}
        >
          <span className="font-bold text-orange-700">{agents.length}</span>
          <span className="text-orange-600 ml-1">agents total</span>
        </motion.div>
        <motion.div 
          className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-purple-300/30"
          whileHover={{ scale: 1.05 }}
        >
          <span className="font-bold text-purple-700">{filteredAgents.length}</span>
          <span className="text-purple-600 ml-1">affichés</span>
        </motion.div>
      </motion.div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white/70 via-orange-50/50 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40 relative overflow-hidden"
      >
        {/* Effet de brillance animé */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-800" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 border-2 border-orange-200/40 rounded-2xl focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 bg-white/60 backdrop-blur-sm text-gray-900 placeholder-orange-400/70 transition-all duration-300 shadow-inner"
            />
          </div>
          
          {mode === 'admin' && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="h-14 px-8 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-red-600 shadow-xl hover:shadow-orange-400/60 transition-all duration-300 font-bold flex items-center gap-3 whitespace-nowrap backdrop-blur-sm border border-orange-300/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Nouvel agent
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* MESSAGE D'ERREUR */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200/60 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING SPINNER */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Chargement des agents...</span>
          </div>
        </motion.div>
      )}

      {/* FORMULAIRE */}
      <AnimatePresence>
        {showForm && <AgentForm />}
      </AnimatePresence>

      {/* LISTE DES AGENTS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-8"
      >
        <AnimatePresence>
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-white/70 via-orange-50/30 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 hover:shadow-orange-200/50 hover:from-white/80 hover:to-orange-50/40 transition-all duration-500 overflow-hidden relative group"
            >
              {/* Effet de brillance au hover */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
              />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl hover:shadow-orange-300/60 transition-all duration-300 relative overflow-hidden"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {/* Effet de brillance sur l'avatar */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <span className="relative z-10">{agent.name.charAt(0).toUpperCase()}</span>
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{agent.name}</h3>
                    </div>
                  </div>

                  {/* INFORMATIONS DE CONTACT */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    {agent.phoneNumber && (
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-100/60 to-blue-200/40 rounded-xl border border-blue-200/30 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-medium text-sm">{agent.phoneNumber}</span>
                      </motion.div>
                    )}
                    {agent.email && (
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100/60 to-green-200/40 rounded-xl border border-green-200/30 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium text-sm">{agent.email}</span>
                      </motion.div>
                    )}
                    {agent.websiteUrl && (
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-100/60 to-purple-200/40 rounded-xl border border-purple-200/30 backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Globe className="w-4 h-4 text-purple-600" />
                        <a 
                          href={agent.websiteUrl.startsWith('http') ? agent.websiteUrl : `https://${agent.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 hover:text-purple-800 font-medium text-sm break-all"
                        >
                          {agent.websiteUrl}
                        </a>
                      </motion.div>
                    )}
                  </div>


                  {/* DESCRIPTION */}
                  {agent.about && (
                    <div className="mb-4">
                      <div className={`text-gray-700 break-words ${expandedDescriptions[agent.id] ? '' : 'line-clamp-3'}`}>
                        {agent.about}
                      </div>
                      {agent.about.length > 150 && (
                        <button
                          onClick={() => toggleDescription(agent.id)}
                          className="text-orange-500 hover:text-orange-600 text-sm mt-1 flex items-center gap-1"
                        >
                          {expandedDescriptions[agent.id] ? (
                            <>
                              Voir moins <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              Voir plus <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* DATE */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Ajouté le {new Date(agent.created).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                {/* ACTIONS - ADMIN SEULEMENT */}
                {mode === 'admin' && (
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={() => {
                        setEditingAgent(agent);
                        setShowForm(true);
                      }}
                      className="w-10 h-10 bg-orange-100/80 text-orange-600 rounded-xl hover:bg-orange-200/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDelete(agent)}
                      className="w-10 h-10 bg-red-100/80 text-red-600 rounded-xl hover:bg-red-200/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center shadow-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* MESSAGE AUCUN AGENT */}
      {filteredAgents.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Aucun agent trouvé' : 'Aucun agent'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Essayez de modifier vos critères de recherche'
              : mode === 'admin' 
                ? 'Commencez par ajouter votre premier agent'
                : 'Aucun agent disponible pour le moment'
            }
          </p>
          {!searchQuery && mode === 'admin' && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-orange-300/50 transition-all duration-300 font-semibold flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Ajouter mon premier agent
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
};