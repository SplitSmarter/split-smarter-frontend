import { SuccessResponse } from "@/src/api/dto/ApiResponse";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {FailureReasonType, UserTransactionStatus} from "@/src/api/dto/user_payments/constant";


// Request Models
export interface InitiateTransactionRequest {
    client_reference_id: string;
    user_id: number;
    user_type?: RelationWithUserType;
    merchant_id?: string | null;
    from_user_payment_account_mapping_id?: string | null;
    to_user_payment_account_mapping_id?: string | null;
    amount: number;
    currency?: string;
    expiry_minutes?: number;
}

export interface UpdateTransactionStepRequest {
    step_name: string;
    session_id?: string | null;
    from_user_payment_account_mapping_id?: string | null;
    to_user_payment_account_mapping_id?: string | null;
    metadata_snapshot?: Record<string, any> | null;
}

export interface VerifyPaymentReturnRequest {
    return_payload: Record<string, any>;
    session_id?: string | null;
    metadata_snapshot?: Record<string, any> | null;
}

export interface CancelTransactionRequest {
    failure_reason_type?: FailureReasonType;
    failure_reason_raw?: string | null;
    session_id?: string | null;
    metadata_snapshot?: Record<string, any> | null;
}

// Response Models
export interface TransactionResponse {
    id: string;
    client_reference_id: string;
    gateway_txn_id: string | null;
    user_id: number;
    user_type: RelationWithUserType;
    merchant_id: string | null;
    from_user_payment_account_mapping_id: string | null;
    to_user_payment_account_mapping_id: string | null;
    amount: number;
    currency: string;
    status: UserTransactionStatus;
    failure_reason_type: FailureReasonType;
    failure_reason_raw: string | null;
    error_code: string | null;
    report_raised: boolean;
    transaction_report_id: string | null;
    is_signature_verified: boolean;
    expires_at: string;
    created_at: string;
    updated_at: string;
}