import type {Region} from 'react-native-maps';
import type {PlaceAgg} from '../types/spatialMap.types';

export type ViewportStats = {
    totalSpent: number;
    placeCount: number;
};

/** Places whose coordinates fall inside the visible map region. */
export function getPlacesInViewport(
    places: PlaceAgg[],
    region: Region
): PlaceAgg[] {
    const latHalf = region.latitudeDelta / 2;
    const lngHalf = region.longitudeDelta / 2;
    const minLat = region.latitude - latHalf;
    const maxLat = region.latitude + latHalf;
    const minLng = region.longitude - lngHalf;
    const maxLng = region.longitude + lngHalf;

    return places.filter(
        (p) =>
            p.latitude >= minLat &&
            p.latitude <= maxLat &&
            p.longitude >= minLng &&
            p.longitude <= maxLng
    );
}

export function getViewportStats(
    places: PlaceAgg[],
    region: Region
): ViewportStats {
    const inView = getPlacesInViewport(places, region);
    const totalSpent = inView.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    return {
        totalSpent,
        placeCount: inView.length,
    };
}
