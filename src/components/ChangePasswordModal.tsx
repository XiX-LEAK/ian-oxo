import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [passwordType, setPasswordType] = useState<'site' | 'admin'>('site');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { updateSitePassword, updateAdminPassword, getSitePassword, getAdminPassword, mode } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      setIsLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien');
      setIsLoading(false);
      return;
    }

    try {
      // Vérifier le mot de passe actuel
      const correctCurrentPassword = passwordType === 'site' 
        ? await getSitePassword() 
        : await getAdminPassword();
      
      if (currentPassword !== correctCurrentPassword) {
        setError('Le mot de passe actuel est incorrect');
        setIsLoading(false);
        return;
      }
      
      // Mettre à jour le mot de passe
      const success = passwordType === 'site' 
        ? await updateSitePassword(newPassword)
        : await updateAdminPassword(newPassword);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour du mot de passe');
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setPasswordType('site');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess(false);
    setShowPasswords(false);
  };

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
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl relative border border-gray-100">
              {/* Header */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-t-2xl px-8 py-8 text-center relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Gestion des mots de passe
                </h2>
                <p className="text-orange-100 text-lg">
                  Modifiez les mots de passe du site et d'administration
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-green-700 text-sm">
                      Mot de passe mis à jour avec succès !
                    </span>
                  </motion.div>
                )}

                {/* Sélecteur de type de mot de passe */}
                {mode === 'admin' && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Type de mot de passe à modifier
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setPasswordType('site')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                          passwordType === 'site' 
                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Lock className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">Mot de passe du site</div>
                          <div className="text-sm opacity-75">Accès visiteurs</div>
                        </div>
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        onClick={() => setPasswordType('admin')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                          passwordType === 'admin' 
                            ? 'border-purple-500 bg-purple-50 text-purple-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Shield className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">Mot de passe admin</div>
                          <div className="text-sm opacity-75">Mode administration</div>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    {/* Mot de passe actuel */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {passwordType === 'site' ? 'Mot de passe actuel du site' : 'Mot de passe administrateur actuel'}
                      </label>
                      <div className="relative group">
                        {passwordType === 'site' ? (
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                        ) : (
                          <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                        )}
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={`w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                            passwordType === 'site' 
                              ? 'focus:ring-orange-300 focus:border-orange-500' 
                              : 'focus:ring-purple-300 focus:border-purple-500'
                          }`}
                          placeholder={passwordType === 'site' ? 'Mot de passe actuel du site' : 'Mot de passe admin actuel'}
                          required
                        />
                      </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {passwordType === 'site' ? 'Nouveau mot de passe du site' : 'Nouveau mot de passe admin'}
                      </label>
                      <div className="relative group">
                        {passwordType === 'site' ? (
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                        ) : (
                          <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                        )}
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className={`w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                            passwordType === 'site' 
                              ? 'focus:ring-orange-300 focus:border-orange-500' 
                              : 'focus:ring-purple-300 focus:border-purple-500'
                          }`}
                          placeholder="Nouveau mot de passe (min. 6 caractères)"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Confirmer nouveau mot de passe */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative group">
                        {passwordType === 'site' ? (
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-10" />
                        ) : (
                          <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors z-10" />
                        )}
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full h-12 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 bg-white text-gray-900 placeholder-gray-500 transition-all duration-300 ${
                            passwordType === 'site' 
                              ? 'focus:ring-orange-300 focus:border-orange-500' 
                              : 'focus:ring-purple-300 focus:border-purple-500'
                          }`}
                          placeholder="Confirmer le nouveau mot de passe"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(!showPasswords)}
                          className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 hover:${
                            passwordType === 'site' ? 'text-orange-500' : 'text-purple-500'
                          }`}
                        >
                          {showPasswords ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || success}
                    className="btn-primary w-full h-12 text-base font-semibold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="loading-spinner w-5 h-5"></div>
                        <span>Mise à jour...</span>
                      </div>
                    ) : success ? (
                      '✅ Mis à jour !'
                    ) : (
                      `${passwordType === 'site' ? '🔐' : '🛡️'} Changer le mot de passe ${passwordType === 'site' ? 'du site' : 'admin'}`
                    )}
                  </motion.button>
                </form>

                {/* Info Notice */}
                <div className={`mt-6 p-4 rounded-xl border-2 ${
                  passwordType === 'site' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl ${
                      passwordType === 'site' ? 'text-orange-500' : 'text-purple-500'
                    }`}>
                      {passwordType === 'site' ? '💡' : '🛡️'}
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm mb-2 ${
                        passwordType === 'site' ? 'text-orange-700' : 'text-purple-700'
                      }`}>
                        {passwordType === 'site' ? 'Mot de passe du site' : 'Mot de passe administrateur'}
                      </h4>
                      <p className={`text-sm ${
                        passwordType === 'site' ? 'text-orange-600' : 'text-purple-600'
                      }`}>
                        {passwordType === 'site' 
                          ? 'Ce mot de passe permet aux visiteurs d\'accéder à l\'annuaire d\'agents. Partagez-le uniquement avec les utilisateurs autorisés.' 
                          : 'Ce mot de passe donne accès au panel d\'administration. Gardez-le strictement confidentiel et utilisez un mot de passe fort.'
                        }
                      </p>
                      <div className={`mt-3 text-xs font-medium ${
                        passwordType === 'site' ? 'text-orange-500' : 'text-purple-500'
                      }`}>
                        💾 Sauvegarde automatique dans Supabase + localStorage
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};