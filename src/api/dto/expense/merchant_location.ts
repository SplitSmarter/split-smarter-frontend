import {PlaceSource} from "@/src/api/dto/constants";
import {UserMerchantLocationSource} from "@/src/api/dto/expense/constant";


// Request DTOs
export interface UserMerchantLocationCreate {
    user_merchant_id: number;
    provider_id: number;
    provider_source: PlaceSource;
}

export interface ListUserMerchantLocationsQueryParams {
    offset?: number;
    limit?: number;
}

// Response DTOs
export interface UserMerchantLocationResponse {
    id: number;
}

export interface UserMerchantLocationDetails {
    id: number;
    source_type: UserMerchantLocationSource;
    name?: string | null;
    formatted_address?: string | null;
    country_code: string;
    latitude?: number | null;
    longitude?: number | null;
    google_place_id?: string | null;
}