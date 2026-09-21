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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
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

const OFsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ofs, setOfs] = useState<OF[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOFs();
  }, []);

  const loadOFs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/productions?statut=EN_COURS');
      if (response.data.success && response.data.data) {
        setOfs(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement OF:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOFs();
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

  const filteredOFs = ofs.filter(
    (of) =>
      of.numero_of.toLowerCase().includes(searchQuery.toLowerCase()) ||
      of.article?.nom?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOF = ({ item }: { item: OF }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OFDetail' as never, { ofId: item.id } as never)}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.ofHeader}>
            <View style={styles.ofTitleContainer}>
              <Title style={styles.ofTitle}>{item.numero_of}</Title>
              {item.article && (
                <Paragraph style={styles.articleName}>{item.article.nom}</Paragraph>
              )}
            </View>
            <Chip
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.statut) }]}
              textStyle={{ color: '#fff' }}
            >
              {item.statut}
            </Chip>
          </View>
          <View style={styles.ofDetails}>
            <Paragraph style={styles.detail}>
              Quantité: {item.quantite}
            </Paragraph>
            {item.machine && (
              <Paragraph style={styles.detail}>
                Machine: {item.machine.nom}
              </Paragraph>
            )}
            {item.date_debut && (
              <Paragraph style={styles.detail}>
                Début: {format(new Date(item.date_debut), 'dd MMM yyyy', { locale: fr })}
              </Paragraph>
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
        placeholder="Rechercher un OF..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredOFs}
        renderItem={renderOF}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Paragraph style={styles.emptyText}>Aucun OF trouvé</Paragraph>
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
  ofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ofTitleContainer: {
    flex: 1,
  },
  ofTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  articleName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  ofDetails: {
    marginTop: 8,
  },
  detail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
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

export default OFsScreen;
