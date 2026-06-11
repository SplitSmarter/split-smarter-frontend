import { SearchPlaceApi } from "@/src/api/user/place/search_place";
import {PlaceSource} from "@/src/api/dto/constants";

export interface EnrichedPlaceDetails {
    name: string;
    description: string;
    address: string;
    geo: {
        latitude: number;
        longitude: number;
    };
    city: string;
    country: string;
    country_code: string;
    provider: PlaceSource;
    provider_id: number | null;
    photos: { id: string; url: string }[];
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

export const fetchEnrichedPlaceDetails = async (ctx: FetchPlaceContext): Promise<EnrichedPlaceDetails> => {
    const response = await fetch(`https://photon.komoot.io/reverse?lon=${ctx.coordinate[0]}&lat=${ctx.coordinate[1]}`);
    const geoData = await response.json();
    const p = geoData.features?.[0]?.properties || {};
    const photonAddress = `${p.street || ''}, ${p.city || p.county || ''}, ${p.state || ''}, ${p.country || ''}`.trim() || "Unknown Location";

    let details: EnrichedPlaceDetails = {
        id: null,
        name: ctx.name,
        address: ctx.existingAddress || photonAddress,
        description: "",
        provider: ctx.provider,
        provider_id: ctx.provider_id,
        geo: { latitude: ctx.coordinate[1], longitude: ctx.coordinate[0] },
        city: p.city || p.town || p.county || p.district || "Unknown",
        country: p.country || "Unknown",
        country_code: p.countrycode?.toUpperCase() || "UN",
        photos: [],
        rating: null,
    };

    console.log(details);

    if (ctx.canUsePremium) {
        const result = await SearchPlaceApi({
            query: ctx.name,
            lat: ctx.coordinate[1],
            lon: ctx.coordinate[0],
            radius: 50,
            prefer_nearby: true,
            area_context: `${ctx.name} near ${photonAddress}`
        });

        if (result.data?.[0]) {
            const premiumData = result.data[0];
            details = {
                ...details,
                ...premiumData,
                // Lock geo/location keys to guarantee they stay structured
                city: details.city,
                country: details.country,
                country_code: details.country_code,
                geo: details.geo
            };
        }
    }

    return details;
};