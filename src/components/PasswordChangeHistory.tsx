import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Key, CheckCircle, XCircle, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { PasswordLoggingService, type PasswordChangeLog } from '@/services/supabaseService';

interface PasswordChangeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordChangeHistory: React.FC<PasswordChangeHistoryProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [logs, setLogs] = useState<PasswordChangeLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'site_password' | 'admin_password'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPasswordHistory();
    }
  }, [isOpen, filter]);

  const loadPasswordHistory = async () => {
    setIsLoading(true);
    try {
      let history: PasswordChangeLog[];
      
      if (filter === 'all') {
        history = await PasswordLoggingService.getPasswordChangeHistory(50);
      } else {
        history = await PasswordLoggingService.getPasswordChangesByType(filter, 50);
      }
      
      setLogs(history);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getChangeTypeIcon = (type: string) => {
    return type === 'admin_password' ? (
      <Shield className="w-4 h-4 text-red-400" />
    ) : (
      <Key className="w-4 h-4 text-blue-400" />
    );
  };

  const getChangeTypeLabel = (type: string) => {
    return type === 'admin_password' ? 'Mot de passe Admin' : 'Mot de passe Site';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <XCircle className="w-4 h-4 text-red-400" />
    );
  };

  if (!isOpen) return null;

  return (
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
        <div className="bg-white rounded-2xl shadow-2xl relative border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-t-2xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Historique des changements
                  </h2>
                  <p className="text-purple-100">
                    Suivi des modifications de mots de passe
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Filtres */}
            <div className="mb-6">
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'Tous les changements', icon: Clock },
                  { key: 'site_password', label: 'Mot de passe Site', icon: Key },
                  { key: 'admin_password', label: 'Mot de passe Admin', icon: Shield }
                ].map(({ key, label, icon: Icon }) => (
                  <motion.button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      filter === key
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner w-8 h-8"></div>
                <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
              </div>
            )}

            {/* Liste des changements */}
            {!isLoading && (
              <div className="space-y-4">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun changement de mot de passe enregistré</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <motion.div
                      key={log.id}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getChangeTypeIcon(log.change_type)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">
                                {getChangeTypeLabel(log.change_type)}
                              </span>
                              {getStatusIcon(log.success)}
                              <span className={`text-sm ${log.success ? 'text-green-600' : 'text-red-600'}`}>
                                {log.success ? 'Réussi' : 'Échec'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">
                                {formatDate(log.changed_at)}
                              </span>
                              {log.admin_email && (
                                <span className="ml-2">
                                  par {log.admin_email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          {showDetails === log.id ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>

                      {/* Détails étendus */}
                      {showDetails === log.id && (
                        <motion.div
                          className="mt-4 pt-4 border-t border-gray-200 space-y-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {log.admin_user_id && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">ID Admin:</span>
                              <span className="ml-2 text-gray-600">{log.admin_user_id}</span>
                            </div>
                          )}
                          
                          {log.ip_address && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Adresse IP:</span>
                              <span className="ml-2 text-gray-600">{log.ip_address}</span>
                            </div>
                          )}
                          
                          {log.user_agent && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Navigateur:</span>
                              <span className="ml-2 text-gray-600 break-all">{log.user_agent}</span>
                            </div>
                          )}
                          
                          {log.notes && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Notes:</span>
                              <span className="ml-2 text-gray-600">{log.notes}</span>
                            </div>
                          )}
                          
                          {log.previous_password_hash && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Hash précédent:</span>
                              <span className="ml-2 font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {log.previous_password_hash.substring(0, 20)}...
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {logs.length} changement{logs.length !== 1 ? 's' : ''} trouvé{logs.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};