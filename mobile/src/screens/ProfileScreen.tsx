import React from 'react';
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
  Divider,
  List,
  Avatar,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../store/AuthContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login' as never);
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (user?.nom && user?.prenom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={getInitials()}
            style={styles.avatar}
          />
          <Title style={styles.name}>
            {user?.nom && user?.prenom
              ? `${user.prenom} ${user.nom}`
              : user?.email}
          </Title>
          <Chip icon="account" style={styles.chip}>
            {user?.role || 'Utilisateur'}
          </Chip>
          {user?.poste && (
            <Chip icon="briefcase" style={styles.chip}>
              {user.poste}
            </Chip>
          )}
          {user?.email && (
            <Paragraph style={styles.email}>{user.email}</Paragraph>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informations</Title>
          <List.Item
            title="Email"
            description={user?.email || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Rôle"
            description={user?.role || 'Non renseigné'}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
          {user?.poste && (
            <>
              <Divider />
              <List.Item
                title="Poste"
                description={user.poste}
                left={(props) => <List.Icon {...props} icon="briefcase" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Actions</Title>
          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#ef4444"
          >
            Se déconnecter
          </Button>
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
  card: {
    margin: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: '#2563eb',
    marginBottom: 16,
  },
  name: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  chip: {
    marginTop: 8,
    marginHorizontal: 4,
  },
  email: {
    marginTop: 8,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 16,
  },
});

export default ProfileScreen;
