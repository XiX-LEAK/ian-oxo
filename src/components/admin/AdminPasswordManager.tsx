// 🔐 COMPOSANT ADMIN SIMPLIFIÉ - GESTION MOTS DE PASSE
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react';
import { firebaseServiceSync } from '@/services/firebaseServiceSync';
import { useAuthStore } from '@/stores/authStore';

interface AdminPasswordManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPasswordManager: React.FC<AdminPasswordManagerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [passwordType, setPasswordType] = useState<'site' | 'admin'>('site');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { changeSitePassword, changeAdminPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      setIsLoading(false);
      return;
    }

    try {
      // Vérifier le mot de passe actuel
      const currentSitePassword = firebaseServiceSync.getSitePassword();
      const currentAdminPassword = firebaseServiceSync.getAdminPassword();
      
      if (passwordType === 'site' && currentPassword !== currentSitePassword) {
        setMessage({ type: 'error', text: 'Mot de passe actuel incorrect' });
        setIsLoading(false);
        return;
      }
      
      if (passwordType === 'admin' && currentPassword !== currentAdminPassword) {
        setMessage({ type: 'error', text: 'Mot de passe actuel incorrect' });
        setIsLoading(false);
        return;
      }

      // Changer le mot de passe
      let success = false;
      if (passwordType === 'site') {
        success = await changeSitePassword(currentPassword, newPassword);
      } else {
        success = await changeAdminPassword(currentPassword, newPassword);
      }

      if (success) {
        setMessage({ type: 'success', text: `Mot de passe ${passwordType} mis à jour avec succès` });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue' });
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🔐 Gestion des mots de passe
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 p-4 rounded-xl flex items-center space-x-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </span>
            </motion.div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type de mot de passe
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPasswordType('site')}
                className={`p-3 rounded-xl font-medium transition-colors ${
                  passwordType === 'site'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Site
              </button>
              <button
                type="button"
                onClick={() => setPasswordType('admin')}
                className={`p-3 rounded-xl font-medium transition-colors ${
                  passwordType === 'admin'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Mot de passe actuel"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPasswords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Nouveau mot de passe"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  placeholder="Confirmer le mot de passe"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mise à jour...</span>
                </div>
              ) : (
                `🔐 Mettre à jour le mot de passe ${passwordType}`
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};