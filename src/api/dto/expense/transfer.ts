import {Currency, RelationWithUserType} from "@/src/api/dto/constants";

export enum TransferMode {
    CASH = "CASH",
    UPI = "UPI",
    CARD = "CARD",
    NET_BANKING = "NET_BANKING",
    OTHER = "OTHER"
}

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