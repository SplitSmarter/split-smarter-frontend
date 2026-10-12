import {PlaceSource} from "@/src/api/dto/constants";

export interface MapPlaceItem {
    id: number | null;
    provider: PlaceSource;
    provider_id: number | null;
    place_id: string | null;
    name: string;
    coordinate: [number, number]; // [longitude, latitude]
    address?: string;
    isSaved: boolean;
}

export interface TempMarkerCoords {
    latitude: number;
    longitude: number;
}

export type LocationMode = 'none' | 'current' | 'place';
