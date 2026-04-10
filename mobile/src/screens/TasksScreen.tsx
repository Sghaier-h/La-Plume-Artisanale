import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  ActivityIndicator,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: number;
  libelle: string;
  description?: string;
  statut: string;
  date_debut?: string;
  date_fin?: string;
  priorite?: string;
  of_id?: number;
}

const TasksScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/taches/mes-taches');
      if (response.data.success && response.data.data) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'TERMINE':
        return '#10b981';
      case 'EN_COURS':
        return '#3b82f6';
      case 'EN_ATTENTE':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priorite?: string) => {
    switch (priorite) {
      case 'HAUTE':
        return '#ef4444';
      case 'MOYENNE':
        return '#f59e0b';
      case 'BASSE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TaskDetail' as never, { taskId: item.id } as never)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.taskHeader}>
            <Title style={styles.taskTitle}>{item.libelle}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.statut) }]}
              textStyle={{ color: '#fff' }}
            >
              {item.statut}
            </Chip>
          </View>
          {item.description && (
            <Paragraph style={styles.taskDescription} numberOfLines={2}>
              {item.description}
            </Paragraph>
          )}
          <View style={styles.taskFooter}>
            {item.date_debut && (
              <Paragraph style={styles.taskDate}>
                Début: {format(new Date(item.date_debut), 'dd MMM yyyy', { locale: fr })}
              </Paragraph>
            )}
            {item.priorite && (
              <Chip
                style={[styles.priorityChip, { backgroundColor: getPriorityColor(item.priorite) }]}
                textStyle={{ color: '#fff', fontSize: 10 }}
              >
                {item.priorite}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher une tâche..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>Aucune tâche trouvée</Paragraph>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  taskDescription: {
    marginBottom: 8,
    color: '#6b7280',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  priorityChip: {
    height: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
});

export default TasksScreen;
