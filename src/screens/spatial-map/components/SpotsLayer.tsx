import React from 'react';
import {Marker} from 'react-native-maps';
import {PlaceAgg} from '../types/spatialMap.types';

interface SpotsLayerProps {
    places: PlaceAgg[];
    onSelectPlace: (place: PlaceAgg) => void;
}

function SpotsLayerComponent({places = [], onSelectPlace}: SpotsLayerProps) {
    if (!places || places.length === 0) return null;

    return (
        <>
            {places.map((place) => {
                const isValidCoord =
                    !Number.isNaN(place.latitude) &&
                    !Number.isNaN(place.longitude);

                if (!isValidCoord) return null;

                const description = place.address
                    ? `${place.address} • ₹${place.totalAmount || 0}`
                    : `₹${place.totalAmount || 0}`;

                return (
                    <Marker
                        key={`place-spot-${place.placeId}`}
                        coordinate={{
                            latitude: place.latitude,
                            longitude: place.longitude,
                        }}
                        title={place.placeName}
                        description={description}
                        tracksViewChanges={false}
                        onPress={() => onSelectPlace(place)}
                    />
                );
            })}
        </>
    );
}

export const SpotsLayer = React.memo(SpotsLayerComponent);
