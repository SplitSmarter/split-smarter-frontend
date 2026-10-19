import type {LocationDetails, RegionDetails} from '@/src/api/dto/user/place';
import {ReverseGeocodePlaceApi} from '@/src/api/user/place/search_place';

const NOMINATIM_REVERSE_URL =
    'https://nominatim.openstreetmap.org/reverse';
const BDC_REVERSE_URL =
    'https://api.bigdatacloud.net/data/reverse-geocode-client';

/** Stable app UA for Nominatim — do not vary per end-user. */
const NOMINATIM_USER_AGENT =
    'SplitSmarter/1.0 (map-long-press-reverse; https://splitsmarter.app)';

const FETCH_TIMEOUT_MS = 6000;

export type DroppedPinGeocode = {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    latitude: number;
    longitude: number;
    source: 'nominatim' | 'bigdatacloud' | 'backend';
};

type NominatimReverseJson = {
    display_name?: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        suburb?: string;
        neighbourhood?: string;
        county?: string;
        state?: string;
        state_district?: string;
        country?: string;
        country_code?: string;
        road?: string;
        postcode?: string;
    };
};

type BdcReverseJson = {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    countryName?: string;
    countryCode?: string;
    plusCode?: string;
};

function joinParts(parts: Array<string | null | undefined>): string | undefined {
    const cleaned = parts.map((p) => p?.trim()).filter(Boolean) as string[];
    return cleaned.length > 0 ? cleaned.join(', ') : undefined;
}

async function fetchJson<T>(
    url: string,
    init?: RequestInit
): Promise<T | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            ...init,
            signal: controller.signal,
        });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    } finally {
        clearTimeout(timer);
    }
}

function fromNominatim(
    data: NominatimReverseJson,
    latitude: number,
    longitude: number
): DroppedPinGeocode | null {
    const a = data.address;
    if (!a && !data.display_name) return null;

    const city =
        a?.city ||
        a?.town ||
        a?.village ||
        a?.municipality ||
        a?.suburb ||
        a?.neighbourhood ||
        undefined;
    const state = a?.state || a?.state_district || a?.county || undefined;
    const country = a?.country || undefined;
    const countryCode = a?.country_code?.toUpperCase() || undefined;
    const name =
        city ||
        a?.road ||
        data.display_name?.split(',')[0]?.trim() ||
        undefined;
    if (!name) return null;

    return {
        name,
        address:
            data.display_name?.trim() ||
            joinParts([a?.road, city, state, country]),
        city,
        state,
        country,
        countryCode,
        latitude,
        longitude,
        source: 'nominatim',
    };
}

function fromBigDataCloud(
    data: BdcReverseJson,
    latitude: number,
    longitude: number
): DroppedPinGeocode | null {
    const city = data.city || data.locality || undefined;
    const state = data.principalSubdivision || undefined;
    const country = data.countryName || undefined;
    const countryCode = data.countryCode || undefined;
    const name = city || state || country || data.plusCode || undefined;
    if (!name) return null;

    return {
        name,
        address: joinParts([data.locality, data.city, state, country]),
        city,
        state,
        country,
        countryCode,
        latitude,
        longitude,
        source: 'bigdatacloud',
    };
}

function fromBackendRegion(
    region: RegionDetails,
    latitude: number,
    longitude: number
): DroppedPinGeocode | null {
    const city = region.locality || undefined;
    const state =
        region.administrative_area_level_1 ||
        region.administrative_area_level_2 ||
        undefined;
    const country = region.country || undefined;
    const countryCode = region.country_code || undefined;
    const name =
        city ||
        region.route ||
        state ||
        country ||
        region.formatted_address?.split(',')[0]?.trim() ||
        undefined;
    if (!name) return null;

    return {
        name,
        address:
            region.formatted_address?.trim() ||
            joinParts([region.route, city, state, country]),
        city,
        state,
        country,
        countryCode,
        latitude: region.geo?.latitude ?? latitude,
        longitude: region.geo?.longitude ?? longitude,
        source: 'backend',
    };
}

async function tryNominatim(
    latitude: number,
    longitude: number
): Promise<DroppedPinGeocode | null> {
    const url =
        `${NOMINATIM_REVERSE_URL}?lat=${encodeURIComponent(String(latitude))}` +
        `&lon=${encodeURIComponent(String(longitude))}` +
        `&format=jsonv2&addressdetails=1`;
    const data = await fetchJson<NominatimReverseJson>(url, {
        headers: {
            Accept: 'application/json',
            'User-Agent': NOMINATIM_USER_AGENT,
        },
    });
    if (!data) return null;
    return fromNominatim(data, latitude, longitude);
}

async function tryBigDataCloud(
    latitude: number,
    longitude: number
): Promise<DroppedPinGeocode | null> {
    const url =
        `${BDC_REVERSE_URL}?latitude=${encodeURIComponent(String(latitude))}` +
        `&longitude=${encodeURIComponent(String(longitude))}` +
        `&localityLanguage=en`;
    const data = await fetchJson<BdcReverseJson>(url);
    if (!data) return null;
    return fromBigDataCloud(data, latitude, longitude);
}

async function tryBackendReverse(
    latitude: number,
    longitude: number,
    includeNearby = false
): Promise<{
    geocode: DroppedPinGeocode | null;
    region: RegionDetails | null;
    nearby: LocationDetails[];
} | null> {
    try {
        const res = await ReverseGeocodePlaceApi({
            lat: latitude,
            lon: longitude,
            include_nearby: includeNearby,
        });
        if (!res.data?.region) return null;
        return {
            geocode: fromBackendRegion(res.data.region, latitude, longitude),
            region: res.data.region,
            nearby: res.data.nearby_places ?? [],
        };
    } catch {
        return null;
    }
}

/**
 * Long-press reverse cascade: Nominatim → BigDataCloud → GET /place/v1/reverse.
 * Region label only (no nearby). Prefer {@link loadDroppedPinBundle} for the sheet.
 */
export async function reverseGeocodeDroppedPin(
    latitude: number,
    longitude: number
): Promise<DroppedPinGeocode | null> {
    const fromOsm = await tryNominatim(latitude, longitude);
    if (fromOsm) return fromOsm;

    const fromBdc = await tryBigDataCloud(latitude, longitude);
    if (fromBdc) return fromBdc;

    const backend = await tryBackendReverse(latitude, longitude, false);
    return backend?.geocode ?? null;
}

export type DroppedPinBundle = {
    geocode: DroppedPinGeocode | null;
    region: RegionDetails | null;
    nearby: LocationDetails[];
};

/**
 * Dropped-pin sheet load: optimistic Nominatim/BDC region title, then
 * GET /place/v1/reverse?include_nearby=true for region + nearby_places.
 */
export async function loadDroppedPinBundle(
    latitude: number,
    longitude: number,
    onOptimistic?: (geocode: DroppedPinGeocode) => void
): Promise<DroppedPinBundle> {
    void (async () => {
        const fromOsm = await tryNominatim(latitude, longitude);
        if (fromOsm) {
            onOptimistic?.(fromOsm);
            return;
        }
        const fromBdc = await tryBigDataCloud(latitude, longitude);
        if (fromBdc) onOptimistic?.(fromBdc);
    })();

    const backend = await tryBackendReverse(latitude, longitude, true);
    if (backend) {
        return {
            geocode: backend.geocode,
            region: backend.region,
            nearby: backend.nearby,
        };
    }

    // Backend failed — fall back to client reverse for region only.
    const fromOsm = await tryNominatim(latitude, longitude);
    if (fromOsm) {
        return {geocode: fromOsm, region: null, nearby: []};
    }
    const fromBdc = await tryBigDataCloud(latitude, longitude);
    if (fromBdc) {
        return {geocode: fromBdc, region: null, nearby: []};
    }
    return {geocode: null, region: null, nearby: []};
}
