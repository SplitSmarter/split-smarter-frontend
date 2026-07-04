import React from 'react';
import { CurrencyCode } from '@/src/constants/expense/currency';
import { UnifiedTransaction } from "@/src/interfaces/expense/transaction";
import { ExpenseRow } from '@/src/components/expense/ExpenseRow';
import { TransferRow } from '@/src/components/expense/TransferRow';

interface TransactionRowProps {
    transaction: UnifiedTransaction;
    userId: number | undefined;
    viewType: 'absolute' | 'custom';
    userProfileCurrencyCode: CurrencyCode;
    isDark: boolean;
    onPress?: (item: UnifiedTransaction) => void;
}

export const TransactionRow = ({
                                   transaction,
                                   userId,
                                   viewType,
                                   userProfileCurrencyCode,
                                   isDark,
                                   onPress
                               }: TransactionRowProps) => {

    if (transaction.type === 'EXPENSE' && transaction.expenseRaw) {
        return (
            <ExpenseRow
                item={transaction.expenseRaw}
                userId={userId}
                viewType={viewType}
                userProfileCurrencyCode={userProfileCurrencyCode}
                isDark={isDark}
                onPress={() => onPress?.(transaction)}
            />
        );
    }

    if (transaction.type === 'TRANSFER' && transaction.transferRaw) {
        return (
            <TransferRow
                item={transaction.transferRaw}
                userId={userId}
                onPress={() => onPress?.(transaction)}
            />
        );
    }

    return null;
};