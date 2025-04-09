// OtherPhoneApp.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, Alert } from 'react-native';
import { requestLocationPermission, getCurrentLocation } from './location';
import MapView, { Marker } from 'react-native-maps';

const OtherPhoneApp = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markerLocation, setMarkerLocation] = useState<{ latitude: number; longitude: number } | null>(null); // Nouvel état pour la position du marker
  const [PreviousLocation, setPreviousLocation] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);

  useEffect(() => {

    const sendLocation = async () => {
      try {
        console.log('Début de la fonction sendLocation');

        const hasPermission = await requestLocationPermission();
        console.log('Permission de localisation accordée ?', hasPermission);

        const currentLocation = await getCurrentLocation();
        console.log('Position actuelle obtenue :', currentLocation);

        if (!currentLocation || !currentLocation.coords) {
          console.log('Position actuelle non valide, arrêt de l\'envoi de la position');
          return;
        }

        const { latitude, longitude } = currentLocation.coords;

        // Vérifier si la nouvelle position est différente de la précédente
        if (PreviousLocation.length > 0 &&
          PreviousLocation[0].latitude === latitude &&
          PreviousLocation[0].longitude === longitude) {
          console.log('La position n\'a pas changé, pas d\'envoi.');
          return;
        }

        setLocation(currentLocation.coords);

        const serverIp = 'http://172.20.10.2:3001/location'; // REMPLACEZ CECI!
        console.log('Adresse IP du serveur utilisée :', serverIp);

        console.log('Données à envoyer au serveur :', currentLocation.coords);

        const response = await fetch(serverIp, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentLocation.coords),
        });

        console.log('Réponse du serveur reçue :', response);

        if (response.ok) {
          console.log('Localisation envoyée avec succès depuis l\'autre téléphone');
          setPreviousLocation([{ latitude, longitude }]); // Mettre à jour la position précédente
          await fetchMarkerLocation(); // Récupérer la position du marker immédiatement après avoir envoyé la position de l'autre téléphone
        } else {
          console.error('Erreur lors de l\'envoi de la localisation depuis l\'autre téléphone:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Erreur dans l\'application de l\'autre téléphone:', error);
      } finally {
        console.log('Fin de la fonction sendLocation');
      }
    };

    const fetchMarkerLocation = async () => {
      try {
        const response = await fetch('http://172.20.10.2:3001/marker-location'); // Remplace avec l'adresse IP de ton serveur
        if (response.ok) {
          const data = await response.json();
          setMarkerLocation({ latitude: data.latitude, longitude: data.longitude });
          console.log('Localisation du marker reçue:', data);
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

    const appatIntervalId = setInterval(checkAppatMessage, 1000); // Check every 1 seconds

    checkAppatMessage();

    sendLocation();

    const intervalId = setInterval(sendLocation, 3000);

    return () => {
      clearInterval(intervalId);
      clearInterval(appatIntervalId);
    };
  
  }, []);

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