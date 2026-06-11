import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LeafletView, MapLayer, MapMarker } from 'react-native-leaflet-view';

const LeafletLibertyScreen = () => {
    const [showMarker, setShowMarker] = useState(true);

    // 1. Define the Liberty Layer as a MapLayer object
    const libertyLayer: MapLayer = {
        baseLayer: true,
        url: "https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://openfreemap.org/">OpenFreeMap</a> contributors',
        id: 'liberty-tiles',
    };

    // 2. Define the marker
    const markers: MapMarker[] = showMarker ? [
        {
            id: '1',
            position: { lat: 41.9028, lng: 12.4964 },
            icon: '📍',
            size: [32, 32],
            title: 'Rome Marker'
        }
    ] : [];

    return (
        <View style={{ flex: 1 }}>
            <LeafletView
                mapCenterPosition={{ lat: 41.9028, lng: 12.4964 }}
                zoom={13}
                mapMarkers={markers}
                // Pass the layer inside the mapLayers array
                mapLayers={[libertyLayer]}
                doDebug={false}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: showMarker ? '#FF3B30' : '#2D8A5B' }]}
                    onPress={() => setShowMarker(!showMarker)}
                >
                    <Text style={styles.text}>
                        {showMarker ? "REMOVE MARKER" : "ADD MARKER"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 5,
    },
    text: { color: 'white', fontWeight: 'bold' }
});

export default LeafletLibertyScreen;