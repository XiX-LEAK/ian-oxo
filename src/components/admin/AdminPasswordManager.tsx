// 🔐 COMPOSANT ADMIN DE GESTION DES MOTS DE PASSE
// Interface complète de gestion des mots de passe avec historique et sécurité

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle, 
  History, RefreshCw, Key, Copy, Download, Trash2,
  TrendingUp, Calendar, User, Globe, Settings, X
} from 'lucide-react';

import AdminPasswordService, { 
  type PasswordChangeRequest, 
  type PasswordChangeLog,
  type SecurityEvent,
  type PasswordValidationResult
} from '@/services/adminPasswordService';

import { useAuthStore } from '@/stores/authStore';

// ===================================================================
// INTERFACES
// ===================================================================

interface AdminPasswordManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ===================================================================
// COMPOSANT PRINCIPAL
// ===================================================================

export const AdminPasswordManager: React.FC<AdminPasswordManagerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  // États principaux
  const [activeTab, setActiveTab] = useState<'change' | 'history' | 'security'>('change');
  const [passwordType, setPasswordType] = useState<'site' | 'admin'>('site');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // États du formulaire
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  
  // États des données
  const [passwordHistory, setPasswordHistory] = useState<PasswordChangeLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<boolean | null>(null);
  
  // Store d'authentification
  const { user } = useAuthStore();
  
  // ===================================================================
  // EFFETS
  // ===================================================================
  
  // Charger les données au montage
  useEffect(() => {
    if (isOpen) {
      loadData();
      checkSupabaseStatus();
    }
  }, [isOpen]);
  
  // Valider le mot de passe en temps réel
  useEffect(() => {
    if (newPassword) {
      const validation = AdminPasswordService.validatePasswordStrength(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [newPassword]);
  
  // ===================================================================
  // FONCTIONS DE CHARGEMENT
  // ===================================================================
  
  const loadData = async () => {
    try {
      const [history, events] = await Promise.all([
        AdminPasswordService.getPasswordChangeHistory(50),
        AdminPasswordService.getRecentSecurityEvents(30)
      ]);
      
      setPasswordHistory(history);
      setSecurityEvents(events);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };
  
  const checkSupabaseStatus = async () => {
    const status = await AdminPasswordService.isSupabaseAvailable();
    setSupabaseStatus(status);
  };
  
  // ===================================================================
  // GESTION DU CHANGEMENT DE MOT DE PASSE
  // ===================================================================
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    const request: PasswordChangeRequest = {
      currentPassword,
      newPassword,
      confirmPassword,
      passwordType,
      adminUserId: user?.id,
      adminEmail: user?.email
    };
    
    const result = await AdminPasswordService.changePassword(request);
    
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      resetForm();
      loadData(); // Recharger l'historique
      
      // Fermer automatiquement après succès
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    
    setIsLoading(false);
  };
  
  const generatePassword = () => {
    const generated = AdminPasswordService.generateSecurePassword(16);
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowPasswords(true);
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copié dans le presse-papiers' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };
  
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswords(false);
    setPasswordValidation(null);
  };
  
  // ===================================================================
  // UTILITAIRES DE NETTOYAGE
  // ===================================================================
  
  const cleanupLogs = async () => {
    setIsLoading(true);
    try {
      const deleted = await AdminPasswordService.cleanupOldLogs();
      setMessage({ 
        type: 'success', 
        text: `${deleted} anciens logs supprimés avec succès` 
      });
      loadData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors du nettoyage des logs' 
      });
    }
    setIsLoading(false);
  };
  
  // ===================================================================
  // COMPOSANTS DE RENDU
  // ===================================================================
  
  const renderPasswordStrengthIndicator = () => {
    if (!passwordValidation) return null;
    
    const colors = {
      weak: 'bg-red-500',
      medium: 'bg-yellow-500',
      strong: 'bg-blue-500',
      very_strong: 'bg-green-500'
    };
    
    const strengthTexts = {
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
      very_strong: 'Très fort'
    };
    
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Force du mot de passe
          </span>
          <span className={`text-sm font-semibold ${
            passwordValidation.strength === 'very_strong' ? 'text-green-600' :
            passwordValidation.strength === 'strong' ? 'text-blue-600' :
            passwordValidation.strength === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {strengthTexts[passwordValidation.strength]} ({passwordValidation.score}/8)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colors[passwordValidation.strength]}`}
            style={{ width: `${(passwordValidation.score / 8) * 100}%` }}
          />
        </div>
        
        {passwordValidation.errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {passwordValidation.errors.map((error, index) => (
              <p key={index} className="text-xs text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderChangePasswordTab = () => (
    <div className="space-y-6">
      {/* Sélecteur de type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Type de mot de passe
        </label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={() => setPasswordType('site')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
              passwordType === 'site' 
                ? 'border-orange-500 bg-orange-50 text-orange-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <Globe className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Mot de passe du site</div>
              <div className="text-sm opacity-75">Accès visiteurs</div>
            </div>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPasswordType('admin')}
            className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-3 ${
              passwordType === 'admin' 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Mot de passe admin</div>
              <div className="text-sm opacity-75">Administration</div>
            </div>
          </motion.button>
        </div>
      </div>
      
      {/* Formulaire */}
      <form onSubmit={handlePasswordChange} className="space-y-5">
        {/* Mot de passe actuel */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Mot de passe actuel
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
              placeholder="Mot de passe actuel"
              required
            />
          </div>
        </div>
        
        {/* Nouveau mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Nouveau mot de passe
            </label>
            <motion.button
              type="button"
              onClick={generatePassword}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
            >
              <Key className="w-4 h-4" />
              <span>Générer</span>
            </motion.button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
              placeholder="Nouveau mot de passe"
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {newPassword && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(newPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPasswords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {renderPasswordStrengthIndicator()}
        </div>
        
        {/* Confirmer mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Confirmer le nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all"
              placeholder="Confirmer le nouveau mot de passe"
              required
            />
          </div>
        </div>
        
        {/* Bouton de soumission */}
        <motion.button
          type="submit"
          disabled={isLoading || !passwordValidation?.isValid}
          className="btn-primary w-full h-12 text-base font-semibold disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="loading-spinner w-5 h-5"></div>
              <span>Changement en cours...</span>
            </div>
          ) : (
            `🔐 Changer le mot de passe ${passwordType === 'site' ? 'du site' : 'admin'}`
          )}
        </motion.button>
      </form>
    </div>
  );
  
  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Historique des changements
        </h3>
        <motion.button
          onClick={cleanupLogs}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <Trash2 className="w-4 h-4" />
          <span>Nettoyer</span>
        </motion.button>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {passwordHistory.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 ${
              log.success 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {log.change_type === 'admin_password' ? (
                  <Shield className="w-5 h-5 text-purple-600" />
                ) : (
                  <Globe className="w-5 h-5 text-orange-600" />
                )}
                <span className="font-semibold text-gray-800">
                  {log.change_type === 'admin_password' ? 'Admin' : 'Site'}
                </span>
                {log.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(log.changed_at).toLocaleString('fr-FR')}
              </span>
            </div>
            
            {log.admin_email && (
              <p className="text-sm text-gray-600 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Par: {log.admin_email}
              </p>
            )}
            
            {log.notes && (
              <p className="text-sm text-gray-700">{log.notes}</p>
            )}
          </motion.div>
        ))}
        
        {passwordHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun historique de changement disponible</p>
          </div>
        )}
      </div>
    </div>
  );
  
  const renderSecurityTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Événements de sécurité récents
      </h3>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {securityEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 ${
              event.severity === 'critical' ? 'border-red-500 bg-red-50' :
              event.severity === 'high' ? 'border-orange-500 bg-orange-50' :
              event.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className={`w-5 h-5 ${
                  event.severity === 'critical' ? 'text-red-600' :
                  event.severity === 'high' ? 'text-orange-600' :
                  event.severity === 'medium' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
                <span className="font-semibold text-gray-800 capitalize">
                  {event.severity}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(event.created_at).toLocaleString('fr-FR')}
              </span>
            </div>
            
            <h4 className="font-medium text-gray-800 mb-1">
              {event.event_type.replace(/_/g, ' ')}
            </h4>
            <p className="text-sm text-gray-700">
              {event.event_description}
            </p>
          </motion.div>
        ))}
        
        {securityEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun événement de sécurité récent</p>
          </div>
        )}
      </div>
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
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-t-2xl px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Gestion des mots de passe
                      </h2>
                      <p className="text-purple-100">
                        Administration sécurisée des accès système
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Statut Supabase */}
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      supabaseStatus === true ? 'bg-green-500/20 text-green-100' :
                      supabaseStatus === false ? 'bg-red-500/20 text-red-100' :
                      'bg-yellow-500/20 text-yellow-100'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        supabaseStatus === true ? 'bg-green-400' :
                        supabaseStatus === false ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`} />
                      <span>
                        {supabaseStatus === true ? 'Supabase OK' :
                         supabaseStatus === false ? 'Supabase KO' :
                         'Vérification...'}
                      </span>
                    </div>
                    
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-8">
                  {[
                    { id: 'change', label: 'Changer', icon: Lock },
                    { id: 'history', label: 'Historique', icon: History },
                    { id: 'security', label: 'Sécurité', icon: Shield }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                        activeTab === id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8 max-h-[60vh] overflow-y-auto">
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
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </motion.div>
                )}
                
                {/* Tab Content */}
                {activeTab === 'change' && renderChangePasswordTab()}
                {activeTab === 'history' && renderHistoryTab()}
                {activeTab === 'security' && renderSecurityTab()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminPasswordManager;