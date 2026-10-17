import {BasicUserDetails} from '@/src/api/dto/user/user';
import {Currency} from '@/src/api/dto/constants';
import {ExchangeRateDetails, ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {TransferDetailsBasicResponse} from '@/src/api/dto/expense/transfer';

/** Matches backend BaseSettlementDetails (GET /settlement/v1/). */
export interface BaseSettlementDetails {
    id: number;
    from_user: BasicUserDetails;
    to_user: BasicUserDetails;
    amount: number;
    currency: Currency;
    amount_inr: number;
    exchange_rate: ExchangeRateDetails;
}

/** Extended shape (backend defines; not returned by current list routes). */
export interface SettlementDetails extends BaseSettlementDetails {
    transfers: TransferDetailsBasicResponse[];
    expenses: ExpenseDetailsBasicResponse[];
}

/** Matches backend AddSettlementLinkRequest (POST /settlement/v1/). */
export interface AddSettlementLinkRequest {
    transfer_id: number;
    expense_id: number;
    /** Optional INR amount; omit to settle max allowed. */
    amount_inr?: number | null;
    allow_partial_cover?: boolean;
}

/** Matches backend AddSettlementLinkResponse. */
export interface AddSettlementLinkResponse {
    id: number;
    updated: boolean;
    transfer_id: number;
    expense_id: number;
    settled_amount_inr: number;
    previous_settled_amount_inr: number | null;
    peer_max_inr: number;
    transfer_amount_inr: number;
    transfer_remaining_inr: number;
    transfer_fully_allocated: boolean;
    sender_remaining_debt_inr: number;
    receiver_remaining_credit_inr: number;
}
