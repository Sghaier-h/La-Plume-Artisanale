import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  Text,
  FAB,
} from 'react-native-paper';
import { useAuth } from '../store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');

interface DashboardStats {
  mesTaches: number;
  tachesEnCours: number;
  ofsEnCours: number;
  ofsTerminesAujourdhui: number;
}

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    mesTaches: 0,
    tachesEnCours: 0,
    ofsEnCours: 0,
    ofsTerminesAujourdhui: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const [tachesRes, ofsRes] = await Promise.all([
        api.get('/taches/mes-taches'),
        api.get('/productions?statut=EN_COURS'),
      ]);

      const mesTaches = tachesRes.data.data?.length || 0;
      const tachesEnCours = tachesRes.data.data?.filter((t: any) => t.statut === 'EN_COURS').length || 0;
      const ofsEnCours = ofsRes.data.data?.length || 0;

      // OF terminés aujourd'hui
      const today = format(new Date(), 'yyyy-MM-dd');
      const ofsTerminesRes = await api.get(`/productions?statut=TERMINE&date_fin=${today}`);
      const ofsTerminesAujourdhui = ofsTerminesRes.data.data?.length || 0;

      setStats({
        mesTaches,
        tachesEnCours,
        ofsEnCours,
        ofsTerminesAujourdhui,
      });
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Title>Bonjour {user?.nom || user?.email}!</Title>
          <Paragraph style={styles.date}>
            {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
          </Paragraph>
          {user?.poste && (
            <Chip icon="briefcase" style={styles.chip}>
              {user.poste}
            </Chip>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="list" size={24} color="#fff" />
                </View>
                <View style={styles.statText}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {stats.mesTaches}
                  </Text>
                  <Text variant="bodySmall">Mes Tâches</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#10b981' }]}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                </View>
                <View style={styles.statText}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {stats.tachesEnCours}
                  </Text>
                  <Text variant="bodySmall">En Cours</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#f59e0b' }]}>
                  <Ionicons name="construct" size={24} color="#fff" />
                </View>
                <View style={styles.statText}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {stats.ofsEnCours}
                  </Text>
                  <Text variant="bodySmall">OF en Cours</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statContent}>
                <View style={[styles.statIcon, { backgroundColor: '#8b5cf6' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
                <View style={styles.statText}>
                  <Text variant="headlineMedium" style={styles.statNumber}>
                    {stats.ofsTerminesAujourdhui}
                  </Text>
                  <Text variant="bodySmall">OF Terminés</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  date: {
    marginTop: 4,
    color: '#6b7280',
  },
  chip: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: (width - 32) / 2,
    margin: 8,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
