import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import api from '../services/api';

const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: BarCodeScannerResult) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      // Vérifier le format du code QR (exemple: OF-123 ou LOT-456)
      const match = data.match(/^(OF|LOT)-(\d+)$/i);
      
      if (match) {
        const [, typeCode, id] = match;
        
        if (typeCode.toUpperCase() === 'OF') {
          // Rediriger vers le détail de l'OF
          navigation.navigate('OFDetail' as never, { ofId: parseInt(id) } as never);
          Alert.alert('Succès', `OF ${id} trouvé`);
        } else if (typeCode.toUpperCase() === 'LOT') {
          // Afficher les informations du lot
          const response = await api.get(`/tracabilite-lots/${id}`);
          if (response.data.success) {
            Alert.alert('Lot trouvé', `Lot: ${response.data.data.numero_lot}`);
          }
        }
      } else {
        Alert.alert('Erreur', 'Format de code QR non reconnu');
      }
    } catch (error) {
      console.error('Erreur scan QR:', error);
      Alert.alert('Erreur', 'Impossible de traiter le code QR');
    } finally {
      setLoading(false);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Demande de permission caméra...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permission caméra refusée</Text>
        <Button
          mode="contained"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
          style={styles.button}
        >
          Demander la permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.instruction}>
            Scannez un code QR (OF ou LOT)
          </Text>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </View>
      </Camera>
      {scanned && (
        <Button
          mode="contained"
          onPress={() => setScanned(false)}
          style={styles.button}
        >
          Scanner à nouveau
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
  },
  instruction: {
    marginTop: 32,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  button: {
    marginTop: 16,
  },
});

export default QRScannerScreen;
