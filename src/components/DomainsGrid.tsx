import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Star, ArrowRight } from 'lucide-react';
import { mockDomains } from '@/data/domains';
import type { Domain } from '@/types';

interface DomainsGridProps {
  onDomainClick: (domain: Domain) => void;
  searchQuery?: string;
}

export const DomainsGrid: React.FC<DomainsGridProps> = ({ 
  onDomainClick, 
  searchQuery = '' 
}) => {
  const filteredDomains = mockDomains.filter(domain =>
    domain.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <section id="domains" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gradient mb-4">
            Domaines d'Entreprises
          </h2>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Explorez notre collection organisée d'entreprises fictives réparties 
            par secteurs d'activité pour votre apprentissage et démonstration.
          </p>
        </motion.div>

        {/* Search Results Info */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <p className="text-dark-400">
              {filteredDomains.length} domaine(s) trouvé(s) pour "{searchQuery}"
            </p>
          </motion.div>
        )}

        {/* Domains Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredDomains.map((domain) => (
            <motion.div
              key={domain.id}
              variants={cardVariants}
              className="domain-card group"
              whileHover={{ 
                y: -12,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              onClick={() => onDomainClick(domain)}
            >
              {/* Domain Image/Icon */}
              <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-primary-500/20 to-primary-600/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Popularity Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-white font-medium">
                      {domain.popularite}
                    </span>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {domain.titre}
                  </h3>
                  <p className="text-sm text-dark-300 line-clamp-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-dark-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{domain.entreprises.length} entreprises</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-3 h-3" />
                    <span>{domain.tags.length} tags</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {domain.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {domain.tags.length > 3 && (
                    <span className="px-2 py-1 bg-dark-700 text-dark-300 text-xs rounded-full">
                      +{domain.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-dark-400">
                      Créé le {domain.dateCreation.toLocaleDateString('fr-FR')}
                    </span>
                    <motion.div
                      className="flex items-center space-x-1 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm font-medium">Explorer</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-xl border-2 border-primary-500/0 group-hover:border-primary-500/20 transition-colors pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredDomains.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Building2 className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              Aucun domaine trouvé
            </h3>
            <p className="text-dark-400">
              Essayez de modifier votre recherche ou explorez tous les domaines disponibles.
            </p>
          </motion.div>
        )}

        {/* Statistics */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-12 border-t border-dark-700"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {mockDomains.length}
                </div>
                <div className="text-sm text-dark-400">Domaines</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {mockDomains.reduce((acc, domain) => acc + domain.entreprises.length, 0)}
                </div>
                <div className="text-sm text-dark-400">Entreprises</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {mockDomains.reduce((acc, domain) => acc + domain.tags.length, 0)}
                </div>
                <div className="text-sm text-dark-400">Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {Math.round(mockDomains.reduce((acc, domain) => acc + domain.popularite, 0) / mockDomains.length)}%
                </div>
                <div className="text-sm text-dark-400">Popularité Moy.</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};