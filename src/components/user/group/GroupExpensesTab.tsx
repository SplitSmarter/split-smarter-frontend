import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { ExpenseDetailsBasicResponse } from "@/src/api/dto/expense/expense";
import { ExpenseComponentType } from "@/src/api/dto/expense/constant";
import { getPayerContextText } from "@/src/utils/expense/payers";
import { userStore } from "@/src/store/userStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { Currency, CurrencyCode } from '@/src/constants/expense/currency';

interface GroupExpensesTabProps {
    expenses: ExpenseDetailsBasicResponse[];
    isDark: boolean;
}

export const GroupExpensesTab = ({ expenses, isDark }: GroupExpensesTabProps) => {
    // Connect tracking states from your global Zustand user store matrix
    const { user } = userStore();

    // Fallback constants parameters safely inferred if profiles present raw empty matrices
    const viewType = user?.user_settings?.currency_view_type ?? 'absolute';
    const userProfileCurrencyCode = (user?.currency || 'USD') as CurrencyCode;

    // Chronologically group entities based on their explicit record date to Month Year
    const groupedExpenses = useMemo(() => {
        const groups: { [key: string]: ExpenseDetailsBasicResponse[] } = {};

        const sorted = [...expenses].sort(
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
    }, [expenses]);

    // Fast isolated operational closure looking up mapping configuration dictionary characters
    const getCurrencySymbol = (code: string): string => {
        return Currency[code as CurrencyCode]?.symbol || code;
    };

    if (expenses.length === 0) {
        return (
            <View className="items-center pt-20 px-10">
                <Iconify icon="heroicons:banknotes" size={60} color={isDark ? "#333" : "#EEE"}/>
                <AppText className="mt-4 opacity-40 text-center">No expenses recorded yet.</AppText>
            </View>
        );
    }

    return (
        <View className="flex-1 pb-24">
            {groupedExpenses.map(([monthYearLabel, items]) => (
                <View key={monthYearLabel} className="mb-4">
                    {/* --- Sticky Month Year Header --- */}
                    <View className="border-b border-gray-100 dark:border-zinc-800 pb-2 mb-2">
                        <AppText variant="body-small"
                                 className="font-bold tracking-wider uppercase opacity-60 text-[#2D6A4F] dark:text-emerald-400">
                            {monthYearLabel}
                        </AppText>
                    </View>

                    {/* --- Transaction Rows Matrix --- */}
                    {items.map((item) => {
                        const isTransfer = item.expense_type === ExpenseComponentType.TRANSFER;
                        const isSettled = item.is_settled;
                        const baseContribution = item.user_contribution ?? 0;

                        // Default presentation attributes extracted from base bill payload definitions
                        let displayContribution = baseContribution;
                        let displayCurrencySymbol = getCurrencySymbol(item.currency);

                        // Calculate dynamic exchange rates if user requested relative/custom profile valuation metrics
                        if (viewType === 'custom' && baseContribution !== 0 && item.currency !== userProfileCurrencyCode) {
                            const exchangeRates = item.exchange_rate;

                            // Cross-reference current base transaction asset values vs targeted user native balances
                            const baseRate = exchangeRates ? (exchangeRates[item.currency as keyof typeof exchangeRates] ?? 1) : 1;
                            const targetRate = exchangeRates ? (exchangeRates[userProfileCurrencyCode as keyof typeof exchangeRates] ?? 1) : 1;

                            if (baseRate > 0 && targetRate > 0) {
                                // Convert value gracefully from base currency parameter through to personalized target format matrix
                                const valueInUSD = baseContribution / baseRate;
                                displayContribution = valueInUSD * targetRate;
                                displayCurrencySymbol = getCurrencySymbol(userProfileCurrencyCode);
                            }
                        }

                        // Format line-one date: e.g. "14 Jul"
                        const formattedRowDate = new Date(item.expense_date).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short'
                        });

                        const structuralPayers = (item.paid_by_users || []).map(p => ({
                            id: p.id,
                            name: p.name,
                            user_type: p.user_type
                        }));

                        const payerContext = getPayerContextText(structuralPayers, {
                            user_type: RelationWithUserType.USER,
                            id: user?.id || 0
                        });

                        // --------------------------------------------------------------------
                        // COMPONENT B: 2-Row Transfer Layout Indicator
                        // --------------------------------------------------------------------
                        if (isTransfer) {
                            const senderName = item.paid_by_users?.[0]?.name || "Someone";
                            const recipientName = item.sharers?.[0]?.name || "Someone";

                            return (
                                <View key={item.id}
                                      className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0">
                                    <View
                                        className="relative w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800 items-center justify-center mr-4">
                                        <Iconify icon="heroicons:arrows-right-left" size={22} color="#2563EB"/>
                                        {isSettled && (
                                            <View
                                                className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                                                <Iconify icon="heroicons:tag" size={12} color="white"/>
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 justify-center">
                                        {/* Row 1: Sender Context vs Date Stamp */}
                                        <View className="flex-row items-center justify-between">
                                            <AppText variant="body-base"
                                                     className="font-semibold text-black dark:text-white flex-1 mr-2"
                                                     numberOfLines={1}>
                                                {`${senderName} paid ${recipientName}`}
                                            </AppText>
                                            <AppText variant="body-small"
                                                     className="text-gray-400 dark:text-zinc-500 font-medium">
                                                {formattedRowDate}
                                            </AppText>
                                        </View>

                                        {/* Row 2: Transfer Subtext vs Amount Sent */}
                                        <View className="flex-row items-center justify-between mt-0.5">
                                            <AppText variant="body-small" className="text-gray-400 dark:text-zinc-500"
                                                     numberOfLines={1}>
                                                Settlement Payment
                                            </AppText>
                                            <AppText variant="body-base"
                                                     className="font-bold text-gray-950 dark:text-zinc-50 text-right">
                                                {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                                            </AppText>
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        // --------------------------------------------------------------------
                        // COMPONENT A: Custom 3-Row Expense Matrix Layout (Image Aligned 📸)
                        // --------------------------------------------------------------------
                        return (
                            <View key={item.id}
                                  className="flex-row items-center py-3 border-b border-gray-50 dark:border-zinc-900 last:border-b-0">
                                {/* Left Icon Avatar Stack Frame */}
                                <View
                                    className="relative w-12 h-12 rounded-full bg-emerald-50 dark:bg-zinc-800 items-center justify-center mr-4">
                                    {item.category?.icon?.id ? (
                                        <AppImageV2
                                            id={`${item.category.icon.id}`}
                                            url={item.category.icon.url}
                                            style={{width: 24, height: 24}}
                                            contentFit="contain"
                                            fallbackComponent={<Iconify icon="heroicons:receipt-percent" size={22}
                                                                        color="#2D6A4F"/>}
                                        />
                                    ) : (
                                        <Iconify icon="heroicons:receipt-percent" size={22} color="#2D6A4F"/>
                                    )}

                                    {isSettled && (
                                        <View
                                            className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full w-5 h-5 items-center justify-center border border-white dark:border-black">
                                            <Iconify icon="heroicons:check" size={12} color="white"/>
                                        </View>
                                    )}
                                </View>

                                {/* Right Side Flex Layout Matrix */}
                                <View className="flex-1 justify-center">
                                    {/* ROW 1: Expense Title Name | Date Stamp */}
                                    <View className="flex-row items-center justify-between">
                                        <AppText variant="body-base"
                                                 className="font-semibold text-gray-900 dark:text-zinc-50 flex-1 mr-2"
                                                 numberOfLines={1}>
                                            {item.name}
                                        </AppText>
                                        <AppText variant="body-small"
                                                 className="text-gray-400 dark:text-zinc-500 font-medium">
                                            {formattedRowDate}
                                        </AppText>
                                    </View>

                                    {/* ROW 2: Payer Summary Context | Personal Contribution Split Balance */}
                                    <View className="flex-row items-center justify-between mt-0.5">
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <AppText variant="body-small" className="text-gray-500 dark:text-zinc-400"
                                                     numberOfLines={1}>
                                                {payerContext}
                                            </AppText>
                                            {item.has_attachment && (
                                                <View className="ml-1.5 justify-center">
                                                    <Iconify icon="heroicons:paper-clip" size={12}
                                                             color={isDark ? "#A1A1AA" : "#71717A"}/>
                                                </View>
                                            )}
                                        </View>

                                        {/* Personal Split Value (Displays dynamically updated view_type balance conversion) */}
                                        {baseContribution !== 0 ? (
                                            <AppText variant="body-small"
                                                     className={`font-bold text-right ${baseContribution > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                                {baseContribution > 0 ? '+' : ''}{displayCurrencySymbol}{displayContribution.toFixed(2)}
                                            </AppText>
                                        ) : (
                                            <AppText variant="body-small"
                                                     className="text-gray-400 dark:text-zinc-500 text-right font-medium">
                                                Not involved
                                            </AppText>
                                        )}
                                    </View>

                                    {/* ROW 3: Location Placement | Total counter value continues to display original currency */}
                                    <View className="flex-row items-center justify-between mt-0.5">
                                        <View className="flex-1 mr-2">
                                            {item.place?.name ? (
                                                <AppText variant="body-small"
                                                         className="text-gray-400 dark:text-zinc-500" numberOfLines={1}>
                                                    📍 {item.place.name}
                                                </AppText>
                                            ) : (
                                                <View className="h-4"/>
                                            )}
                                        </View>
                                        <AppText variant="body-small"
                                                 className="text-gray-400 dark:text-zinc-500 font-medium text-right">
                                            {getCurrencySymbol(item.currency)}{item.total_amount.toFixed(2)}
                                        </AppText>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};