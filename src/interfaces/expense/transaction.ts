import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import {TransferDetailsBasicResponse} from "@/src/api/dto/expense/transfer";

export type TransactionType = 'EXPENSE' | 'TRANSFER';

export interface UnifiedTransaction {
    id: string; // Combined format to guarantee absolute React keys (e.g., 'EXPENSE-42')
    originalId: number;
    type: TransactionType;
    name: string;
    date: string; // Holds item.expense_date or item.transfer_date
    currency: string;
    totalAmount: number;
    isSettled: boolean;
    hasAttachment: boolean;
    // Contextual references to avoid unnecessary structural object degradation
    expenseRaw?: ExpenseDetailsBasicResponse;
    transferRaw?: TransferDetailsBasicResponse;
}