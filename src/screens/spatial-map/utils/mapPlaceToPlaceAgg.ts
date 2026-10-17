import {PlaceSource} from '@/src/api/dto/constants';
import type {MapPlaceItem} from '@/src/screens/place/select-map/types/selectMap.types';
import type {PlaceAgg} from '../types/spatialMap.types';

/**
 * Maps a select-map `MapPlaceItem` into a venue-sheet `PlaceAgg`.
 * Prefers an existing spend place when Google / app ids match.
 */
export function mapPlaceItemToPlaceAgg(
    item: MapPlaceItem,
    spendPlaces: PlaceAgg[]
): PlaceAgg {
    const googlePlaceId =
        item.provider === PlaceSource.GOOGLE && item.place_id?.trim()
            ? item.place_id.trim()
            : null;

    if (googlePlaceId) {
        const byGoogle = spendPlaces.find(
            (p) => p.googlePlaceId && p.googlePlaceId.trim() === googlePlaceId
        );
        if (byGoogle) {
            return {
                ...byGoogle,
                placeName: item.name || byGoogle.placeName,
                address: item.address || byGoogle.address,
                googlePlaceId,
                provider: PlaceSource.GOOGLE,
                providerId: item.provider_id ?? byGoogle.providerId ?? null,
                // Prefer already-saved user place id when known
                placeId: item.id ?? byGoogle.placeId,
            };
        }
    }

    if (item.id != null) {
        const byId = spendPlaces.find((p) => String(p.placeId) === String(item.id));
        if (byId) {
            return {
                ...byId,
                placeName: item.name || byId.placeName,
                address: item.address || byId.address,
                provider: item.provider ?? byId.provider,
                providerId: item.provider_id ?? byId.providerId ?? null,
                googlePlaceId: googlePlaceId ?? byId.googlePlaceId,
                placeId: item.id,
            };
        }
        // Saved on account but not in current spend catalog
        return {
            placeId: item.id,
            placeName: item.name,
            latitude: item.coordinate[1],
            longitude: item.coordinate[0],
            address: item.address,
            totalAmount: 0,
            expensesCount: 0,
            expenses: [],
            provider: item.provider,
            providerId: item.provider_id,
            googlePlaceId,
        };
    }

    const latitude = item.coordinate[1];
    const longitude = item.coordinate[0];

    return {
        placeId: googlePlaceId
            ? `g:${googlePlaceId}`
            : `pin:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
        placeName: item.name,
        latitude,
        longitude,
        address: item.address,
        totalAmount: 0,
        expensesCount: 0,
        expenses: [],
        provider: item.provider,
        providerId: item.provider_id,
        googlePlaceId,
    };
}
