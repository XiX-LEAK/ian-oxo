import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto mb-12"
    >
      <div className="relative">
        <div className="search-modern">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher des entreprises, domaines, agents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input text-center"
          />
        </div>
        
        {/* Search suggestions hint */}
        <div className="text-center mt-2">
          <p className="text-sm text-dark-400">
            🔍 Recherchez par domaine, entreprise ou type d'agent
          </p>
        </div>
      </div>
    </motion.div>
  );
};