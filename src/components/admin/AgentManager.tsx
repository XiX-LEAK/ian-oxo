// 🏢 GESTIONNAIRE D'AGENTS ADMIN - INTERFACE ULTRA MODERNE
// Tout est facultatif, design responsive, logs automatiques

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Edit3, Trash2, Search, Filter, Eye, EyeOff,
  Globe, Phone, Mail, MessageSquare, Tag, Languages, 
  FileText, Save, X, Check, AlertCircle, RefreshCw,
  Settings, History, TrendingUp, Zap, Star
} from 'lucide-react';

import AgentManagementService, {
  type Agent,
  type Platform,
  type Category,
  type Language,
  type ActionLog
} from '@/services/agentManagementService';

import { useAuthStore } from '@/stores/authStore';

// ===================================================================
// INTERFACES
// ===================================================================

interface AgentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ===================================================================
// COMPOSANT PRINCIPAL
// ===================================================================

export const AgentManager: React.FC<AgentManagerProps> = ({
  isOpen,
  onClose
}) => {
  // États principaux
  const [activeTab, setActiveTab] = useState<'agents' | 'references' | 'logs'>('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  
  // États de l'interface
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // États du formulaire agent
  const [formData, setFormData] = useState<Agent>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  // États pour les nouvelles références
  const [newPlatform, setNewPlatform] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageCode, setNewLanguageCode] = useState('');
  
  // Store auth
  const { user } = useAuthStore();

  // ===================================================================
  // EFFETS
  // ===================================================================

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  // ===================================================================
  // CHARGEMENT DES DONNÉES
  // ===================================================================

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [agentsData, platformsData, categoriesData, languagesData, logsData] = await Promise.all([
        AgentManagementService.getAllAgentsAdmin(),
        AgentManagementService.getAllPlatforms(),
        AgentManagementService.getAllCategories(),
        AgentManagementService.getAllLanguages(),
        AgentManagementService.getActionLogs(30)
      ]);

      setAgents(agentsData);
      setPlatforms(platformsData);
      setCategories(categoriesData);
      setLanguages(languagesData);
      setLogs(logsData);
    } catch (error) {
      showMessage('Erreur lors du chargement des données', 'error');
    }
    setIsLoading(false);
  };

  // ===================================================================
  // GESTION DES AGENTS
  // ===================================================================

  const openAgentModal = (agent?: Agent) => {
    if (agent) {
      setSelectedAgent(agent);
      setFormData(agent);
      setSelectedPlatforms(agent.platforms || []);
      setSelectedCategories(agent.categories || []);
      setSelectedLanguages(agent.languages || []);
    } else {
      setSelectedAgent(null);
      setFormData({});
      setSelectedPlatforms([]);
      setSelectedCategories([]);
      setSelectedLanguages([]);
    }
    setShowAgentModal(true);
  };

  const closeAgentModal = () => {
    setShowAgentModal(false);
    setSelectedAgent(null);
    setFormData({});
    setSelectedPlatforms([]);
    setSelectedCategories([]);
    setSelectedLanguages([]);
  };

  const handleSaveAgent = async () => {
    setIsLoading(true);
    
    const agentData: Agent = {
      ...formData,
      platforms: selectedPlatforms,
      categories: selectedCategories,
      languages: selectedLanguages
    };

    let result;
    if (selectedAgent?.id) {
      // Mise à jour
      result = await AgentManagementService.updateAgent(
        selectedAgent.id,
        agentData,
        user?.id,
        user?.email
      );
    } else {
      // Création
      result = await AgentManagementService.createAgent(
        agentData,
        user?.id,
        user?.email
      );
    }

    if (result) {
      showMessage(
        selectedAgent?.id ? 'Agent mis à jour avec succès' : 'Agent créé avec succès',
        'success'
      );
      closeAgentModal();
      loadAllData();
    } else {
      showMessage('Erreur lors de la sauvegarde', 'error');
    }
    
    setIsLoading(false);
  };

  const handleDeleteAgent = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;
    
    setIsLoading(true);
    const success = await AgentManagementService.deleteAgent(id, user?.id, user?.email);
    
    if (success) {
      showMessage('Agent supprimé avec succès', 'success');
      loadAllData();
    } else {
      showMessage('Erreur lors de la suppression', 'error');
    }
    
    setIsLoading(false);
  };

  // ===================================================================
  // GESTION DES RÉFÉRENCES
  // ===================================================================

  const handleAddPlatform = async () => {
    if (!newPlatform.trim()) return;
    
    const result = await AgentManagementService.addPlatform(newPlatform, user?.id, user?.email);
    if (result) {
      setPlatforms([...platforms, result]);
      setNewPlatform('');
      showMessage('Plateforme ajoutée', 'success');
    } else {
      showMessage('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleDeletePlatform = async (id: string) => {
    if (!window.confirm('Supprimer cette plateforme ?')) return;
    
    const success = await AgentManagementService.deletePlatform(id, user?.id, user?.email);
    if (success) {
      setPlatforms(platforms.filter(p => p.id !== id));
      showMessage('Plateforme supprimée', 'success');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    const result = await AgentManagementService.addCategory(newCategory, user?.id, user?.email);
    if (result) {
      setCategories([...categories, result]);
      setNewCategory('');
      showMessage('Catégorie ajoutée', 'success');
    } else {
      showMessage('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    
    const success = await AgentManagementService.deleteCategory(id, user?.id, user?.email);
    if (success) {
      setCategories(categories.filter(c => c.id !== id));
      showMessage('Catégorie supprimée', 'success');
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    
    const result = await AgentManagementService.addLanguage(
      newLanguage, 
      newLanguageCode, 
      user?.id, 
      user?.email
    );
    if (result) {
      setLanguages([...languages, result]);
      setNewLanguage('');
      setNewLanguageCode('');
      showMessage('Langue ajoutée', 'success');
    } else {
      showMessage('Erreur lors de l\'ajout', 'error');
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    if (!window.confirm('Supprimer cette langue ?')) return;
    
    const success = await AgentManagementService.deleteLanguage(id, user?.id, user?.email);
    if (success) {
      setLanguages(languages.filter(l => l.id !== id));
      showMessage('Langue supprimée', 'success');
    }
  };

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredAgents = agents.filter(agent =>
    agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.about_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===================================================================
  // RENDU DES COMPOSANTS
  // ===================================================================

  const renderAgentCard = (agent: Agent) => (
    <motion.div
      key={agent.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {agent.full_name || 'Agent sans nom'}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            {agent.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{agent.email}</span>
              </div>
            )}
            {agent.phone_number && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{agent.phone_number}</span>
              </div>
            )}
            {agent.website_url && (
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>Site web</span>
              </div>
            )}
          </div>

          {/* Statut */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              agent.status === 'active' ? 'text-green-700' : 'text-gray-500'
            }`}>
              {agent.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => openAgentModal(agent)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => handleDeleteAgent(agent.id!)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Description */}
      {agent.about_description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {agent.about_description}
        </p>
      )}

      {/* Tags */}
      <div className="space-y-2">
        {/* Plateformes */}
        {agent.platforms && agent.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.platforms.map((platform, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
              >
                {platform}
              </span>
            ))}
          </div>
        )}

        {/* Catégories */}
        {agent.categories && agent.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Langues */}
        {agent.languages && agent.languages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.languages.map((language, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg font-medium"
              >
                {language}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes internes */}
      {agent.internal_notes && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Notes internes</span>
          </div>
          <p className="text-yellow-700 text-xs line-clamp-2">
            {agent.internal_notes}
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderAgentModal = () => (
    <AnimatePresence>
      {showAgentModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeAgentModal}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedAgent?.id ? 'Modifier l\'agent' : 'Nouvel agent'}
                      </h2>
                      <p className="text-blue-100 text-sm">
                        Tous les champs sont facultatifs
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={closeAgentModal}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Colonne 1 - Informations de base */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Informations de base
                    </h3>
                    
                    {/* Nom complet */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Ex: Sophie Martin"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Ex: agent@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de téléphone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number || ''}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="Ex: +33123456789"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Site web */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site web
                      </label>
                      <input
                        type="url"
                        value={formData.website_url || ''}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        placeholder="Ex: https://example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Statut */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
                      >
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>

                  {/* Colonne 2 - Associations et descriptions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Associations et descriptions
                    </h3>

                    {/* Plateformes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plateformes
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {platforms.map(platform => (
                            <label
                              key={platform.id}
                              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPlatforms.includes(platform.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPlatforms([...selectedPlatforms, platform.name]);
                                  } else {
                                    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.name));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm">{platform.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Catégories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégories
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {categories.map(category => (
                            <label
                              key={category.id}
                              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, category.name]);
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(c => c !== category.name));
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Langues */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langues parlées
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {languages.map(language => (
                            <label
                              key={language.id}
                              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLanguages.includes(language.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLanguages([...selectedLanguages, language.name]);
                                  } else {
                                    setSelectedLanguages(selectedLanguages.filter(l => l !== language.name));
                                  }
                                }}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <span className="text-sm">{language.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descriptions (pleine largeur) */}
                <div className="mt-6 space-y-4">
                  {/* À propos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      À propos
                    </label>
                    <textarea
                      value={formData.about_description || ''}
                      onChange={(e) => setFormData({ ...formData, about_description: e.target.value })}
                      placeholder="Description de l'agent, ses spécialités..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {/* Notes internes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes internes
                      <span className="text-xs text-gray-500 ml-2">(Visible uniquement par les admins)</span>
                    </label>
                    <textarea
                      value={formData.internal_notes || ''}
                      onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                      placeholder="Notes internes sur l'agent..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end space-x-3">
                <motion.button
                  onClick={closeAgentModal}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                
                <motion.button
                  onClick={handleSaveAgent}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{selectedAgent?.id ? 'Mettre à jour' : 'Créer'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderAgentsTab = () => (
    <div className="space-y-6">
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un agent..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all"
            />
          </div>
          
          <span className="text-sm text-gray-500">
            {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Bouton nouveau */}
        <motion.button
          onClick={() => openAgentModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel agent</span>
        </motion.button>
      </div>

      {/* Grille des agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map(agent => renderAgentCard(agent))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {searchQuery ? 'Aucun agent trouvé' : 'Aucun agent'}
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Essayez de modifier votre recherche' 
              : 'Commencez par créer votre premier agent'
            }
          </p>
        </div>
      )}
    </div>
  );

  const renderReferencesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Plateformes */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Plateformes ({platforms.length})
        </h3>
        
        <div className="space-y-3 mb-4">
          {platforms.map(platform => (
            <div key={platform.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
              <span className="text-sm font-medium">{platform.name}</span>
              <button
                onClick={() => handleDeletePlatform(platform.id)}
                className="p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            placeholder="Nouvelle plateforme"
            className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleAddPlatform()}
          />
          <button
            onClick={handleAddPlatform}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Catégories */}
      <div className="bg-purple-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Catégories ({categories.length})
        </h3>
        
        <div className="space-y-3 mb-4">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
              <span className="text-sm font-medium">{category.name}</span>
              <button
                onClick={() => handleDeleteCategory(category.id)}
                className="p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nouvelle catégorie"
            className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Langues */}
      <div className="bg-green-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <Languages className="w-5 h-5 mr-2" />
          Langues ({languages.length})
        </h3>
        
        <div className="space-y-3 mb-4">
          {languages.map(language => (
            <div key={language.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
              <div>
                <span className="text-sm font-medium">{language.name}</span>
                {language.code && (
                  <span className="text-xs text-gray-500 ml-2">({language.code})</span>
                )}
              </div>
              <button
                onClick={() => handleDeleteLanguage(language.id)}
                className="p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Nouvelle langue"
            className="w-full px-3 py-2 text-sm border border-green-200 rounded-lg"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              value={newLanguageCode}
              onChange={(e) => setNewLanguageCode(e.target.value)}
              placeholder="Code (ex: fr)"
              className="flex-1 px-3 py-2 text-sm border border-green-200 rounded-lg"
            />
            <button
              onClick={handleAddLanguage}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Historique des actions ({logs.length})
        </h3>
        <button
          onClick={loadAllData}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="space-y-3">
        {logs.map(log => (
          <div key={log.id} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  log.action_type === 'CREATE' ? 'bg-green-500' :
                  log.action_type === 'UPDATE' ? 'bg-blue-500' :
                  'bg-red-500'
                }`} />
                <span className="font-medium text-gray-800">
                  {log.action_type} - {log.table_name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleString('fr-FR')}
              </span>
            </div>
            
            {log.admin_email && (
              <p className="text-sm text-gray-600">
                Par: {log.admin_email}
              </p>
            )}
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun log disponible</p>
        </div>
      )}
    </div>
  );

  // ===================================================================
  // RENDU PRINCIPAL
  // ===================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-t-2xl px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Gestion des Agents
                      </h1>
                      <p className="text-blue-100">
                        Interface complète de gestion avec logs automatiques
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  {[
                    { id: 'agents', label: 'Agents', icon: Users, count: agents.length },
                    { id: 'references', label: 'Références', icon: Settings, count: platforms.length + categories.length + languages.length },
                    { id: 'logs', label: 'Historique', icon: History, count: logs.length }
                  ].map(({ id, label, icon: Icon, count }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                {/* Messages */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-xl border-2 flex items-center space-x-3 ${
                      message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </motion.div>
                )}

                {/* Loading */}
                {isLoading && (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                  </div>
                )}

                {/* Tab Content */}
                {!isLoading && (
                  <>
                    {activeTab === 'agents' && renderAgentsTab()}
                    {activeTab === 'references' && renderReferencesTab()}
                    {activeTab === 'logs' && renderLogsTab()}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Agent Modal */}
          {renderAgentModal()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentManager;