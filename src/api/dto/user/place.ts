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
    city: string;
    state: string;
    country: string;
    country_code: string;
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
    state: string;
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

/** Address/region components from GET /place/v1/reverse (not a saved place). */
export interface RegionDetails {
    formatted_address?: string | null;
    street_number?: string | null;
    route?: string | null;
    subpremise?: string | null;
    locality?: string | null;
    administrative_area_level_1?: string | null;
    administrative_area_level_2?: string | null;
    postal_code?: string | null;
    country?: string | null;
    country_code?: string | null;
    geo: GeoDetails;
    types?: string[];
}

export interface ReverseGeocodeResponse {
    region: RegionDetails;
    nearby_places?: LocationDetails[];
}