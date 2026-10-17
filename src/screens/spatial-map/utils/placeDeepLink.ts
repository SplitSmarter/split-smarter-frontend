import * as Linking from 'expo-linking';
import {PlaceSource} from '@/src/api/dto/constants';
import type {PlaceAgg} from '../types/spatialMap.types';

/** Expo Router path for the regional expense map tab. */
export const PLACE_MAP_PATH = '/(authenticated)/(tabs)/analytics' as const;

export type PlaceDeepLinkParams = {
    /** GOOGLE | CUSTOM */
    provider: string;
    /**
     * GOOGLE → Google Places ID (ChIJ…).
     * CUSTOM → app place id.
     */
    id: string;
};

/** Sample mock targets for manual deep-link tests (camera tab). */
export const SAMPLE_PLACE_LINKS = {
    google: {
        provider: PlaceSource.GOOGLE,
        id: 'ChIJ_mock_place_1', // Third Wave Coffee
    } satisfies PlaceDeepLinkParams,
    custom: {
        provider: PlaceSource.CUSTOM,
        id: '4', // Koramangala Metro
    } satisfies PlaceDeepLinkParams,
} as const;

export function hasGooglePlaceId(googlePlaceId?: string | null): boolean {
    return typeof googlePlaceId === 'string' && googlePlaceId.trim().length > 0;
}

/** Resolves which provider + id to put in a shareable app link. */
export function getPlaceShareTarget(venue: PlaceAgg): PlaceDeepLinkParams | null {
    const provider = venue.provider ?? PlaceSource.CUSTOM;

    if (provider === PlaceSource.GOOGLE || provider === 'GOOGLE') {
        if (hasGooglePlaceId(venue.googlePlaceId)) {
            return {
                provider: PlaceSource.GOOGLE,
                id: venue.googlePlaceId!.trim(),
            };
        }
        if (venue.placeId != null && String(venue.placeId).length > 0) {
            return {provider: PlaceSource.GOOGLE, id: String(venue.placeId)};
        }
        return null;
    }

    if (venue.placeId == null || String(venue.placeId).length === 0) return null;
    return {provider: PlaceSource.CUSTOM, id: String(venue.placeId)};
}

/** Absolute deep link (`myapp://…` / Expo Go URL) that opens the map on a place. */
export function buildPlaceDeepLinkUrl(params: PlaceDeepLinkParams): string {
    return Linking.createURL(PLACE_MAP_PATH, {
        queryParams: {
            provider: params.provider,
            id: params.id,
        },
    });
}

/** In-app router href for the map place deep link. */
export function buildPlaceRouterHref(params: PlaceDeepLinkParams) {
    return {
        pathname: PLACE_MAP_PATH,
        params: {
            provider: params.provider,
            id: params.id,
            ts: String(Date.now()),
        },
    };
}

/** Finds a place from provider + id (Google place id or custom app place id). */
export function findPlaceByDeepLink(
    places: PlaceAgg[],
    provider: string,
    id: string
): PlaceAgg | null {
    const needle = id.trim();
    if (!needle) return null;
    const p = provider.trim().toUpperCase();

    if (p === PlaceSource.GOOGLE || p === 'GOOGLE') {
        const byGoogleId = places.find(
            (pl) =>
                typeof pl.googlePlaceId === 'string' &&
                pl.googlePlaceId.trim() === needle
        );
        if (byGoogleId) return byGoogleId;

        return (
            places.find(
                (pl) =>
                    String(pl.placeId) === needle &&
                    (pl.provider === PlaceSource.GOOGLE || pl.provider === 'GOOGLE')
            ) ?? null
        );
    }

    if (p === PlaceSource.CUSTOM || p === 'CUSTOM') {
        return places.find((pl) => String(pl.placeId) === needle) ?? null;
    }

    return (
        places.find(
            (pl) =>
                typeof pl.googlePlaceId === 'string' &&
                pl.googlePlaceId.trim() === needle
        ) ??
        places.find((pl) => String(pl.placeId) === needle) ??
        null
    );
}
