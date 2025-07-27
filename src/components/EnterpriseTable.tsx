import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  Edit, 
  Trash2, 
  Plus,
  MessageSquare,
  Phone,
  Mail,
  User,
  MessageCircle,
  AtSign,
  Filter,
  SortAsc,
  SortDesc,
  Eye
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { Domain, Enterprise, Contact } from '@/types';

interface EnterpriseTableProps {
  domain: Domain;
  onBack: () => void;
  searchQuery?: string;
}

export const EnterpriseTable: React.FC<EnterpriseTableProps> = ({
  domain,
  onBack,
  searchQuery = ''
}) => {
  const { mode } = useAuthStore();
  const [sortField, setSortField] = useState<keyof Enterprise>('nom');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);

  const isAdmin = mode === 'admin';

  // Filtrage et tri des entreprises
  const filteredEnterprises = domain.entreprises
    .filter(enterprise =>
      enterprise.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enterprise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enterprise.specialites.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: keyof Enterprise) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getContactIcon = (type: Contact['type']) => {
    const iconMap = {
      whatsapp: Phone,
      email: Mail,
      telegram: MessageCircle,
      linkedin: User,
      wechat: MessageSquare,
      discord: AtSign,
      phone: Phone
    };
    return iconMap[type] || Phone;
  };

  const getContactColor = (type: Contact['type']) => {
    const colorMap = {
      whatsapp: 'text-green-400 bg-green-500/20',
      email: 'text-blue-400 bg-blue-500/20',
      telegram: 'text-cyan-400 bg-cyan-500/20',
      linkedin: 'text-indigo-400 bg-indigo-500/20',
      wechat: 'text-emerald-400 bg-emerald-500/20',
      discord: 'text-purple-400 bg-purple-500/20',
      phone: 'text-orange-400 bg-orange-500/20'
    };
    return colorMap[type] || 'text-gray-400 bg-gray-500/20';
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pt-24 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={onBack}
                className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour aux domaines</span>
              </motion.button>
            </div>
            
            {isAdmin && (
              <motion.button
                className="btn-primary flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter Entreprise</span>
              </motion.button>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              {domain.titre}
            </h1>
            <p className="text-dark-300 mb-4">{domain.description}</p>
            <div className="flex items-center space-x-4 text-sm text-dark-400">
              <span>{filteredEnterprises.length} entreprises</span>
              <span>•</span>
              <span>Popularité: {domain.popularite}%</span>
              <span>•</span>
              <span>Créé le {domain.dateCreation.toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </motion.div>

        {/* Contrôles */}
        <motion.div 
          className="glass-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-dark-400">
                {filteredEnterprises.length} résultat(s)
                {searchQuery && ` pour "${searchQuery}"`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
              </button>
              
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field as keyof Enterprise);
                  setSortDirection(direction as 'asc' | 'desc');
                }}
                className="input-field"
              >
                <option value="nom-asc">Nom A-Z</option>
                <option value="nom-desc">Nom Z-A</option>
                <option value="evaluation-desc">Meilleure note</option>
                <option value="evaluation-asc">Note la plus basse</option>
                <option value="dateAjout-desc">Plus récent</option>
                <option value="dateAjout-asc">Plus ancien</option>
              </select>
            </div>
          </div>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-dark-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Secteur</label>
                    <select className="input-field w-full">
                      <option value="">Tous les secteurs</option>
                      <option value="tech">Technologie</option>
                      <option value="retail">Retail</option>
                      <option value="consulting">Consulting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Note minimum</label>
                    <select className="input-field w-full">
                      <option value="">Toutes les notes</option>
                      <option value="4.5">4.5+ étoiles</option>
                      <option value="4.0">4.0+ étoiles</option>
                      <option value="3.5">3.5+ étoiles</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Statut</label>
                    <select className="input-field w-full">
                      <option value="">Tous</option>
                      <option value="verified">Vérifiés uniquement</option>
                      <option value="unverified">Non vérifiés</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tableau des entreprises */}
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-dark-800/50 transition-colors"
                    onClick={() => handleSort('nom')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Entreprise</span>
                      {sortField === 'nom' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold">Contacts</th>
                  <th className="text-left p-4 font-semibold">Spécialités</th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-dark-800/50 transition-colors"
                    onClick={() => handleSort('evaluation')}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">Note</span>
                      {sortField === 'evaluation' && (
                        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold">Commentaire Admin</th>
                  {isAdmin && <th className="text-left p-4 font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredEnterprises.map((enterprise, index) => (
                    <motion.tr
                      key={enterprise.id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                      className="enterprise-row"
                      whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.3)' }}
                    >
                      {/* Entreprise Info */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {enterprise.nom.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center space-x-2">
                              <span>{enterprise.nom}</span>
                              {enterprise.verifie && (
                                <Shield className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="text-sm text-dark-300 max-w-xs truncate">
                              {enterprise.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contacts */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {enterprise.contacts.slice(0, 3).map((contact, idx) => {
                            const Icon = getContactIcon(contact.type);
                            const colorClass = getContactColor(contact.type);
                            return (
                              <motion.div
                                key={idx}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}
                                whileHover={{ scale: 1.05 }}
                                title={`${contact.type}: ${contact.value}`}
                              >
                                <Icon className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">{contact.type}</span>
                              </motion.div>
                            );
                          })}
                          {enterprise.contacts.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dark-600 text-dark-300">
                              +{enterprise.contacts.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Spécialités */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {enterprise.specialites.slice(0, 2).map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                          {enterprise.specialites.length > 2 && (
                            <span className="px-2 py-1 bg-dark-600 text-dark-300 text-xs rounded-full">
                              +{enterprise.specialites.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Évaluation */}
                      <td className="p-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{enterprise.evaluation}</span>
                        </div>
                      </td>

                      {/* Commentaire Admin */}
                      <td className="p-4">
                        <div className="max-w-xs">
                          {enterprise.commentaireAdmin ? (
                            <p className="text-sm text-dark-300 line-clamp-2">
                              {enterprise.commentaireAdmin}
                            </p>
                          ) : (
                            <span className="text-xs text-dark-500 italic">
                              Aucun commentaire
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions Admin */}
                      {isAdmin && (
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-primary-400"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-blue-400"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              className="p-2 rounded-lg hover:bg-dark-700 transition-colors text-red-400"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredEnterprises.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-dark-600 mb-4">
                <MessageSquare className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-dark-300 mb-2">
                Aucune entreprise trouvée
              </h3>
              <p className="text-dark-400">
                {searchQuery 
                  ? "Essayez de modifier votre recherche ou vos filtres."
                  : "Ce domaine ne contient pas encore d'entreprises."
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Stats du domaine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {domain.entreprises.length}
            </div>
            <div className="text-sm text-dark-400">Total Entreprises</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {domain.entreprises.filter(e => e.verifie).length}
            </div>
            <div className="text-sm text-dark-400">Vérifiées</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {(domain.entreprises.reduce((acc, e) => acc + e.evaluation, 0) / domain.entreprises.length).toFixed(1)}
            </div>
            <div className="text-sm text-dark-400">Note Moyenne</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {domain.entreprises.reduce((acc, e) => acc + e.contacts.length, 0)}
            </div>
            <div className="text-sm text-dark-400">Total Contacts</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};