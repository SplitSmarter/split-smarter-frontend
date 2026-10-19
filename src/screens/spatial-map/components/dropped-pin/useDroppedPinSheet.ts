import {useCallback, useEffect, useRef, useState} from 'react';
import type {LocationDetails, RegionDetails} from '@/src/api/dto/user/place';
import {
    loadDroppedPinBundle,
    type DroppedPinGeocode,
} from '@/src/screens/spatial-map/utils/reverseGeocodeDroppedPin';

export type DroppedPinCoords = {
    latitude: number;
    longitude: number;
};

function dedupeNearbyPlaces(places: LocationDetails[]): LocationDetails[] {
    const seen = new Set<string>();
    const out: LocationDetails[] = [];
    for (const p of places) {
        const key =
            p.id != null
                ? `id:${p.id}`
                : `${p.provider}:${p.provider_id ?? ''}:${p.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(p);
    }
    return out;
}

export function useDroppedPinSheet(
    coords: DroppedPinCoords | null,
    isVisible: boolean
) {
    const [regionLoading, setRegionLoading] = useState(false);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [optimistic, setOptimistic] = useState<DroppedPinGeocode | null>(null);
    const [region, setRegion] = useState<RegionDetails | null>(null);
    const [geocode, setGeocode] = useState<DroppedPinGeocode | null>(null);
    const [nearby, setNearby] = useState<LocationDetails[]>([]);
    const requestIdRef = useRef(0);

    const reset = useCallback(() => {
        setOptimistic(null);
        setRegion(null);
        setGeocode(null);
        setNearby([]);
        setRegionLoading(false);
        setNearbyLoading(false);
    }, []);

    useEffect(() => {
        if (!isVisible || !coords) {
            reset();
            return;
        }

        const requestId = ++requestIdRef.current;
        setRegionLoading(true);
        setNearbyLoading(true);
        setOptimistic(null);
        setRegion(null);
        setGeocode(null);
        setNearby([]);

        void (async () => {
            const bundle = await loadDroppedPinBundle(
                coords.latitude,
                coords.longitude,
                (fast) => {
                    if (requestIdRef.current !== requestId) return;
                    setOptimistic(fast);
                    setRegionLoading(false);
                }
            );
            if (requestIdRef.current !== requestId) return;

            setGeocode(bundle.geocode);
            setRegion(bundle.region);
            setNearby(dedupeNearbyPlaces(bundle.nearby));
            setRegionLoading(false);
            setNearbyLoading(false);
        })();

        return () => {
            requestIdRef.current += 1;
        };
    }, [coords?.latitude, coords?.longitude, isVisible, reset]);

    const displayGeocode = geocode ?? optimistic;

    const title =
        displayGeocode?.name ||
        region?.locality ||
        region?.route ||
        'Dropped pin';

    const subtitle =
        displayGeocode?.address ||
        region?.formatted_address ||
        (coords
            ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
            : undefined);

    return {
        regionLoading,
        nearbyLoading,
        region,
        geocode: displayGeocode,
        nearby,
        title,
        subtitle,
        reset,
    };
}
