import {BasicUserDetails} from "@/src/api/dto/user/user";
import {UserAccountType} from "@/src/api/dto/user_payments/constant";
import {BasicUserRelationshipDetails} from "@/src/api/dto/user/relationship";

// Request DTOs
export interface AddUPIAccountRequest {
    user_id: number;
    user_type?: UserAccountType;
    vpa: string;
    provider_id?: string | null;
}

export interface SearchUPIAccountRequest {
    vpa: string;
}

export interface VerifyVPAQueryRequest {
    vpa: string;
}

export interface VerifyAndLookupUPIAccountRequest {
    vpa: string;
}

// Response DTOs
export interface AddUPIAccountResponse {
    vpa_handle: string;
    taxonomy_id: string;
    provider_id: string;
    created_at: string; // ISO DateTime string
}

export interface SearchUPIAccountCandidate {
    user: BasicUserDetails;
    vpa_handle: string;
    is_verified_owner: boolean;
    account_mapping_id: string;
}

export interface SearchUPIAccountDTO {
    query_vpa: string;
    is_verified_handle: boolean;
    candidates: SearchUPIAccountCandidate[];
}

export interface VerifyVPAResponse {
    vpa: string;
    is_valid: boolean;
    account_name?: string | null;
}

export interface VerifyAndLookupUPIUser extends BasicUserDetails {
    relationship?: BasicUserRelationshipDetails | null;
}

export interface VerifyAndLookupUPIAccountDTO {
    vpa: string;
    vpa_handle: string;
    is_valid: boolean;
    account_name?: string | null;
    saved_users: VerifyAndLookupUPIUser[];
}


export interface AddMerchantUPIAccountRequest {
    merchant_id: number;
    vpa: string; // or string
    provider_id?: string | null;
}

export interface MerchantUPIAccountMappingResponse {
    merchant_payment_account_mapping_id: string;
    merchant_payment_account_id: string;
    is_verified_owner: boolean;
    is_active: boolean;
    taxonomy_id: string;
    provider_id?: string | null;
    vpa_handle: string;
    created_at: string;
}
