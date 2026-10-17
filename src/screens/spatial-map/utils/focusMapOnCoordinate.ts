import type {RefObject} from 'react';
import type MapView from 'react-native-maps';
import {ANIMATE_REGION_DELTA} from '@/src/screens/place/select-map/constants/selectMap.constants';

/** Same zoom as Google place pick / search select on the regional map. */
export function focusMapOnCoordinate(
    mapRef: RefObject<MapView | null>,
    latitude: number,
    longitude: number,
    durationMs = 400
): void {
    mapRef.current?.animateToRegion(
        {
            latitude,
            longitude,
            latitudeDelta: ANIMATE_REGION_DELTA,
            longitudeDelta: ANIMATE_REGION_DELTA,
        },
        durationMs
    );
}
