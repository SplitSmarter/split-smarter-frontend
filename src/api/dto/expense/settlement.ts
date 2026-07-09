import {BasicUserDetails} from "@/src/api/dto/user/user";
import {Currency} from "@/src/api/dto/constants";
import {ExchangeRateDetails, ExpenseDetailsBasicResponse} from "@/src/api/dto/expense/expense";
import {TransferDetailsBasicResponse} from "@/src/api/dto/expense/transfer";

export interface BaseSettlementDetails {
    id: number;
    from_user: BasicUserDetails;
    to_user: BasicUserDetails;
    amount: number;
    currency: Currency;
    amount_inr: number; // Mapping Python float to TypeScript number
    exchange_rate: ExchangeRateDetails;
}

export interface SettlementDetails extends BaseSettlementDetails {
    transfers: TransferDetailsBasicResponse[];
    expenses: ExpenseDetailsBasicResponse[];
}
