import {Currency, RelationWithUserType} from "@/src/api/dto/constants";
import {BasicUserDetails} from "@/src/api/dto/user/user";
import {CurrencyCode} from "@/src/constants/expense/currency";
import {BaseGroupDetails, ExchangeRateDetails} from "@/src/api/dto/expense/expense";
import {BasicImage} from "@/src/api/dto/user/asset";
import {TransferMode} from "@/src/api/dto/expense/constant";

// ============================================================================
// Request / Response Payload Interface Architectures
// ============================================================================

export interface AddTransferRequest {
    amount: number;
    currency: Currency;
    transfer_date: string | null; // ISO Date String format: YYYY-MM-DD
    from_user_id: number;
    from_user_type: RelationWithUserType;
    to_user_id: number;
    to_user_type: RelationWithUserType;
    group_id: number | null;
    description: string | null;
    mode: TransferMode;
}

export interface AddTransferResponse {
    id: number;
    amount: number;
    currency: Currency;
}

export interface AddSettlementLinkRequest {
    transfer_id: number;
    expense_id: number;
    amount: number; // Stated clearly in original transfer's currency choice
}

export interface AddSettlementLinkResponse {
    id: number;
}


export interface TransferDetailsBasicResponse {
    id: number;
    name: string;
    from_user: BasicUserDetails;
    to_user: BasicUserDetails;
    mode: TransferMode;
    transfer_date: string; // ISO Date format 'YYYY-MM-DD'
    total_amount: number;
    currency: CurrencyCode;
    exchange_rate?: ExchangeRateDetails | null;
    has_attachment?: boolean;
    is_settled?: boolean;
    group?: BaseGroupDetails | null;
}

export interface TransferDetailsResponse extends TransferDetailsBasicResponse {
    notes?: string | null;
    assets: BasicImage[];
    created_by: BasicUserDetails;
    created_at: string; // ISO DateTime format
    updated_at: string; // ISO DateTime format
}
