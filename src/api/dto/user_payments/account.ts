import {PaymentRailProviderBasicDetails} from "@/src/api/dto/user_payments/base_dto";
import {BasicImage} from "@/src/api/dto/user/asset";

export interface PaymentCategoryDetailsDTO {
    id: string;
    display_name: string;
    description?: string | null;
}

export interface PaymentAccountProvidersDTO {
    upi?: PaymentRailProviderBasicDetails[] | null;
}

export interface PaymentAccountAddOptionsDTO {
    region: string;
    details: Record<string, PaymentCategoryDetailsDTO>;
    providers: PaymentAccountProvidersDTO;
}

export interface PaymentAccountProviderSummaryDTO {
    id: string;
    display_name: string;
    icon: BasicImage;
}

export interface UPIRegistrySummaryDTO {
    registry_type: string;
    vpa: string;
    vpa_handle?: string | null;
    is_verified_handle: boolean;
}

export interface CardAccountSummaryDTO {
    registry_type: string;
    last4: string;
    card_network: string;
    card_type?: string | null;
}

export interface UserPaymentAccountItemDTO {
    mapping_id: string;
    taxonomy_id: string;
    created_by_user_id: number;
    provider: PaymentAccountProviderSummaryDTO;
    registry_details: UPIRegistrySummaryDTO | CardAccountSummaryDTO;
    is_active: boolean;
    preference_rank?: number | null;
}

export interface UserPaymentAccountListDTO {
    user_payment_account_id: string;
    user_id: number;
    user_type: string;
    accounts: UserPaymentAccountItemDTO[];
}

export interface GetUserPaymentAccountsQueryParams {
    user_id?: number;
    user_type?: string;
}

export interface MerchantPaymentAccountItemDTO {
    mapping_id: string;
    taxonomy_id: string;
    provider: PaymentAccountProviderSummaryDTO;
    registry_details: UPIRegistrySummaryDTO | CardAccountSummaryDTO;
    is_active: boolean;
}

export interface MerchantPaymentAccountListDTO {
    merchant_payment_account_id: string;
    merchant_id: number;
    is_active: boolean;
    accounts: MerchantPaymentAccountItemDTO[];
}