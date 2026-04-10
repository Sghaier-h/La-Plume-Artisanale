/**
 * ContextActions - Barre d'actions contextuelles
 * Affiche les actions disponibles selon le contexte actuel
 */

import React from 'react';
import { useNavigationContext } from './NavigationContext';

interface ContextActionsProps {
  className?: string;
}

const ContextActions: React.FC<ContextActionsProps> = ({ className = '' }) => {
  const { contextActions } = useNavigationContext();

  if (contextActions.length === 0) {
    return null;
  }

  const getVariantClasses = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'secondary':
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 bg-white border-b border-gray-200 ${className}`}>
      {contextActions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${getVariantClasses(action.variant)}`}
        >
          {action.icon && <span>{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextActions;
