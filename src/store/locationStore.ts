import { create } from "zustand";

export interface LocationCoords {
    latitude: number;
    longitude: number;
}

interface LocationState {
    currentLocation: LocationCoords | null;
    isLocationLoading: boolean;
    locationError: string | null;

    tempLocationMode: 'none' | 'current' | 'place';
    tempSelectedMapPlaceId: number | null;

    // Actions
    setLocation: (coords: LocationCoords | null) => void;
    setLocationLoading: (loading: boolean) => void;
    setLocationError: (error: string | null) => void;

    setTempSelectedMapPlaceId: (placeId: number | null) => void;
    setTempLocationSelection: (mode: 'none' | 'current' | 'place', placeId: number | null) => void;
    clearTempSelectedMapPlaceId: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    currentLocation: null,
    isLocationLoading: false,
    locationError: null,

    tempLocationMode: 'none',
    tempSelectedMapPlaceId: null,

    setLocation: (coords) => set({ currentLocation: coords, locationError: null }),
    setLocationLoading: (loading) => set({ isLocationLoading: loading }),
    setLocationError: (error) => set({ locationError: error }),

    setTempSelectedMapPlaceId: (placeId) => set({ tempSelectedMapPlaceId: placeId }),
    setTempLocationSelection: (mode, placeId) => set({ tempLocationMode: mode, tempSelectedMapPlaceId: placeId }),
    clearTempSelectedMapPlaceId: () => set({ tempSelectedMapPlaceId: null }),
}));