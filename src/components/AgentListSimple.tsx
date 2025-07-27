import React from 'react';

interface AgentListSimpleProps {
  onEditAgent?: (agent: any) => void;
  onCreateAgent: () => void;
}

export const AgentListSimple: React.FC<AgentListSimpleProps> = ({ onEditAgent, onCreateAgent }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Liste des agents (Version Simple)</h3>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium">Agent Test 1</h4>
          <p className="text-sm text-gray-600">WhatsApp: +33123456789</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium">Agent Test 2</h4>
          <p className="text-sm text-gray-600">WeChat: test_agent</p>
        </div>
        <button 
          onClick={onCreateAgent}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ajouter un agent
        </button>
      </div>
    </div>
  );
};