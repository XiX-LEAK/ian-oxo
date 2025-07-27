// 🎯 NOUVELLE LISTE D'AGENTS - DESIGN ORIGINAL SANS BUGS !
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Edit, Trash2, Phone, Mail, Globe, User, Star, MapPin, Clock, Shield, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useNewAgentStore } from '@/stores/newAgentStore';
import { type SimpleAgentData } from '@/services/newAgentService';

export const NewAgentList: React.FC = () => {
  const { agents, isLoading, error, loadAgents, addAgent, updateAgent, deleteAgent, clearError } = useNewAgentStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SimpleAgentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // 🔍 FILTRAGE DES AGENTS
  const filteredAgents = agents.filter(agent => {
    const matchSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       agent.identifier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlatform = selectedPlatform === 'all' || agent.platform === selectedPlatform;
    return matchSearch && matchPlatform;
  });

  // 📝 FORMULAIRE D'AGENT AVEC DESIGN ORIGINAL
  const AgentForm = () => {
    const [formData, setFormData] = useState({
      name: editingAgent?.name || '',
      identifier: editingAgent?.identifier || '',
      phoneNumber: editingAgent?.phoneNumber || '',
      email: editingAgent?.email || '',
      websiteUrl: editingAgent?.websiteUrl || '',
      platform: editingAgent?.platform || 'whatsapp',
      category: editingAgent?.category || 'business',
      about: editingAgent?.about || '',
      notes: editingAgent?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.name || !formData.identifier) {
        alert('Nom et identifiant requis !');
        return;
      }

      let success = false;
      if (editingAgent) {
        success = updateAgent(editingAgent.id, formData);
      } else {
        success = addAgent(formData);
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
        className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100"
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
                <Plus className="w-6 h-6 text-blue-500" />
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant unique *
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="Ex: @jeandupont ou +33123456789"
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
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
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
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
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
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plateforme
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
                <option value="phone">Téléphone</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              À propos
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
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
              className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none"
              placeholder="Notes privées visibles uniquement par les admins..."
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
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
  const handleDelete = (agent: SimpleAgentData) => {
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
      {/* HEADER AVEC STATISTIQUES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 Agents Disponibles
        </h2>
        <div className="flex justify-center gap-8 text-lg">
          <div className="text-blue-600">
            <span className="font-bold">{agents.length}</span> agents total
          </div>
          <div className="text-green-600">
            <span className="font-bold">{filteredAgents.length}</span> affichés
          </div>
        </div>
      </motion.div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="h-12 pl-12 pr-8 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 bg-white text-gray-900 transition-all duration-300"
            >
              <option value="all">Toutes les plateformes</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="email">Email</option>
              <option value="phone">Téléphone</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          
          <motion.button
            onClick={() => setShowForm(true)}
            className="h-12 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center gap-2 whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Nouvel agent
          </motion.button>
        </div>
      </motion.div>

      {/* MESSAGE D'ERREUR */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center justify-between"
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
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
        className="grid gap-6"
      >
        <AnimatePresence>
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                      <p className="text-gray-600">@{agent.identifier}</p>
                    </div>
                  </div>

                  {/* INFORMATIONS DE CONTACT */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {agent.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{agent.phoneNumber}</span>
                      </div>
                    )}
                    {agent.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{agent.email}</span>
                      </div>
                    )}
                    {agent.websiteUrl && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>Site web</span>
                      </div>
                    )}
                  </div>

                  {/* BADGES */}
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getPlatformColor(agent.platform)}`}>
                      <span>{getPlatformIcon(agent.platform)}</span>
                      {agent.platform}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                      {agent.category}
                    </span>
                  </div>

                  {/* DESCRIPTION */}
                  {agent.about && (
                    <div className="mb-4">
                      <div className={`text-gray-700 ${expandedDescriptions[agent.id] ? '' : 'line-clamp-2'}`}>
                        {agent.about}
                      </div>
                      {agent.about.length > 100 && (
                        <button
                          onClick={() => toggleDescription(agent.id)}
                          className="text-blue-500 hover:text-blue-600 text-sm mt-1 flex items-center gap-1"
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

                {/* ACTIONS */}
                <div className="flex gap-2 ml-4">
                  <motion.button
                    onClick={() => {
                      setEditingAgent(agent);
                      setShowForm(true);
                    }}
                    className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDelete(agent)}
                    className="w-10 h-10 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
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
            {searchQuery || selectedPlatform !== 'all' ? 'Aucun agent trouvé' : 'Aucun agent'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedPlatform !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre premier agent'
            }
          </p>
          {(!searchQuery && selectedPlatform === 'all') && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold flex items-center gap-2 mx-auto"
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