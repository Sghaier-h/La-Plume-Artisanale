/**
 * NotificationCenter - Centre de notifications
 * Affiche les notifications de l'application
 */

import React from 'react';
import { useApp } from '../store/AppContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  const { state, removeNotification } = useApp();
  const { notifications } = state.ui;

  if (notifications.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification: any) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg ${getBgColor(notification.type || 'info')} animate-slide-in`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type || 'info')}
            <div className="flex-1">
              {notification.title && (
                <div className="font-semibold text-gray-900 mb-1">
                  {notification.title}
                </div>
              )}
              <div className="text-sm text-gray-700">
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
