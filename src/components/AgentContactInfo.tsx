import React from 'react';
import type { Agent } from '@/types/agent';

interface AgentContactInfoProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  className?: string;
}

export const AgentContactInfo: React.FC<AgentContactInfoProps> = ({
  agent,
  size = 'md',
  showEmpty = false,
  className = ''
}) => {
  const hasContactInfo = agent.phoneNumber || agent.contactInfo?.email || agent.contactInfo?.websiteUrl;

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  if (!hasContactInfo && !showEmpty) {
    return null;
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {agent.phoneNumber && (
        <div className={`text-gray-600 ${textSizes[size]} flex items-center`}>
          <span className={`mr-2 ${iconSizes[size]}`}>📞</span>
          <a 
            href={`tel:${agent.phoneNumber}`} 
            className="text-blue-600 hover:underline transition-colors"
          >
            {agent.phoneNumber}
          </a>
        </div>
      )}

      {agent.contactInfo?.email && (
        <div className={`text-gray-600 ${textSizes[size]} flex items-center`}>
          <span className={`mr-2 ${iconSizes[size]}`}>✉️</span>
          <a 
            href={`mailto:${agent.contactInfo.email}`} 
            className="text-blue-600 hover:underline transition-colors"
          >
            {agent.contactInfo.email}
          </a>
        </div>
      )}

      {agent.contactInfo?.websiteUrl && (
        <div className={`text-gray-600 ${textSizes[size]} flex items-center`}>
          <span className={`mr-2 ${iconSizes[size]}`}>🌐</span>
          <a 
            href={agent.contactInfo.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline transition-colors font-medium"
          >
            {agent.contactInfo.websiteUrl.replace(/^https?:\/\//, '')}
          </a>
        </div>
      )}

      {!hasContactInfo && showEmpty && (
        <div className={`text-gray-400 ${textSizes[size]} italic`}>
          Aucune information de contact disponible
        </div>
      )}

      {agent.about && (
        <div className={`text-gray-600 ${textSizes[size]} mt-2 ${size === 'lg' ? 'bg-gray-50 p-3 rounded-lg' : ''}`}>
          <span className={`mr-2 ${iconSizes[size]}`}>📝</span>
          <span className={size === 'sm' ? 'line-clamp-2' : ''}>{agent.about}</span>
        </div>
      )}
    </div>
  );
};