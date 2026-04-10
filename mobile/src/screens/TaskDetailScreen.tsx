import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Task {
  id: number;
  libelle: string;
  description?: string;
  statut: string;
  priorite?: string;
  date_debut?: string;
  date_fin?: string;
  date_limite?: string;
  of_id?: number;
  create_date?: string;
}

const TaskDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId } = route.params as { taskId: number };
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/taches/${taskId}`);
      if (response.data.success && response.data.data) {
        setTask(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement tâche:', error);
      Alert.alert('Erreur', 'Impossible de charger la tâche');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      setActionLoading(true);
      await api.post(`/taches/${taskId}/demarrer`);
      Alert.alert('Succès', 'Tâche démarrée');
      loadTask();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la tâche');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishTask = async () => {
    Alert.alert(
      'Terminer la tâche',
      'Êtes-vous sûr de vouloir terminer cette tâche ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Terminer',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.post(`/taches/${taskId}/terminer`);
              Alert.alert('Succès', 'Tâche terminée');
              loadTask();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de terminer la tâche');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>Tâche non trouvée</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{task.libelle}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(task.statut) }]}
              textStyle={{ color: '#fff' }}
            >
              {task.statut}
            </Chip>
          </View>
          {task.description && (
            <Paragraph style={styles.description}>{task.description}</Paragraph>
          )}
          <Divider style={styles.divider} />
          <View style={styles.details}>
            {task.priorite && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Priorité:</Paragraph>
                <Chip style={styles.chip}>{task.priorite}</Chip>
              </View>
            )}
            {task.date_debut && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Début:</Paragraph>
                <Paragraph>
                  {format(new Date(task.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </Paragraph>
              </View>
            )}
            {task.date_limite && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Date limite:</Paragraph>
                <Paragraph>
                  {format(new Date(task.date_limite), 'dd MMMM yyyy', { locale: fr })}
                </Paragraph>
              </View>
            )}
            {task.date_fin && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Fin:</Paragraph>
                <Paragraph>
                  {format(new Date(task.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </Paragraph>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {task.statut === 'EN_ATTENTE' && (
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleStartTask}
              loading={actionLoading}
              disabled={actionLoading}
              style={styles.actionButton}
            >
              Démarrer la tâche
            </Button>
          </Card.Content>
        </Card>
      )}

      {task.statut === 'EN_COURS' && (
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleFinishTask}
              loading={actionLoading}
              disabled={actionLoading}
              buttonColor="#10b981"
              style={styles.actionButton}
            >
              Terminer la tâche
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
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
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  description: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  divider: {
    marginVertical: 16,
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#6b7280',
  },
  chip: {
    backgroundColor: '#e5e7eb',
  },
  actionButton: {
    marginTop: 8,
  },
});

export default TaskDetailScreen;
