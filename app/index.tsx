// OtherPhoneApp.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { requestLocationPermission, getCurrentLocation } from './location'; // Vous devrez implémenter ceci
import MapView, { Marker } from 'react-native-maps';

const OtherPhoneApp = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [markers, setMarkers] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number; title?: string } | null>(null);

  useEffect(() => {
    const sendLocation = async () => {
      try {
        console.log('Début de la fonction sendLocation'); // Log au début de la fonction

        const hasPermission = await requestLocationPermission();
        console.log('Permission de localisation accordée ?', hasPermission); // Log après la demande de permission

        // if (hasPermission !== true ) {
        //   console.log('Permission de localisation non accordée, arrêt de l\'envoi de la position');
        //   return;
        // }

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
    const intervalId = setInterval(sendLocation, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkers((prevMarkers) => {
      if (prevMarkers.length < 2) {
        return [...prevMarkers, { latitude, longitude, title: `Position ${prevMarkers.length + 1}` }];
      }
      return prevMarkers;
    });
  };

  const handleMarkerPress = (marker: { latitude: number; longitude: number; title?: string }) => {
    setSelectedMarker(marker);
  };

  const handleRemoveRectangle = () => {
    setSelectedMarker(null);
  };

  const handleRemoveMarker = () => {
    if (selectedMarker) {
      setMarkers((prevMarkers) =>
        prevMarkers.filter(
          (marker) =>
            marker.latitude !== selectedMarker.latitude ||
            marker.longitude !== selectedMarker.longitude
        )
      );
      setSelectedMarker(null);
    }
  };

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
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Lucas"
              description={`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
              pinColor='green'
            />

            {markers.map((marker, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={`Position ${index + 1}`}
                onPress={() => handleMarkerPress(marker)}
              />
            ))}

          </MapView>
        ) : (
          <Text>Loading...</Text>
        )}

{selectedMarker && (
          <View style={styles.rectangle}>
            <View style={styles.rectangle_head}>
              <Text style={styles.head_titre}>{selectedMarker.title}</Text>
              <TouchableOpacity style={styles.button_fermer} onPress={handleRemoveRectangle}>
                <Text style={styles.button_fermer_texte}>Fermer</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rectangle_gps}>
              <Text style={styles.text_titre_gps}>Latitude:</Text>
              <Text style={styles.coordonnées}>{selectedMarker.latitude}</Text>
              <Text style={styles.text_titre_gps}>Longitude:</Text>
              <Text style={styles.coordonnées}>{selectedMarker.longitude}</Text>
            </View>

            <View style={styles.rectangle_button}>
              <TouchableOpacity style={styles.button_sup} onPress={handleRemoveMarker}>
                <Text style={styles.button_sup_texte}>Supprimer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button_ALLER}>
                <Text style={styles.button_ALLER_texte}>Aller à la position</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  rectangle: {
    position: 'absolute',
    bottom: '32%',
    left: '10%',
    width: '80%',
    backgroundColor: 'rgba(143, 138, 138, 0.8)',
    borderColor: 'skyblue',
    borderWidth: 1,
    borderRadius: 10,
  },

  rectangle_head: {
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },

  head_titre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  button_fermer: {
    backgroundColor: 'skyblue',
    padding: 10,
    borderRadius: 50,
    width: 90,
  },

  button_fermer_texte: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  rectangle_gps: {
    backgroundColor: 'transparent',
    paddingLeft: 20,
  },

  text_titre_gps: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textDecorationLine: 'underline',
  },

  coordonnées: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
    paddingBottom: 10,
  },

  rectangle_button: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 20,
  },

  button_sup: {
    backgroundColor: 'skyblue',
    padding: 8,
    borderRadius: 50,
  },

  button_sup_texte: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },

  button_ALLER: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 50,
  },

  button_ALLER_texte: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'skyblue',
  },
});

export default OtherPhoneApp;





// "use client"
// import React, { useState, useEffect } from 'react';
// import { initDatabase, saveLocation, fetchLocations } from '@/app/database';
// import { requestLocationPermission, getCurrentLocation, } from '@/app/location';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// const App = () => {
//   const [location, setLocation] = useState<{ coords: { latitude: number; longitude: number } } | null>(null);
//   const [markers, setMarkers] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);
//   const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number; title?: string } | null>(null);

//   useEffect(() => {
//     // Initialiser la base de données
//     initDatabase();

//     // Récupérer la localisation et la sauvegarder
//     (async () => {
//       try {
//         await requestLocationPermission();
//         const location = await getCurrentLocation();
//         setLocation(location);
//         await saveLocation(location.coords.latitude, location.coords.longitude);

//         // Récupérer et afficher les localisations sauvegardées
//         const savedLocations = await fetchLocations();
//         console.log('Saved locations:', savedLocations);
//       } catch (error) {
//         console.error('Error:', error);
//       }
//     })();
//   }, []);

//   const handleMapPress = (event: any) => {
//     const { latitude, longitude } = event.nativeEvent.coordinate;
//     setMarkers((prevMarkers) => {
//       if (prevMarkers.length < 2) {
//         return [...prevMarkers, { latitude, longitude, title: `Position ${prevMarkers.length + 1}` }];
//       }
//       return prevMarkers;
//     });
//   };

//   const handleMarkerPress = (marker: { latitude: number; longitude: number; title?: string }) => {
//     setSelectedMarker(marker);
//   };

//   const handleRemoveRectangle = () => {
//     setSelectedMarker(null);
//   };

//   const handleRemoveMarker = () => {
//     if (selectedMarker) {
//       setMarkers((prevMarkers) =>
//         prevMarkers.filter(
//           (marker) =>
//             marker.latitude !== selectedMarker.latitude ||
//             marker.longitude !== selectedMarker.longitude
//         )
//       );
//       setSelectedMarker(null);
//     }
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {location ? (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//               latitudeDelta: 0.001,
//               longitudeDelta: 0.001,
//             }}
//             onPress={handleMapPress} // Ajouter l'événement onPress
//             // mapType="satellite"
//           >
          
//           <Marker
//             coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
//             title="Lucas"
//             description="HOME"
//             pinColor='blue'
//           />
//           {markers.map((marker, index) => (
//             <Marker
//               key={index}
//               coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
//               title={`Position ${index + 1}`}
//               onPress={() => handleMarkerPress(marker)}
//             />
//           ))}
//         </MapView>

//         ) : (
//           <Text>Loading...</Text>
//         )}

//         {selectedMarker && (
//           <View style={styles.rectangle}>
//             <View style={styles.rectangle_head}>
//               <Text style={styles.head_titre}>{selectedMarker.title}</Text>
//               <TouchableOpacity style={styles.button_fermer} onPress={handleRemoveRectangle}>
//                 <Text style={styles.button_fermer_texte}>Fermer</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.rectangle_gps}>
//               <Text style={styles.text_titre_gps}>Latitude:</Text>
//               <Text style={styles.coordonnées}>{selectedMarker.latitude}</Text>
//               <Text style={styles.text_titre_gps}>Longitude:</Text>
//               <Text style={styles.coordonnées}>{selectedMarker.longitude}</Text>
//             </View>

//             <View style={styles.rectangle_button}>
//               <TouchableOpacity style={styles.button_sup} onPress={handleRemoveMarker}>
//                 <Text style={styles.button_sup_texte}>Supprimer</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.button_ALLER}>
//                 <Text style={styles.button_ALLER_texte}>Aller à la position</Text>
//               </TouchableOpacity>

//             </View>
//           </View>
//         )}

//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   rectangle: {
//     position: 'absolute',
//     bottom: '32%',
//     left: '10%',
//     width: '80%',
//     backgroundColor: 'rgba(143, 138, 138, 0.8)',
//     borderColor: 'skyblue',
//     borderWidth: 1,
//     borderRadius: 10,
//   },

//   rectangle_head:{
//     padding: 20,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexDirection: 'row',
//     width: '100%',
//   },

//   head_titre:{
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//   },

//   button_fermer:{
//     backgroundColor: 'skyblue',
//     padding: 10,
//     borderRadius: 50,
//     width: 90,
//   },

//   button_fermer_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//   },

//   rectangle_gps: {
//     backgroundColor: 'transparent',
//     paddingLeft: 20,
//   },

//   text_titre_gps:{
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//     textDecorationLine: 'underline',
//   },

//   coordonnées:{
//     fontSize: 15,
//     color: 'white',
//     fontWeight: 'bold',
//     paddingBottom: 10,
//   },

//   rectangle_button: {
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     padding: 20,
//   },

//   button_sup:{
//     backgroundColor: 'skyblue',
//     padding: 8,
//     borderRadius: 50,
//   },

//   button_sup_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'white',
//   },

//   button_ALLER:{
//     backgroundColor: 'white',
//     padding: 8,
//     borderRadius: 50,
//   },

//   button_ALLER_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'skyblue',
//   },
// });

// export default App;



















// "use client"
// import React, { useState, useEffect, Component } from 'react';
// import { initDatabase, saveLocation, fetchLocations } from '@/app/database';
// import { requestLocationPermission, getCurrentLocation } from '@/app/location';
// import MapView, { Marker } from 'react-native-maps';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { requestOtherPhoneLocationPermission, getOtherPhoneLocation } from '@/app/otherPhoneLocation';

// const App = () => {
//   const [location, setLocation] = useState<{ coords: { latitude: number; longitude: number } } | null>(null);
//   const [markers, setMarkers] = useState<{ latitude: number; longitude: number; title?: string }[]>([]);
//   const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number; title?: string } | null>(null);
//   const [otherPhoneLocation, setOtherPhoneLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [apiLocation, setApiLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//   const [otherPhonePermissionGranted, setOtherPhonePermissionGranted] = useState(false);
  
//   useEffect(() => {
//     initDatabase();

//     const getLocationAndSendToApi = async () => {
//       try {
//         await requestLocationPermission();
//         const currentLocation = await getCurrentLocation();
//         setLocation(currentLocation);
//         await saveLocation(currentLocation.coords.latitude, currentLocation.coords.longitude);

//         const savedLocations = await fetchLocations();
//         console.log('Positions enregistrées :', savedLocations);

//         if (otherPhonePermissionGranted) {
//           const otherLocation = await getOtherPhoneLocation();
//           setOtherPhoneLocation(otherLocation);
//           await saveLocation(otherLocation.latitude, otherLocation.longitude);
//           sendLocationToApi(otherLocation);
//         }
//       } catch (error) {
//         console.error('Error fetching location:', error);
//       }
//     };

//     const fetchLocationFromApi = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/location');
//         console.log('API response:', response);
//         if (!response.ok) {
//           console.error('Error fetching API location. Status:', response.status);
//           return;
//         }
//         const data = await response.json();
//         console.log('API location data:', data);
//         setApiLocation(data);
//       } catch (error) {
//         console.error('Error fetching API location:', error);
//       }
//     };

//     const sendLocationToApi = async (location: { latitude: number; longitude: number }) => {
//       try {
//         // Check API availability before sending
//         const apiStatus = await checkApiStatus();
//         if (!apiStatus) {
//           console.error('API is not reachable. Location will be stored locally.');
//           saveLocationLocally(location); // Store location locally
//           return;
//         }

//         const response = await fetch('http://localhost:3000/location', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(location),
//         });
//         if (!response.ok) {
//           console.error('Error sending location to API. Status:', response.status);
//           return;
//         }
//         console.log('Location sent to API successfully.');
//       } catch (error: any) {
//         console.error('Error sending location to API:', error);
//         console.log('Retrying in 5 seconds...');
//         setTimeout(() => {
//           sendLocationToApi(location);
//         }, 5000);
//       }
//     };

//     const checkApiStatus = async () => {
//       try {
//         const response = await fetch('http://localhost:3000/location', { method: 'HEAD' });
//         return response.ok;
//       } catch (error) {
//         console.error('API status check failed:', error);
//         return false;
//       }
//     };

//     const saveLocationLocally = async (location: { latitude: number; longitude: number }) => {
//       // Implement local storage mechanism here (e.g., using AsyncStorage)
//       console.log('Location saved locally:', location);
//     };

//     const requestOtherPhonePerm = async () => {
//       const permission = await requestOtherPhoneLocationPermission();
//       setOtherPhonePermissionGranted(permission);
//     };

//     requestOtherPhonePerm();
//     getLocationAndSendToApi();
//     fetchLocationFromApi();

//   }, [otherPhonePermissionGranted]);

//   const handleMapPress = (event: any) => {
//     const { coordinate } = event.nativeEvent;
//     setMarkers(prevMarkers =>
//       prevMarkers.length < 4
//         ? [...prevMarkers, { latitude: coordinate.latitude, longitude: coordinate.longitude, title: `Position ${prevMarkers.length + 1}` }]
//         : prevMarkers
//     );
//   };

//   const handleMarkerPress = (marker: { latitude: number; longitude: number; title?: string }) => {
//     setSelectedMarker(marker);
//   };

//   const handleRemoveRectangle = () => {
//     setSelectedMarker(null);
//   };

//   const handleRemoveMarker = () => {
//     if (selectedMarker) {
//       setMarkers(prevMarkers =>
//         prevMarkers.filter(
//           marker =>
//             marker.latitude !== selectedMarker.latitude ||
//             marker.longitude !== selectedMarker.longitude
//         )
//       );
//       setSelectedMarker(null);
//     }
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {location ? (
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//               latitudeDelta: 0.001,
//               longitudeDelta: 0.001,
//             }}
//             onPress={handleMapPress}
//           >

//             <Marker
//               coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
//               title="Mattéo"
//               description="HOME"
//               pinColor='blue'
//             />
//             {markers.map((marker, index) => (
//               <Marker
//                 key={index}
//                 coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
//                 title={`Position ${index + 1}`}
//                 onPress={() => handleMarkerPress(marker)}
//               />
//             ))}
//             {otherPhoneLocation && (
//               <Marker
//                 coordinate={otherPhoneLocation}
//                 title="Lucas"
//                 pinColor="green"
//               />
//             )}
//             {apiLocation && (
//               <Marker
//                 coordinate={apiLocation}
//                 title="API Location"
//                 pinColor="orange"
//               />
//             )}
//           </MapView>
//         ) : (
//           <Text>Chargement...</Text>
//         )}

//         {selectedMarker && (
//           <View style={styles.rectangle}>
//             <View style={styles.rectangle_head}>
//               <Text style={styles.head_titre}>{selectedMarker.title}</Text>
//               <TouchableOpacity style={styles.button_fermer} onPress={handleRemoveRectangle}>
//                 <Text style={styles.button_fermer_texte}>Fermer</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.rectangle_gps}>
//               <Text style={styles.text_titre_gps}>Latitude:</Text>
//               <Text style={styles.coordonnées}>{selectedMarker.latitude}</Text>
//               <Text style={styles.text_titre_gps}>Longitude:</Text>
//               <Text style={styles.coordonnées}>{selectedMarker.longitude}</Text>
//             </View>

//             <View style={styles.rectangle_button}>
//               <TouchableOpacity style={styles.button_sup} onPress={handleRemoveMarker}>
//                 <Text style={styles.button_sup_texte}>Supprimer</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.button_ALLER}>
//                 <Text style={styles.button_ALLER_texte}>Aller à la position</Text>
//               </TouchableOpacity>

//             </View>
//           </View>
//         )}

//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     flex: 1,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   rectangle: {
//     position: 'absolute',
//     bottom: '32%',
//     left: '10%',
//     width: '80%',
//     backgroundColor: 'rgba(143, 138, 138, 0.8)',
//     borderColor: 'skyblue',
//     borderWidth: 1,
//     borderRadius: 10,
//   },

//   rectangle_head:{
//     padding: 20,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexDirection: 'row',
//     width: '100%',
//   },

//   head_titre:{
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//   },

//   button_fermer:{
//     backgroundColor: 'skyblue',
//     padding: 10,
//     borderRadius: 50,
//     width: 90,
//   },

//   button_fermer_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'white',
//     textAlign: 'center',
//   },

//   rectangle_gps: {
//     backgroundColor: 'transparent',
//     paddingLeft: 20,
//   },

//   text_titre_gps:{
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: 'white',
//     textDecorationLine: 'underline',
//   },

//   coordonnées:{
//     fontSize: 15,
//     color: 'white',
//     fontWeight: 'bold',
//     paddingBottom: 10,
//   },

//   rectangle_button: {
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     padding: 20,
//   },

//   button_sup:{
//     backgroundColor: 'skyblue',
//     padding: 8,
//     borderRadius: 50,
//   },

//   button_sup_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'white',
//   },

//   button_ALLER:{
//     backgroundColor: 'white',
//     padding: 8,
//     borderRadius: 50,
//   },

//   button_ALLER_texte:{
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: 'skyblue',
//   },
// });

// export default App;