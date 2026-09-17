import {BasicImage} from "@/src/api/dto/user/asset";
import {UserMerchantSource} from "@/src/api/dto/expense/constant";


export interface MccDetails {
    code: string;
    description: string;
    icon?: BasicImage | null;
}

export interface MCCResponse {
    code: string;
    description: string;
    icon?: BasicImage | null;
}

// Request DTOs
export interface UserMerchantCreate {
    name: string;
    mcc_code?: string | null;
    logo_asset_id?: string | null;
    website?: string | null;
    tax_id?: string | null;
}

export interface UserMerchantUpdate {
    id: number;
    name?: string | null;
    mcc_code?: string | null;
    logo_url?: string | null;
    website?: string | null;
    tax_id?: string | null;
}

export interface SearchMerchantsQueryParams {
    q?: string;
    source_type?: UserMerchantSource[];
    mcc_code?: string;
    offset?: number;
    limit?: number;
}

// Response DTOs
export interface UserMerchantResponse {
    id: number;
    created_at: string; // ISO DateTime string
}

export interface UserMerchantDetails {
    id: number;
    source_type: UserMerchantSource;
    name: string;
    mcc_code: MccDetails;
    logo?: BasicImage | null;
    website?: string | null;
    notes?: string | null;
}

export interface MerchantSearchResponse {
    merchants: UserMerchantDetails[];
}