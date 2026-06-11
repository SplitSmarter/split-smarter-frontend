import {PlaceSource, PlaceStatus} from "@/src/api/dto/constants"; // Define your enum here

export interface GeoDetails {
    latitude: number;
    longitude: number;
}

export interface PlacePhotoDetails {
    id: string;
    url: string;
}

export interface LocationDetails {
    id: number | null;
    provider: PlaceSource;
    provider_id: number;
    name: string;
    address: string;
    geo: GeoDetails;
    rating: number | null;
    photos?: PlacePhotoDetails[];
}

export interface SearchPlaceRequest {
    query: string;
    prefer_nearby?: boolean;
    lat?: number;
    lon?: number;
    radius?: number;
    area_context?: string;
}

export interface AddPlaceDetails {
    name: string;
    description: string;
    address: string;
    geo: GeoDetails;
    country: string;
    city: string;
    country_code: string;
}

export interface AddPlaceRequest {
    name: string;
    description: string;
    provider: PlaceSource;
    provider_id: number | null; // Optional now
    custom_details: AddPlaceDetails | null; // Added for manual/custom fallback
}

export interface UserPlaceDetails extends LocationDetails {
    description: string;
    is_favourite: boolean;
    status: PlaceStatus;
    tags: string[];
    created_at: string;
}

export interface AddPlaceResponse {
    id: number;
}