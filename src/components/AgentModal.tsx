import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Tag, Globe2, Mail, Trash2, Edit3 } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { CustomCategoriesService, CustomPlatformsService } from '@/services/customOptionsService';
import type { Agent, Platform, AgentCategory, CreateAgentRequest, UpdateAgentRequest } from '@/types/agent';
import type { CustomCategory, CustomPlatform } from '@/services/customOptionsService';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent | null; // Si agent existe, c'est une modification, sinon création
  onSave?: (agentData: any, isEdit?: boolean) => Promise<boolean>;
}

// Pas de données par défaut - tout vient de Supabase

const languageOptions = [
  'Français', 'English', 'Español', 'Português', 'Italiano', 'Deutsch',
  '中文', '日本語', '한국어', 'العربية', 'Русский', 'हिन्दी', 'Türkçe'
];

export const AgentModal: React.FC<AgentModalProps> = ({ isOpen, onClose, agent, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    notes: '',
    about: '',
    languages: [] as string[],
    email: '',
    websiteUrl: ''
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addAgent, updateAgent, isLoading, error } = useAgentStore();

  const isEditing = !!agent;


  // Pré-remplir le formulaire si on édite un agent
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        phoneNumber: agent.phoneNumber || '',
        notes: agent.notes || '',
        about: agent.about || '',
        languages: [...(agent.languages || [])],
        email: agent.contactInfo?.email || '',
        websiteUrl: agent.contactInfo?.websiteUrl || ''
      });
    } else {
      // Réinitialiser pour nouveau agent
      setFormData({
        name: '',
        phoneNumber: '',
        notes: '',
        about: '',
        languages: [],
        email: '',
        websiteUrl: ''
      });
    }
    setErrors({});
  }, [agent, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Tous les champs sont maintenant facultatifs
    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Format de numéro invalide';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && agent) {
        // Modification
        const updateData: UpdateAgentRequest = {
          id: agent.id,
          name: formData.name || 'Agent sans nom',
          identifier: formData.name || 'Agent sans nom',
          phoneNumber: formData.phoneNumber || undefined,
          platform: 'whatsapp',
          notes: formData.notes || undefined,
          about: formData.about || undefined,
          languages: formData.languages,
          contactInfo: {
            email: formData.email || undefined,
            websiteUrl: formData.websiteUrl || undefined
          }
        };

        if (onSave) {
          const success = await onSave(updateData, true);
          if (success) {
            onClose();
          }
        } else {
          const success = await updateAgent(updateData);
          if (success) {
            onClose();
          }
        }
      } else {
        // Création
        const createData: CreateAgentRequest = {
          name: formData.name || 'Agent sans nom',
          identifier: formData.name || 'Agent sans nom',
          phoneNumber: formData.phoneNumber || undefined,
          platform: 'whatsapp',
          notes: formData.notes || undefined,
          about: formData.about || undefined,
          languages: formData.languages,
          contactInfo: {
            email: formData.email || undefined,
            websiteUrl: formData.websiteUrl || undefined
          }
        };

        if (onSave) {
          const success = await onSave(createData, false);
          if (success) {
            onClose();
          }
        } else {
          const success = await addAgent(createData);
          if (success) {
            onClose();
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isEditing ? 'Modifier l\'agent' : 'Nouvel agent'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {isEditing ? 'Modifiez les informations de l\'agent' : 'Ajoutez un nouvel agent à la base de données'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Informations de base */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`input-modern ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ex: Sophie Martin (facultatif)"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                {/* Langues */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langues parlées
                  </label>
                  <div className="flex gap-2 mb-3">
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="input-modern flex-1"
                    >
                      <option value="">Sélectionner une langue</option>
                      {languageOptions.filter(lang => !formData.languages.includes(lang)).map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="btn-secondary"
                      disabled={!newLanguage}
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map(language => (
                      <span
                        key={language}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(language)}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>


                {/* À propos - Description des services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📄 À propos & Services
                  </label>
                  <div className="space-y-2">
                    <textarea
                      value={formData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      className="input-modern min-h-[120px] resize-y"
                      rows={6}
                      placeholder="Décrivez en détail les services proposés par cet agent : produits vendus, spécialités, méthodes de travail, zones géographiques, types de clients, etc.

Exemple : 
- Spécialisé dans la mode féminine haut de gamme
- Dropshipping depuis la Chine avec délais rapides  
- Service clientèle 24h/7j en français et anglais
- Expertise en cosmétiques coréens authentiques..."
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>💡 Plus vous détaillez, plus la recherche sera précise</span>
                      <span>{formData.about.length} caractères</span>
                    </div>
                  </div>
                </div>

                {/* Informations de contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className={`input-modern ${errors.phoneNumber ? 'border-red-500' : ''}`}
                      placeholder="+33 6 12 34 56 78 (facultatif)"
                    />
                    {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`input-modern ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="contact@exemple.com (facultatif)"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe2 className="w-4 h-4 inline mr-1" />
                      Site web
                    </label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="input-modern"
                      placeholder="https://monsite.com (facultatif)"
                    />
                  </div>
                </div>

                {/* Notes internes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔒 Notes internes (privées)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="input-modern"
                    rows={3}
                    placeholder="Notes privées visibles seulement par vous... (facultatif)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ces notes restent confidentielles et ne sont jamais synchronisées
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="loading-spinner w-4 h-4"></div>
                      <span>Sauvegarde...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Modifier' : 'Créer'}</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};