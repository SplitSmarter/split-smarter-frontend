import * as Location from 'expo-location';
import { useLocationStore, LocationCoords } from '@/src/store/locationStore';
import { permissionStore, PermissionStatus } from '@/src/store/permissionStore';
import { useCallback } from 'react';

export const useCurrentLocation = () => {
    const { requestLocation, openSettings } = permissionStore();
    const {
        currentLocation,
        isLocationLoading,
        locationError,
        setLocation,
        setLocationLoading,
        setLocationError
    } = useLocationStore();

    const refreshLocation = useCallback(async (forcePrompt = false): Promise<LocationCoords | null> => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            // 1. Get the current, real-time system permission status directly
            const currentPermission = await Location.getForegroundPermissionsAsync();
            let status = currentPermission.status as PermissionStatus;

            // 2. If it's undetermined and the user clicked the button, prompt them IN-APP
            if (status === 'undetermined') {
                if (forcePrompt) {
                    // This triggers the native in-app dialogue box (like your image picker)
                    const granted = await requestLocation();
                    if (!granted) return null;
                    status = 'granted';
                } else {
                    // Quietly exit on map mount
                    return null;
                }
            }

            // 3. If it's explicitly denied, only open settings if they clicked the button
            if (status === 'denied') {
                if (forcePrompt) {
                    openSettings();
                } else {
                    setLocationError("Location permission denied.");
                }
                return null;
            }

            // 4. Fetch coordinates if status is verified as granted
            if (status === 'granted') {
                const position = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });

                const coords: LocationCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                setLocation(coords);
                return coords;
            }

            return null;
        } catch (error: any) {
            console.error("Failed to fetch location:", error);
            setLocationError(error?.message || "Could not retrieve GPS coordinates.");
            return null;
        } finally {
            setLocationLoading(false);
        }
    }, [requestLocation, openSettings, setLocation, setLocationLoading, setLocationError]);

    return {
        location: currentLocation,
        isLoading: isLocationLoading,
        error: locationError,
        refreshLocation,
    };
};