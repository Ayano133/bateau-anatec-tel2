// OtherPhoneApp.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { requestLocationPermission, getCurrentLocation } from './location'; // Vous devrez implémenter ceci

const OtherPhoneApp = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const sendLocation = async () => {
      try {
        console.log('Début de la fonction sendLocation'); // Log au début de la fonction

        const hasPermission = await requestLocationPermission();
        console.log('Permission de localisation accordée ?', hasPermission); // Log après la demande de permission

        if (hasPermission !== true ) {
          console.log('Permission de localisation non accordée, arrêt de l\'envoi de la position');
          return;
        }

        const currentLocation = await getCurrentLocation();
        console.log('Position actuelle obtenue :', currentLocation); // Log après l'obtention de la position

        if (!currentLocation || !currentLocation.coords) {
          console.log('Position actuelle non valide, arrêt de l\'envoi de la position');
          return;
        }

        setLocation(currentLocation.coords);

        // Remplacez par l'adresse IP de votre serveur
        const serverIp = 'http://10.119.255.18:3001/location'; // Exemple - REMPLACEZ CECI!
        console.log('Adresse IP du serveur utilisée :', serverIp); // Log de l'adresse IP

        console.log('Données à envoyer au serveur :', currentLocation.coords); // Log des données à envoyer

        const response = await fetch(serverIp, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentLocation.coords),
        });

        console.log('Réponse du serveur reçue :', response); // Log de la réponse du serveur

        if (response.ok) {
          console.log('Localisation envoyée avec succès depuis l\'autre téléphone');
        } else {
          console.error('Erreur lors de l\'envoi de la localisation depuis l\'autre téléphone:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Erreur dans l\'application de l\'autre téléphone:', error);
      } finally {
        console.log('Fin de la fonction sendLocation'); // Log à la fin de la fonction
      }
    };

    sendLocation(); // Envoyer la position immédiatement

    // Envoyer la position toutes les 10 secondes
    const intervalId = setInterval(sendLocation, 10000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View>
      {location ? (
        <Text>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </Text>
      ) : (
        <Text>Obtention de la localisation...</Text>
      )}
    </View>
  );
};

export default OtherPhoneApp;