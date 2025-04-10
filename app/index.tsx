import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Alert, Linking } from 'react-native';
import { requestLocationPermission, getCurrentLocation } from './location';
import MapView, { Marker } from 'react-native-maps';

const OtherPhoneApp = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markerLocation, setMarkerLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Nouvel état pour la position du marker
  const [PreviousLocation, setPreviousLocation] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastSentLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let locationInterval: NodeJS.Timeout | null = null;
    let appatInterval: NodeJS.Timeout | null = null;

    const sendLocation = async () => {
      try {
        const currentLocation = await getCurrentLocation();

        if (!currentLocation || !currentLocation.coords) {
          return;
        }

        const { latitude, longitude } = currentLocation.coords;

        // Utiliser la référence pour la comparaison
        if (lastSentLocationRef.current &&
            lastSentLocationRef.current.latitude === latitude &&
            lastSentLocationRef.current.longitude === longitude) {
          console.log('Coordonnées identiques, pas d\'envoi');
          return;
        }

        console.log('Coordonnées différentes détectées');
        console.log('Dernière position:', lastSentLocationRef.current);
        console.log('Nouvelle position:', { latitude, longitude });
        
        const serverIp = 'http://172.20.10.2:3001/location';
        const response = await fetch(serverIp, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentLocation.coords),
        });

        if (response.ok) {
          setLocation(currentLocation.coords);
          lastSentLocationRef.current = { latitude, longitude }; // Mettre à jour la référence
          console.log('Position envoyée avec succès');
          await fetchMarkerLocation();
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    const fetchMarkerLocation = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3001/marker-location'); // Remplace avec l'adresse IP de ton serveur
        if (response.ok) {
          const data = await response.json();
          setMarkerLocation({ latitude: data.latitude, longitude: data.longitude });
          // console.log('Localisation du marker reçue:', data);
        } else {
          console.log('Localisation du marker introuvable ou erreur lors de la récupération.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la localisation du marker:', error);
      }
    };

    const checkAppatMessage = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3001/airdrop-appat');
        if (response.ok) {
          const data = await response.json();
          if (data.message === 'Lache les appats') {
            Alert.alert('Alerte!', 'Lache les appats!');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du message d\'appât:', error);
      }
    };

    const initializeLocation = async () => {
      try {
        console.log('Vérification des permissions...');
        const hasPermission = await requestLocationPermission();
        
        if (hasPermission) {
          console.log('Permission GPS accordée, démarrage de l\'envoi...');
          setIsInitialized(true);
          
          // Test immédiat de la localisation
          const testLocation = await getCurrentLocation();
          if (testLocation) {
            console.log('Test de localisation réussi:', testLocation.coords);
            await sendLocation();
            locationInterval = setInterval(sendLocation, 3000);
            appatInterval = setInterval(checkAppatMessage, 1000);
          } else {
            console.error('Impossible d\'obtenir la position malgré les permissions');
          }
        } else {
          console.log('Permission GPS refusée');
          Alert.alert(
            "Permission requise",
            "L'application nécessite l'accès à votre position.",
            [
              {
                text: "AUTORISER",
                onPress: async () => {
                  const newPermission = await requestLocationPermission();
                  if (newPermission) {
                    initializeLocation();
                  }
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
      }
    };

    // Démarrer l'initialisation
    if (!isInitialized) {
      initializeLocation();
    }

    // Nettoyage
    return () => {
      if (locationInterval) clearInterval(locationInterval);
      if (appatInterval) clearInterval(appatInterval);
    };
  
  }, [isInitialized]);

  return (

    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.001,
              longitudeDelta: 0.001,
            }}
          >
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Lucas"
              description={`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
              pinColor='green'
            />

            {markerLocation && ( // Afficher le marker seulement si la position est disponible
              <Marker
                coordinate={{ latitude: markerLocation.latitude, longitude: markerLocation.longitude }}
                title="Appat"
                pinColor="red"
              />
            )}

            {/* <TouchableOpacity style={styles.button_centrer}>
              <Image source={require('@/images/Maps-Center-Direction-icon.png')} style={{ width: 20, height: 20 }} />
            </TouchableOpacity> */}

          </MapView>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  button_centrer: {
    position: 'absolute',
    top: '3%',
    right: '2%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },

});

export default OtherPhoneApp;