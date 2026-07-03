import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import { getPayerContextText } from "@/src/utils/expense/payers";
import { userStore } from "@/src/store/userStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';
import {AppInput} from "@/src/components/common/AppInput";
import {COLORS} from "@/src/constants/colors";

interface GroupExpensesTabProps {
    expenses: ExpenseDetailsBasicResponse[];
    isDark: boolean;
}

export const GroupExpensesTab = ({ expenses, isDark }: GroupExpensesTabProps) => {
    const { user } = userStore();
    const viewType = user?.user_settings?.currency_view_type ?? 'absolute';
    const userProfileCurrencyCode = (user?.currency || 'USD') as CurrencyCode;

    // Search & Filter state configurations
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilterCount] = useState(1); // Matches design mockup indicators

    // Process and sort records via input filters
    const groupedExpenses = useMemo(() => {
        const groups: { [key: string]: ExpenseDetailsBasicResponse[] } = {};

        let filteredExpenses = [...expenses];
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            filteredExpenses = filteredExpenses.filter((item) => {
                const matchesTitle = item.name?.toLowerCase().includes(query);
                const matchesPlace = item.place?.name?.toLowerCase().includes(query);
                const senderName = item.paid_by_users?.[0]?.name?.toLowerCase();
                const recipientName = item.sharers?.[0]?.name?.toLowerCase();

                return (
                    matchesTitle ||
                    matchesPlace ||
                    (item.expense_type === ExpenseComponentType.TRANSFER &&
                        (senderName?.includes(query) || recipientName?.includes(query)))
                );
            });
        }

        const sorted = filteredExpenses.sort(
            (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
        );

        sorted.forEach((expense) => {
            if (!expense.expense_date) return;

            const dateObj = new Date(expense.expense_date);
            const monthYearLabel = dateObj.toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric'
            });

            if (!groups[monthYearLabel]) {
                groups[monthYearLabel] = [];
            }
            groups[monthYearLabel].push(expense);
        });

        return Object.entries(groups);
    }, [expenses, searchQuery]);

    const getCurrencySymbol = (code: string): string => {
        return Currency[code as CurrencyCode]?.symbol || code;
    };

    return (
        <View className="flex-1 pb-24">
            {/* --- SEARCH & FILTER ELEMENT (Realigned side-by-side) --- */}
            <View className="flex-row items-center justify-between mb-5 mt-1 space-x-3 w-full">
                {/* Left-aligned, flex-expanding Search Field wrapper */}
                <View className="flex-1">
                    <AppInput
                        placeholder="Type to search"
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

                {/* Right-aligned Filter Action Pill */}
                <Pressable
                    className="flex-row items-center px-4 h-14 rounded-2xl bg-[#D4EDE1] dark:bg-[#1E372D] border border-[#2B8761]/20 dark:border-[#32966E]/30 active:opacity-80"
                >
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

            {/* --- EXPENSE ROW RENDERING MATRICES --- */}
            {groupedExpenses.length === 0 ? (
                <View className="items-center pt-16 px-10">
                    <Iconify icon="heroicons:banknotes" size={54} color={isDark ? "#3E3E3E" : "#E0E0E0"} />
                    <AppText className="mt-4 opacity-50 text-center text-sm font-medium text-gray-500 dark:text-zinc-400">
                        {expenses.length === 0 ? "No expenses recorded yet." : "No matching items found."}
                    </AppText>
                </View>
            ) : (
                groupedExpenses.map(([monthYearLabel, items]) => (
                    <View key={monthYearLabel} className="mb-4">
                        <View className="border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
                            <AppText variant="body-small" className="font-bold tracking-wider uppercase opacity-60 text-[#2B8761] dark:text-[#32966E]">
                                {monthYearLabel}
                            </AppText>
                        </View>

                        {items.map((item) => {
                            const isTransfer = item.expense_type === ExpenseComponentType.TRANSFER;
                            const isSettled = item.is_settled;
                            const baseContribution = item.user_contribution ?? 0;

                            let displayContribution = baseContribution;
                            let displayCurrencySymbol = getCurrencySymbol(item.currency);

                            if (viewType === 'custom' && baseContribution !== 0 && item.currency !== userProfileCurrencyCode) {
                                const exchangeRates = item.exchange_rate;
                                const baseRate = exchangeRates ? (exchangeRates[item.currency as keyof typeof exchangeRates] ?? 1) : 1;
                                const targetRate = exchangeRates ? (exchangeRates[userProfileCurrencyCode as keyof typeof exchangeRates] ?? 1) : 1;

                                if (baseRate > 0 && targetRate > 0) {
                                    const valueInUSD = baseContribution / baseRate;
                                    displayContribution = valueInUSD * targetRate;
                                    displayCurrencySymbol = getCurrencySymbol(userProfileCurrencyCode);
                                }
                            }

                            const formattedRowDate = new Date(item.expense_date).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short'
                            });

                            if (isTransfer) {
                                const senderName = item.paid_by_users?.[0]?.name || "Someone";
                                const recipientName = item.sharers?.[0]?.name || "Someone";

                                return (
                                    <View key={item.id} className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0">
                                        <View className="relative w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800/50 items-center justify-center mr-4">
                                            <Iconify icon="heroicons:arrows-right-left" size={22} color="#2563EB" />
                                            {isSettled && (
                                                <View className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                                                    <Iconify icon="heroicons:tag" size={12} color="white" />
                                                </View>
                                            )}
                                        </View>

                                        <View className="flex-1 justify-center">
                                            <View className="flex-row items-center justify-between">
                                                <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-2" numberOfLines={1}>
                                                    {`${senderName} paid ${recipientName}`}
                                                </AppText>
                                                <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                                                    {formattedRowDate}
                                                </AppText>
                                            </View>

                                            <View className="flex-row items-center justify-between mt-0.5">
                                                <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500" numberOfLines={1}>
                                                    Settlement Payment
                                                </AppText>
                                                <AppText variant="body-base" className="font-bold text-gray-900 dark:text-zinc-50 text-right">
                                                    {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                                                </AppText>
                                            </View>
                                        </View>
                                    </View>
                                );
                            }

                            const structuralPayers = (item.paid_by_users || []).map(p => ({
                                id: p.id,
                                name: p.name,
                                user_type: p.user_type
                            }));

                            const payerContext = getPayerContextText(structuralPayers, {
                                user_type: RelationWithUserType.USER,
                                id: user?.id || 0
                            });

                            return (
                                <View key={item.id} className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0">
                                    <View className="relative w-12 h-12 rounded-full bg-emerald-50 dark:bg-zinc-800/60 items-center justify-center mr-4">
                                        {item.category?.icon?.id ? (
                                            <AppImageV2
                                                id={`${item.category.icon.id}`}
                                                url={item.category.icon.url}
                                                style={{ width: 24, height: 24 }}
                                                contentFit="contain"
                                                fallbackComponent={<Iconify icon="heroicons:receipt-percent" size={22} color={isDark ? "#32966E" : "#2B8761"} />}
                                            />
                                        ) : (
                                            <Iconify icon="heroicons:receipt-percent" size={22} color={isDark ? "#32966E" : "#2B8761"} />
                                        )}

                                        {isSettled && (
                                            <View className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                                                <Iconify icon="heroicons:check" size={12} color="white" />
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 justify-center">
                                        <View className="flex-row items-center justify-between">
                                            <AppText variant="body-base" className="font-semibold text-gray-900 dark:text-zinc-100 flex-1 mr-2" numberOfLines={1}>
                                                {item.name}
                                            </AppText>
                                            <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium">
                                                {formattedRowDate}
                                            </AppText>
                                        </View>

                                        <View className="flex-row items-center justify-between mt-0.5">
                                            <View className="flex-row items-center flex-1 mr-2">
                                                <AppText variant="body-small" className="text-gray-500 dark:text-zinc-400" numberOfLines={1}>
                                                    {payerContext}
                                                </AppText>
                                                {item.has_attachment && (
                                                    <View className="ml-1.5 justify-center">
                                                        <Iconify icon="heroicons:paper-clip" size={12} color={isDark ? "#A1A1AA" : "#646464"} />
                                                    </View>
                                                )}
                                            </View>

                                            {baseContribution !== 0 ? (
                                                <AppText
                                                    variant="body-small"
                                                    className={`font-bold text-right ${baseContribution > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
                                                >
                                                    {baseContribution > 0 ? '+' : ''}{displayCurrencySymbol}{displayContribution.toFixed(2)}
                                                </AppText>
                                            ) : (
                                                <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 text-right font-medium">
                                                    Not involved
                                                </AppText>
                                            )}
                                        </View>

                                        <View className="flex-row items-center justify-between mt-0.5">
                                            <View className="flex-1 mr-2">
                                                {item.place?.name ? (
                                                    <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500" numberOfLines={1}>
                                                        📍 {item.place.name}
                                                    </AppText>
                                                ) : (
                                                    <View className="h-4" />
                                                )}
                                            </View>
                                            <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500 font-medium text-right">
                                                {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                                            </AppText>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))
            )}
        </View>
    );
};