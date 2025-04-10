import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    // Demander directement les permissions
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      // Si la permission est accordée, demander aussi la permission en arrière-plan
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      console.log('Permissions accordées:', { foreground: status, background: backgroundStatus });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Erreur lors de la demande de permission:', err);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};
