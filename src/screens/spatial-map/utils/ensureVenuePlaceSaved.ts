import {PlaceSource} from '@/src/api/dto/constants';
import type {AddPlaceRequest, LocationDetails} from '@/src/api/dto/user/place';
import {CreatePlaceApi, GetUserPlaceByIdApi} from '@/src/api/user/place/location';
import {GetGooglePlaceDetailsApi} from '@/src/api/user/place/search_place';
import type {PlaceAgg} from '../types/spatialMap.types';

export type SavedVenuePlace = {
    id: number;
    name: string;
    provider: PlaceSource;
    providerId: number | null;
    googlePlaceId: string | null;
};

/** True when `placeId` is a persisted user place id (not a synthetic g:/pin: key). */
export function resolveExistingUserPlaceId(venue: PlaceAgg): number | null {
    if (typeof venue.placeId === 'number' && Number.isFinite(venue.placeId)) {
        return venue.placeId;
    }
    if (typeof venue.placeId === 'string' && /^\d+$/.test(venue.placeId.trim())) {
        return Number(venue.placeId.trim());
    }
    return null;
}

function buildCustomDetails(
    venue: PlaceAgg,
    details?: LocationDetails | null
): NonNullable<AddPlaceRequest['custom_details']> {
    return {
        name: details?.name || venue.placeName,
        description: '',
        address: details?.address || venue.address || '',
        geo: details?.geo || {
            latitude: venue.latitude,
            longitude: venue.longitude,
        },
        country: details?.country || '',
        city: details?.city || '',
        state: details?.state || '',
        country_code: details?.country_code || '',
    };
}

/**
 * Ensures the venue exists as a saved user place, then returns the app place id
 * suitable for expense draft (`ExpenseLocation.id`).
 *
 * - Already saved (numeric place id) → verify / reuse
 * - GOOGLE → enrich via Google place id, then CreatePlaceApi with provider_id
 * - CUSTOM → CreatePlaceApi with custom_details geo
 */
export async function ensureVenuePlaceSaved(
    venue: PlaceAgg
): Promise<SavedVenuePlace> {
    const existingId = resolveExistingUserPlaceId(venue);
    if (existingId != null) {
        try {
            const existing = await GetUserPlaceByIdApi(existingId);
            if (existing.data?.id != null) {
                const googlePlaceId =
                    venue.googlePlaceId?.trim() ||
                    (existing.data as LocationDetails & {google_place_id?: string | null})
                        .google_place_id ||
                    null;
                return {
                    id: existing.data.id,
                    name: existing.data.name || venue.placeName,
                    provider: existing.data.provider || venue.provider || PlaceSource.CUSTOM,
                    providerId: existing.data.provider_id ?? venue.providerId ?? null,
                    googlePlaceId,
                };
            }
        } catch {
            // Offline / mock: still use the known user place id
        }
        return {
            id: existingId,
            name: venue.placeName,
            provider:
                venue.provider === PlaceSource.GOOGLE || venue.provider === 'GOOGLE'
                    ? PlaceSource.GOOGLE
                    : PlaceSource.CUSTOM,
            providerId: venue.providerId ?? null,
            googlePlaceId: venue.googlePlaceId?.trim() || null,
        };
    }

    const provider =
        venue.provider === PlaceSource.GOOGLE || venue.provider === 'GOOGLE'
            ? PlaceSource.GOOGLE
            : PlaceSource.CUSTOM;

    let details: LocationDetails | null = null;
    let providerId = venue.providerId ?? null;
    const googlePlaceId = venue.googlePlaceId?.trim() || null;

    if (provider === PlaceSource.GOOGLE && googlePlaceId) {
        const google = await GetGooglePlaceDetailsApi(googlePlaceId);
        if (google.data) {
            details = google.data;
            providerId = google.data.provider_id ?? providerId;
            // Backend may already have this Google place linked to a user place
            if (google.data.id != null) {
                return {
                    id: google.data.id,
                    name: google.data.name || venue.placeName,
                    provider: PlaceSource.GOOGLE,
                    providerId: google.data.provider_id ?? providerId,
                    googlePlaceId,
                };
            }
        }
    }

    const request: AddPlaceRequest = {
        name: details?.name || venue.placeName,
        description: '',
        provider,
        provider_id: provider === PlaceSource.GOOGLE ? providerId : null,
        custom_details: buildCustomDetails(venue, details),
    };

    const created = await CreatePlaceApi(request);
    if (!created.data?.id) {
        throw new Error(created.message || 'Failed to save place');
    }

    return {
        id: created.data.id,
        name: request.name,
        provider,
        providerId,
        googlePlaceId,
    };
}
