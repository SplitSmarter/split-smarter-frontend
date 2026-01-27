import React, {useRef, useState} from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import * as MapLibreGL from '@maplibre/maplibre-react-native';

interface SavedPlace {
    id: string;
    coordinate: [number, number];
    address: string;
}

const MapScreen = () => {
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
    const mapRef = useRef<MapLibreGL.MapViewRef>(null);
    const mapStyle = "https://tiles.openfreemap.org/styles/liberty";

    const getSearchParams = async () => {
        if (!mapRef.current) return;

        // 1. Get the center [lng, lat]
        const center = await mapRef.current.getCenter();

        // 2. Get the bounding box [[neLng, neLat], [swLng, swLat]]
        const bounds = await mapRef.current.getVisibleBounds();

        // 3. Calculate Radius (Distance from center to North-East corner)
        const radius = calculateDistance(
            center[1], center[0],
            bounds[0][1], bounds[0][0]
        );

        console.log("Params for Backend:", {
            lat: center[1],
            lng: center[0],
            radius: Math.round(radius), // in meters
        });

        return { lat: center[1], lng: center[0], radius };
    };

    // Helper: Haversine formula to get distance in meters
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // 1. Reverse Geocode the pressed location to get an address
    const getAddress = async (lng: number, lat: number) => {
        try {
            const response = await fetch(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
            const data = await response.json();
            if (data.features.length > 0) {
                const p = data.features[0].properties;
                return `${p.name || ''} ${p.street || ''}, ${p.city || ''}`.trim() || "Unknown Location";
            }
        } catch (e) {
            console.error(e);
        }
        return "Unknown Location";
    };

    const handleLongPress = async (feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        const address = await getAddress(lng, lat);

        Alert.alert("Save Place", `Save this spot?\n${address}`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Save",
                onPress: () => {
                    const newPlace: SavedPlace = {
                        id: Date.now().toString(),
                        coordinate: [lng, lat],
                        address: address,
                    };
                    setSavedPlaces([...savedPlaces, newPlace]);
                }
            }
        ]);
    };

    const deletePlace = (id: string) => {
        setSavedPlaces(savedPlaces.filter(p => p.id !== id));
    };

    return (
        <View style={styles.container}>
            <MapLibreGL.MapView
                ref={mapRef}
                style={styles.map}
                mapStyle={mapStyle}
                onLongPress={handleLongPress}
                onRegionIsChanging={getSearchParams}
            >
                <MapLibreGL.Camera zoomLevel={12} centerCoordinate={[12.4964, 41.9028]} />

                {savedPlaces.map((place) => (
                    <MapLibreGL.PointAnnotation
                        key={place.id}
                        id={place.id}
                        coordinate={place.coordinate}
                    >
                        {/* The Visible Marker */}
                        <View style={styles.markerCircle} />

                        {/* The Popup (Callout) */}
                        <MapLibreGL.Callout title={place.address}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{place.address}</Text>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => deletePlace(place.id)}
                                >
                                    <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </MapLibreGL.Callout>
                    </MapLibreGL.PointAnnotation>
                ))}
            </MapLibreGL.MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    markerCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: 'white',
    },
    calloutContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        minWidth: 150,
        alignItems: 'center',
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: '#fee2e2',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 12,
    }
});

export default MapScreen;