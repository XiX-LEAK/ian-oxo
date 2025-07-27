import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLength = 150,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Si le texte est court, l'afficher directement
  if (text.length <= maxLength) {
    return (
      <div className={`${className} max-w-full`}>
        <div className="max-w-full overflow-hidden">
          <p className="leading-relaxed break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
            {text}
          </p>
        </div>
      </div>
    );
  }

  // Texte tronqué
  const truncatedText = text.substring(0, maxLength);
  const remainingText = text.substring(maxLength);

  return (
    <div className={`${className} max-w-full`}>
      <div className="max-w-full overflow-hidden">
        <p className="leading-relaxed break-words whitespace-pre-wrap word-wrap overflow-wrap-anywhere">
          {truncatedText}
          {!isExpanded && '...'}
          {isExpanded && remainingText}
        </p>
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium bg-white/80 px-3 py-1 rounded-lg shadow-sm border border-blue-200/50"
      >
        {isExpanded ? (
          <>
            <span>Afficher moins</span>
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Afficher plus</span>
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};