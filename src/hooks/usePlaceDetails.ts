import { PlaceSource } from "@/src/api/dto/constants";
import { PlacePhotoDetails } from "@/src/api/dto/user/place";
import { GetUserPlaceByIdApi } from "@/src/api/user/place/location";
import { GetGooglePlaceDetailsApi } from "@/src/api/user/place/search_place";
import {CachedPlace, placeStore} from '@/src/store/placeStore';
import { userStore } from '@/src/store/userStore';
import { EnrichedPlaceDetails, fetchEnrichedPlaceDetails } from '@/src/utils/place/placeDataFetcher';
import { useEffect, useMemo, useState } from 'react';

interface UsePlaceDetailsProps {
    place: {
        id: number | null;
        provider: PlaceSource;
        provider_id: number | null;
        place_id: string | null;
        name: string;
        coordinate: [number, number];
        address?: string;
    } | null;
    isVisible: boolean;
}

export const usePlaceDetails = (place: UsePlaceDetailsProps['place'], isVisible: boolean) => {
    const [loading, setLoading] = useState(false);
    const [enrichedDetails, setEnrichedDetails] = useState<EnrichedPlaceDetails | null>(null);

    const { savePlaceToCache, getPlaceFromCache } = placeStore();
    const user = userStore((state) => state.user);
    // Explicitly typed cache target retrieval
    const cachedData = useMemo<EnrichedPlaceDetails | null>(() => {
        if (!place?.provider || !place?.provider_id) return null;
        return getPlaceFromCache(place.provider, place.provider_id) as EnrichedPlaceDetails | null;
    }, [place?.provider, place?.provider_id, isVisible]);

    useEffect(() => {
        if (!isVisible || !place) {
            setEnrichedDetails(null);
            return;
        }

        const loadData = async () => {
            if (!cachedData) setLoading(true);
            try {
                if (place.id) {
                    // Priority 1: Backend Database Entry
                    const result = await GetUserPlaceByIdApi(place.id);
                    if (result.data) {
                        // setEnrichedDetails(result.data as EnrichedPlaceDetails);
                        const data = result.data;
                        setEnrichedDetails({
                            name: data.name,
                            description: data.description,
                            address: data.address,
                            geo: {
                                latitude: data.geo.latitude,
                                longitude: data.geo.longitude,
                            },
                            city: "",
                            country: "",
                            country_code: "",
                            provider: data.provider,
                            provider_id: data.provider_id,
                            photos: data.photos as PlacePhotoDetails[],
                            rating: data.rating,
                            id: data.id
                        });
                        savePlaceToCache(result.data.provider, result.data.provider_id, result.data);
                    } else {
                        console.log(`No backend profile found for local place configuration id: ${place.id}`);
                    }
                } else if (place.provider === PlaceSource.GOOGLE && place.place_id) {
                    // Priority 2: Specific Google API Enrichment
                    const result = await GetGooglePlaceDetailsApi(place.place_id);
                    if (result.data) {
                        setEnrichedDetails(result.data as EnrichedPlaceDetails);
                        savePlaceToCache(PlaceSource.GOOGLE, result.data.provider_id, result.data);
                    } else {
                        console.log(`Google API execution returned empty dataset for provider reference: ${place.provider_id}`);
                    }
                } else if (place.provider) {
                    // Priority 3: Geometry & Reverse Geocode Fallback Tree
                    const [longitude, latitude] = place.coordinate;
                    const data = await fetchEnrichedPlaceDetails({
                        provider: place.provider,
                        provider_id: place.provider_id,
                        name: place.name,
                        coordinate: [longitude, latitude],
                        existingAddress: place.address,
                        canUsePremium: !!user?.can_use_premium_map
                    });

                    setEnrichedDetails(data);
                    if (data.provider && place.provider_id && place.provider) {
                        savePlaceToCache(place.provider, place.provider_id, data as Partial<CachedPlace>);
                    }
                } else {
                    console.error("Aborting layout fetch request: Selected configuration coordinates lack provider context parameters.");
                }
            } catch (e) {
                console.error("Place Loading Error:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isVisible, place?.id, place?.provider_id, place?.provider]);

    const displayData = useMemo<EnrichedPlaceDetails>(() => {
        const source = enrichedDetails || cachedData || {} as EnrichedPlaceDetails;

        return {
            name: source.name || place?.name || "unknown",
            description: source.description || "",
            address: source.address || place?.address || "Unknown Address",
            city: source.city || "",
            country: source.country || "",
            country_code: source.country_code || "",
            rating: source.rating ?? null,
            photos: source.photos || [],
            geo: source.geo || {
                latitude: place?.coordinate[1] || 0,
                longitude: place?.coordinate[0] || 0
            },
            provider: source.provider || place?.provider || null,
            provider_id: source.provider_id || place?.provider_id || null,
            id: source.id || place?.id || null
        };
    }, [enrichedDetails, cachedData, place]);

    return {
        loading,
        displayData,
        isAddressLoading: !cachedData?.address && !enrichedDetails?.address && !place?.address,
        enrichedDetails
    };
};