import {SearchPlaceApi} from '@/src/api/user/place/search_place';
import {PlaceSource} from '@/src/api/dto/constants';

export interface EnrichedPlaceDetails {
    name: string;
    description: string;
    address: string;
    geo: {
        latitude: number;
        longitude: number;
    };
    city: string;
    state: string;
    country: string;
    country_code: string;
    provider: PlaceSource;
    provider_id: number | null;
    photos: {id: string; url: string}[];
    rating: number | null;
    id: number | null; // Available if the place has been saved to your DB
}

interface FetchPlaceContext {
    provider: PlaceSource;
    provider_id: number | null;
    name: string;
    coordinate: [number, number];
    existingAddress?: string;
    canUsePremium: boolean;
}

function coordsOnlyDetails(ctx: FetchPlaceContext): EnrichedPlaceDetails {
    return {
        id: null,
        name: ctx.name,
        address: ctx.existingAddress || 'Unknown Location',
        description: '',
        provider: ctx.provider,
        provider_id: ctx.provider_id,
        geo: {latitude: ctx.coordinate[1], longitude: ctx.coordinate[0]},
        city: '',
        state: '',
        country: '',
        country_code: '',
        photos: [],
        rating: null,
    };
}

export const fetchEnrichedPlaceDetails = async (
    ctx: FetchPlaceContext
): Promise<EnrichedPlaceDetails> => {
    let details = coordsOnlyDetails(ctx);
    let photonAddress = ctx.existingAddress || 'Unknown Location';

    try {
        const response = await fetch(
            `https://photon.komoot.io/reverse?lon=${ctx.coordinate[0]}&lat=${ctx.coordinate[1]}`
        );
        const raw = await response.text();
        // Photon sometimes returns HTML error pages (blocked / rate-limit / outage).
        if (!response.ok || raw.trimStart().startsWith('<')) {
            throw new Error(`Photon reverse failed (${response.status})`);
        }
        const geoData = JSON.parse(raw) as {
            features?: Array<{properties?: Record<string, string>}>;
        };
        const p = geoData.features?.[0]?.properties || {};
        photonAddress =
            `${p.street || ''}, ${p.city || p.county || ''}, ${p.state || ''}, ${p.country || ''}`.trim() ||
            'Unknown Location';

        details = {
            ...details,
            address: ctx.existingAddress || photonAddress,
            city: p.city || p.town || p.county || p.district || '',
            state: p.state || '',
            country: p.country || '',
            country_code: p.countrycode?.toUpperCase() || '',
        };
    } catch (e) {
        console.warn('Photon reverse geocode skipped:', e);
        // Keep coords + existingAddress; do not throw — venue sheet can still render.
    }

    if (ctx.canUsePremium) {
        try {
            const result = await SearchPlaceApi({
                query: ctx.name,
                lat: ctx.coordinate[1],
                lon: ctx.coordinate[0],
                radius: 50,
                prefer_nearby: true,
                area_context: `${ctx.name} near ${photonAddress}`,
            });

            if (result.data?.[0]) {
                const premiumData = result.data[0];
                details = {
                    ...details,
                    ...premiumData,
                    city: details.city || premiumData.city || '',
                    state: details.state || premiumData.state || '',
                    country: details.country || premiumData.country || '',
                    country_code:
                        details.country_code || premiumData.country_code || '',
                    geo: details.geo,
                };
            }
        } catch (e) {
            console.warn('Premium nearby search skipped:', e);
        }
    }

    return details;
};
