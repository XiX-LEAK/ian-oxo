import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Lock, Key, Save, Eye, EyeOff, Shield, AlertCircle, CheckCircle, Cog } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import AdminPasswordManager from '@/components/admin/AdminPasswordManager';

export const AdminDashboard: React.FC = () => {
  const [newSitePassword, setNewSitePassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [currentSitePassword, setCurrentSitePassword] = useState('');
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedPasswordManager, setShowAdvancedPasswordManager] = useState(false);

  const { updateSitePassword, updateAdminPassword, getSitePassword, getAdminPassword } = useAuthStore();

  // Charger les mots de passe actuels au montage du composant
  useEffect(() => {
    const loadPasswords = async () => {
      try {
        const sitePass = await getSitePassword();
        const adminPass = await getAdminPassword();
        setCurrentSitePassword(sitePass);
        setCurrentAdminPassword(adminPass);
      } catch (error) {
        console.error('Erreur chargement mots de passe:', error);
      }
    };
    loadPasswords();
  }, [getSitePassword, getAdminPassword]);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleUpdateSitePassword = async () => {
    if (newSitePassword.length < 6) {
      showMessage('Le mot de passe du site doit contenir au moins 6 caractères', 'error');
      return;
    }
    
    setIsLoading(true);
    const success = await updateSitePassword(newSitePassword);
    
    if (success) {
      showMessage('✅ Mot de passe du site mis à jour avec succès dans Supabase !');
      setNewSitePassword('');
      // Recharger le mot de passe actuel
      const updatedPassword = await getSitePassword();
      setCurrentSitePassword(updatedPassword);
    } else {
      showMessage('❌ Erreur lors de la mise à jour du mot de passe du site', 'error');
    }
    setIsLoading(false);
  };

  const handleUpdateAdminPassword = async () => {
    if (newAdminPassword.length < 6) {
      showMessage('Le mot de passe admin doit contenir au moins 6 caractères', 'error');
      return;
    }
    
    setIsLoading(true);
    const success = await updateAdminPassword(newAdminPassword);
    
    if (success) {
      showMessage('✅ Mot de passe admin mis à jour avec succès dans Supabase !');
      setNewAdminPassword('');
      // Recharger le mot de passe actuel
      const updatedPassword = await getAdminPassword();
      setCurrentAdminPassword(updatedPassword);
    } else {
      showMessage('❌ Erreur lors de la mise à jour du mot de passe admin', 'error');
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-2xl">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Administration
          </h1>
          <p className="text-xl text-gray-300">
            Gestion des mots de passe système
          </p>
        </motion.div>

        {/* Bouton gestionnaire avancé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <motion.button
            onClick={() => setShowAdvancedPasswordManager(true)}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Cog className="w-6 h-6" />
            <span>Gestionnaire Avancé de Mots de Passe</span>
            <Shield className="w-5 h-5" />
          </motion.button>
          <p className="text-gray-400 text-sm mt-3">
            🔐 Interface complète avec historique, sécurité et validation avancée
          </p>
        </motion.div>

        {/* Message de feedback */}
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-6 rounded-2xl border-2 ${
              messageType === 'success' 
                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              {messageType === 'success' ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <span className="text-lg font-medium">{message}</span>
            </div>
          </motion.div>
        )}

        {/* Cartes de gestion des mots de passe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mot de passe du site */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mot de passe du site</h2>
                <p className="text-gray-400">Accès pour les utilisateurs</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentSitePassword}
                    readOnly
                    className="w-full h-14 px-6 pr-14 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 font-medium focus:border-blue-500/50 focus:outline-none cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPasswords ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newSitePassword}
                  onChange={(e) => setNewSitePassword(e.target.value)}
                  className="w-full h-14 px-6 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 font-medium focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                />
              </div>
              
              {/* Bouton de mise à jour */}
              <motion.button
                onClick={handleUpdateSitePassword}
                disabled={!newSitePassword || newSitePassword.length < 6 || isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl"
                whileHover={{ scale: newSitePassword && newSitePassword.length >= 6 && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: newSitePassword && newSitePassword.length >= 6 && !isLoading ? 0.98 : 1 }}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                💡 Ce mot de passe permet aux visiteurs d'accéder à l'annuaire d'agents.
              </p>
            </div>
          </motion.div>

          {/* Mot de passe admin */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Mot de passe admin</h2>
                <p className="text-gray-400">Accès administration</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentAdminPassword}
                    readOnly
                    className="w-full h-14 px-6 pr-14 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 font-medium focus:border-red-500/50 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>
              
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-300">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full h-14 px-6 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 font-medium focus:border-red-500/50 focus:outline-none transition-all duration-300"
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                />
              </div>
              
              {/* Bouton de mise à jour */}
              <motion.button
                onClick={handleUpdateAdminPassword}
                disabled={!newAdminPassword || newAdminPassword.length < 6 || isLoading}
                className="w-full h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl"
                whileHover={{ scale: newAdminPassword && newAdminPassword.length >= 6 && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: newAdminPassword && newAdminPassword.length >= 6 && !isLoading ? 0.98 : 1 }}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-5 h-5"></div>
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Warning */}
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-300">
                ⚠️ Ce mot de passe donne accès aux fonctionnalités d'administration. Gardez-le confidentiel.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Instructions de sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-yellow-500/10 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/20"
        >
          <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center">
            <Lock className="w-6 h-6 mr-3" />
            Conseils de sécurité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-yellow-200">
            <div>
              <h4 className="font-semibold mb-3">🔐 Bonnes pratiques :</h4>
              <ul className="space-y-2 text-sm">
                <li>• Utilisez des mots de passe complexes (8+ caractères)</li>
                <li>• Changez les mots de passe régulièrement</li>
                <li>• Ne partagez jamais le mot de passe admin</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">💾 Sauvegarde :</h4>
              <ul className="space-y-2 text-sm">
                <li>• Les mots de passe sont sauvegardés dans Supabase</li>
                <li>• Backup automatique en localStorage</li>
                <li>• Historique des changements enregistré</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Gestionnaire avancé de mots de passe */}
      <AdminPasswordManager
        isOpen={showAdvancedPasswordManager}
        onClose={() => setShowAdvancedPasswordManager(false)}
      />
    </motion.div>
  );
};