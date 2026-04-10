/**
 * TaskNotification - Notifications pour les tâches
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import api from '../services/api';

interface TaskNotification {
  id: number;
  task_id: number;
  task_name: string;
  assigned_to: number;
  status: 'pending' | 'done' | 'overdue';
  due_date?: string;
  created_at: string;
}

const TaskNotification: React.FC = () => {
  const { addNotification } = useApp();
  const [tasks, setTasks] = useState<TaskNotification[]>([]);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    tasks.forEach(task => {
      if (task.status === 'done') {
        addNotification({
          id: `task-done-${task.id}`,
          type: 'success',
          title: 'Tâche terminée',
          message: `${task.task_name} a été marquée comme terminée`,
          duration: 5000,
        });
      } else if (task.status === 'overdue') {
        addNotification({
          id: `task-overdue-${task.id}`,
          type: 'warning',
          title: 'Tâche en retard',
          message: `${task.task_name} est en retard`,
          duration: 10000,
        });
      }
    });
  }, [tasks, addNotification]);

  const loadTasks = async () => {
    try {
      // TODO: Créer l'endpoint API pour les tâches
      // const response = await api.get('/tasks/notifications');
      // setTasks(response.data || []);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return null; // Les notifications sont gérées via le NotificationCenter
};

export default TaskNotification;
