import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppInput } from "@/src/components/common/AppInput";
import { userStore } from "@/src/store/userStore";
import { CurrencyCode } from '@/src/constants/expense/currency';
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { TransferDetailsBasicResponse } from "@/src/api/dto/expense/transfer";
import {UnifiedTransaction} from "@/src/interfaces/expense/transaction";
import {TransactionRow} from "@/src/components/expense/TransactionRow";

interface GroupTransactionsTabProps {
    expenses: ExpenseDetailsBasicResponse[];
    transfers: TransferDetailsBasicResponse[];
    isDark: boolean;
    onTransactionPress?: (transaction: UnifiedTransaction) => void;
}

export const GroupTransactionsTab = ({
                                         expenses,
                                         transfers,
                                         isDark,
                                         onTransactionPress
                                     }: GroupTransactionsTabProps) => {
    const { user } = userStore();
    const viewType = user?.user_settings?.currency_view_type ?? 'absolute';
    const userProfileCurrencyCode = (user?.currency || 'USD') as CurrencyCode;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilterCount] = useState(1);

    // Dynamic processing engine combining, sorting, and grouping data models
    const groupedTransactions = useMemo(() => {
        // Step 1: Normalize independent streams into the unified interface
        const unifiedExpenses: UnifiedTransaction[] = expenses.map(e => ({
            id: `EXPENSE-${e.id}`,
            originalId: e.id,
            type: 'EXPENSE',
            name: e.name || 'Group Expense',
            date: e.expense_date,
            currency: e.currency,
            totalAmount: e.total_amount,
            isSettled: e.is_settled || false,
            hasAttachment: e.has_attachment || false,
            expenseRaw: e
        }));

        const unifiedTransfers: UnifiedTransaction[] = transfers.map(t => ({
            id: `TRANSFER-${t.id}`,
            originalId: t.id,
            type: 'TRANSFER',
            name: t.name || 'Settlement Transfer',
            date: t.transfer_date,
            currency: t.currency,
            totalAmount: t.total_amount,
            isSettled: t.is_settled || false,
            hasAttachment: t.has_attachment || false,
            transferRaw: t
        }));

        let merged = [...unifiedExpenses, ...unifiedTransfers];

        // Step 2: Global structural evaluation based on text criteria
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            merged = merged.filter((item) => {
                const matchesBaseTitle = item.name.toLowerCase().includes(query);

                if (item.type === 'EXPENSE' && item.expenseRaw) {
                    const placeMatch = item.expenseRaw.place?.name?.toLowerCase().includes(query);
                    const specificPayerMatch = item.expenseRaw.paid_by_users?.some(p => p.name?.toLowerCase().includes(query));
                    return matchesBaseTitle || placeMatch || specificPayerMatch;
                }

                if (item.type === 'TRANSFER' && item.transferRaw) {
                    const senderMatch = item.transferRaw.from_user?.name?.toLowerCase().includes(query);
                    const recipientMatch = item.transferRaw.to_user?.name?.toLowerCase().includes(query);
                    const modeMatch = item.transferRaw.mode?.toLowerCase().includes(query);
                    return matchesBaseTitle || senderMatch || recipientMatch || modeMatch;
                }

                return matchesBaseTitle;
            });
        }

        // Step 3: Enforce descending chronological order
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Step 4: Split rows into chronological tracking headers
        const groups: { [key: string]: UnifiedTransaction[] } = {};
        merged.forEach((tx) => {
            if (!tx.date) return;
            const dateObj = new Date(tx.date);
            const monthYearLabel = dateObj.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric'
            });

            if (!groups[monthYearLabel]) {
                groups[monthYearLabel] = [];
            }
            groups[monthYearLabel].push(tx);
        });

        return Object.entries(groups);
    }, [expenses, transfers, searchQuery]);

    return (
        <View className="flex-1 pb-24">
            {/* Search and Filters Utility Header */}
            <View className="flex-row items-center justify-between mb-5 mt-1 space-x-3 w-full">
                <View className="flex-1">
                    <AppInput
                        placeholder="Search expense, place, or person..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                        autoCorrect={false}
                        renderLeftIcon={(iconColor) => (
                            <Iconify icon="heroicons:magnifying-glass" size={20} color={iconColor} />
                        )}
                        renderRightIcon={(iconColor) =>
                            searchQuery.length > 0 ? (
                                <Pressable onPress={() => setSearchQuery('')} className="p-1 active:opacity-50">
                                    <Iconify icon="heroicons:x-mark" size={18} color={iconColor} />
                                </Pressable>
                            ) : null
                        }
                    />
                </View>

                <Pressable className="flex-row items-center px-4 h-14 rounded-2xl bg-[#D4EDE1] dark:bg-[#1E372D] border border-[#2B8761]/20 dark:border-[#32966E]/30 active:opacity-80">
                    <Iconify icon="heroicons:adjustments-horizontal" size={20} color={isDark ? "#32966E" : "#2B8761"} />
                    {activeFilterCount > 0 && (
                        <View className="ml-1.5 bg-[#226C4E] dark:bg-[#28785A] rounded-full px-1.5 py-0.5 justify-center items-center min-w-[18px]">
                            <AppText className="text-white text-[11px] font-bold text-center leading-none">
                                {activeFilterCount}
                            </AppText>
                        </View>
                    )}
                </Pressable>
            </View>

            {/* Combined List Rendering Layout */}
            {groupedTransactions.length === 0 ? (
                <View className="items-center pt-16 px-10">
                    <Iconify icon="heroicons:banknotes" size={54} color={isDark ? "#3E3E3E" : "#E0E0E0"} />
                    <AppText className="mt-4 opacity-50 text-center text-sm font-medium text-gray-500 dark:text-zinc-400">
                        {expenses.length === 0 && transfers.length === 0
                            ? "No transactions recorded yet."
                            : "No matching items found."}
                    </AppText>
                </View>
            ) : (
                groupedTransactions.map(([monthYearLabel, items]) => (
                    <View key={monthYearLabel} className="mb-4">
                        {/* Sticky Date Component Tracker */}
                        <View className="border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
                            <AppText variant="body-small" className="font-bold tracking-wider uppercase opacity-60 text-[#2B8761] dark:text-[#32966E]">
                                {monthYearLabel}
                            </AppText>
                        </View>

                        {items.map((tx) => (
                            <TransactionRow
                                key={tx.id}
                                transaction={tx}
                                userId={user?.id}
                                viewType={viewType}
                                userProfileCurrencyCode={userProfileCurrencyCode}
                                isDark={isDark}
                                onPress={onTransactionPress}
                            />
                        ))}
                    </View>
                ))
            )}
        </View>
    );
};