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
import { useRoute } from '@react-navigation/native';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OF {
  id: number;
  numero_of: string;
  article_id: number;
  article?: any;
  quantite: number;
  statut: string;
  date_debut?: string;
  date_fin?: string;
  machine_id?: number;
  machine?: any;
}

const OFDetailScreen: React.FC = () => {
  const route = useRoute();
  const { ofId } = route.params as { ofId: number };
  const [of, setOf] = useState<OF | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOF();
  }, [ofId]);

  const loadOF = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/productions/${ofId}`);
      if (response.data.success && response.data.data) {
        setOf(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement OF:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'OF');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'TERMINE':
        return '#10b981';
      case 'EN_COURS':
        return '#3b82f6';
      case 'EN_ATTENTE':
        return '#f59e0b';
      case 'ANNULE':
        return '#ef4444';
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

  if (!of) {
    return (
      <View style={styles.loadingContainer}>
        <Paragraph>OF non trouvé</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{of.numero_of}</Title>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(of.statut) }]}
              textStyle={{ color: '#fff' }}
            >
              {of.statut}
            </Chip>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.details}>
            {of.article && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Article:</Paragraph>
                <Paragraph style={styles.detailValue}>{of.article.nom}</Paragraph>
              </View>
            )}
            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Quantité:</Paragraph>
              <Paragraph style={styles.detailValue}>{of.quantite}</Paragraph>
            </View>
            {of.machine && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Machine:</Paragraph>
                <Paragraph style={styles.detailValue}>{of.machine.nom}</Paragraph>
              </View>
            )}
            {of.date_debut && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Début:</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {format(new Date(of.date_debut), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </Paragraph>
              </View>
            )}
            {of.date_fin && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Fin:</Paragraph>
                <Paragraph style={styles.detailValue}>
                  {format(new Date(of.date_fin), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </Paragraph>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
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
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
});

export default OFDetailScreen;
