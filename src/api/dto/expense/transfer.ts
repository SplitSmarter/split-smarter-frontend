import {Currency, RelationWithUserType} from '@/src/api/dto/constants';
import {BasicUserDetails} from '@/src/api/dto/user/user';
import {BasicImage} from '@/src/api/dto/user/asset';
import {TransferMode} from '@/src/api/dto/expense/constant';
import {BaseGroupDetails} from '@/src/api/dto/user/group';
import {ExchangeRateDetails} from '@/src/api/dto/expense/expense';
import {UserMerchantDetails} from '@/src/api/dto/expense/merchant';
import {UserMerchantLocationDetails} from '@/src/api/dto/expense/merchant_location';

/**
 * Matches backend AddTransferRequest (src/dto/expense/addTransfer.py).
 * From/to are XOR: either user (+ type) or merchant (+ optional location).
 * Payment account mappings are also XOR per side (user vs merchant mapping).
 */
export interface AddTransferRequest {
    name: string;
    amount: number;
    currency: Currency;
    transfer_date?: string | null; // YYYY-MM-DD

    from_user_id?: number | null;
    from_user_type?: RelationWithUserType | null;
    from_merchant_id?: number | null;
    from_merchant_location_id?: number | null;
    from_user_payment_account_mapping_id?: string | null;
    from_merchant_payment_account_mapping_id?: string | null;

    to_user_id?: number | null;
    to_user_type?: RelationWithUserType | null;
    to_merchant_id?: number | null;
    to_merchant_location_id?: number | null;
    to_user_payment_account_mapping_id?: string | null;
    to_merchant_payment_account_mapping_id?: string | null;

    payment_category_id: string;
    group_id?: number | null;
    description?: string | null;
    assets?: string[] | null; // UUID strings
}

export interface AddTransferResponse {
    id: number;
    amount: number;
    currency: Currency;
}

/** Matches backend TransferDetailsBasicResponse */
export interface TransferDetailsBasicResponse {
    id: number;
    name: string;
    from_user?: BasicUserDetails | null;
    from_merchant?: UserMerchantDetails | null;
    from_merchant_location?: UserMerchantLocationDetails | null;
    from_user_payment_account_mapping_id?: string | null;
    from_merchant_payment_account_mapping_id?: string | null;
    to_user?: BasicUserDetails | null;
    to_merchant?: UserMerchantDetails | null;
    to_merchant_location?: UserMerchantLocationDetails | null;
    to_user_payment_account_mapping_id?: string | null;
    to_merchant_payment_account_mapping_id?: string | null;
    mode: TransferMode;
    transfer_date: string; // YYYY-MM-DD
    total_amount: number;
    currency: Currency;
    exchange_rate?: ExchangeRateDetails | null;
    has_attachment?: boolean | null;
    is_settled?: boolean | null;
    group?: BaseGroupDetails | null;
}

export interface TransferDetailsResponse extends TransferDetailsBasicResponse {
    notes?: string | null;
    assets: BasicImage[];
    created_by: BasicUserDetails;
    created_at: string;
    updated_at: string;
}
