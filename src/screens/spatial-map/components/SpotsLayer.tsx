import React from 'react';
import {Marker} from 'react-native-maps';
import {PlaceAgg} from '../types/spatialMap.types';

interface SpotsLayerProps {
    places: PlaceAgg[];
    onSelectPlace: (place: PlaceAgg) => void;
}

export function SpotsLayer({places = [], onSelectPlace}: SpotsLayerProps) {
    console.log(`[SpotsLayer Output] Rendering ${places.length} places:`, places.map((p) => p.placeName));

    if (!places || places.length === 0) return null;

    return (
        <>
            {places.map((place) => {
                const isValidCoord =
                    !isNaN(place.latitude) &&
                    !isNaN(place.longitude);

                if (!isValidCoord) {
                    console.warn(`[SpotsLayer] Invalid coordinates for place ${place.placeName}:`, place);
                    return null;
                }

                const description = place.address
                    ? `${place.address} • ₹${place.totalAmount || 0}`
                    : `₹${place.totalAmount || 0}`;

                return (
                    <Marker
                        key={`place-spot-${place.placeId}`}
                        coordinate={{latitude: place.latitude, longitude: place.longitude}}
                        title={place.placeName}
                        description={description}
                        onPress={() => onSelectPlace(place)}
                    />
                );
            })}
        </>
    );
}