import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {PlaceSource} from "@/src/api/dto/constants";

export interface CachedPlace {
    id: number | null;
    provider: PlaceSource;
    provider_id: number;
    name: string;
    description: string;
    address: string;
    geo: { latitude: number; longitude: number };
    country: string;
    city: string;
    country_code: string;
    rating: number | null;
    lastFetched: number;
    photos: { id: string; url: string }[];
}

interface PlaceStoreState {
    // Keyed by osm_id (the primary map reference)
    places: Record<string, CachedPlace>;

    // Keyed by internal_id (the database reference) -> values are osm_ids
    mappings: Record<number, string>;

    // Actions
    savePlaceToCache: (provider: PlaceSource, provider_id: number, details: Partial<CachedPlace>) => void;
    getPlaceFromCache: (provider: PlaceSource, provider_id: number) => CachedPlace | null;
    clearCache: () => void;
}

export const placeStore = create<PlaceStoreState>()(
    persist(
        (set, get) => ({
            places: {},
            mappings: {},

            savePlaceToCache: (provider, provider_id, details) => {
                const cacheKey = `${provider}:${provider_id}`;
                set((state) => ({
                    places: {
                        ...state.places,
                        [cacheKey]: {
                            ...state.places[cacheKey],
                            ...details,
                            provider,
                            provider_id,
                            id: details.id ?? state.places[cacheKey]?.id,
                            lastFetched: Date.now(),
                        } as CachedPlace,
                    },
                }));
            },

            getPlaceFromCache: (provider, provider_id) => {
                if (!provider || !provider_id) return null;
                const cacheKey = `${provider}:${provider_id}`;
                return get().places[cacheKey] || null;
            },

            clearCache: () => set({ places: {}, mappings: {} }),
        }),
        {
            name: "place-metadata-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);