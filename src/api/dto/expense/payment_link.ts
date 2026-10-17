import {Currency} from '@/src/api/dto/constants';

/** Matches backend AddPaymentLinkRequest (POST /expense/payment-link/v1/). */
export interface AddPaymentLinkRequest {
    transfer_id: number;
    expense_id: number;
    /** Optional amount in transfer currency; omit to cover max. */
    amount?: number | null;
    allow_partial_cover?: boolean;
}

/** Matches backend AddPaymentLinkResponse. */
export interface AddPaymentLinkResponse {
    id: number;
    updated: boolean;
    transfer_id: number;
    expense_id: number;
    expense_paid_by_id: number;
    amount: number;
    transfer_currency: Currency;
    covered_amount: number;
    amount_inr: number;
    previous_amount: number | null;
    previous_covered_amount: number | null;
    previous_amount_inr: number | null;
    paid_by_amount: number;
    paid_by_covered_total: number;
    paid_by_remaining: number;
    paid_by_fully_covered: boolean;
    transfer_amount_inr: number;
    transfer_remaining_inr: number;
    transfer_fully_allocated: boolean;
}

/** Matches backend PaymentLinkDetails (GET /expense/payment-link/v1/). */
export interface PaymentLinkDetails {
    id: number;
    transfer_id: number;
    expense_id: number;
    expense_paid_by_id: number | null;
    amount: number;
    transfer_currency: Currency;
    covered_amount: number;
    amount_inr: number;
    created_by_id: number;
    created_at: string;
}
