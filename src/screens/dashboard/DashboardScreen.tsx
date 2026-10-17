import React, {useCallback, useState} from 'react';
import {ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {DateRangeBottomSheet} from '@/src/components/common/DateRangeBottomSheet';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {themeStore} from '@/src/store/themeStore';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {ROUTES} from '@/src/constants/routes';

import {useDashboardData} from './hooks/useDashboardData';
import {useExpenseSpendChart} from './hooks/useExpenseSpendChart';
import {HeaderCardSection} from './components/HeaderCardSection';
import {ActionButtons} from './components/ActionButtons';
import {RecentTransactions} from './components/RecentTransactions';
import {SpendCategoriesInsights} from './components/SpendCategoriesInsights';
import {BudgetsFinancialHealth} from './components/BudgetsFinancialHealth';
import {PeersWellnessMonitor} from './components/PeersWellnessMonitor';
import {OmniFAB} from './components/OmniFAB';

export const DashboardScreen: React.FC = () => {
    const router = useRouter();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;

    const [dateRangeVisible, setDateRangeVisible] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeResult | null>(null);

    const {
        expenseList,
        transactions,
        profile,
        categories,
        budgets,
        totalSpend,
        totalSpendAmount,
        userCurrency,
    } = useDashboardData({dateRange});

    const {spendChartData, setSelectedPoint, selectedCategory} = useExpenseSpendChart(
        expenseList,
        userCurrency
    );

    const handleDateRangeConfirm = useCallback((result: DateRangeResult) => {
        setDateRange(result);
    }, []);

    return (
        <ScreenWrapper
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <ScrollView
                className="flex-1"
                style={{backgroundColor: colors.bg.primary}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 168}}
            >
                <HeaderCardSection
                    profile={profile}
                    totalSpend={totalSpend}
                    categoryTag={selectedCategory}
                    spendChartData={spendChartData}
                    onSelectPoint={setSelectedPoint}
                    onFilterPress={() => setDateRangeVisible(true)}
                />

                <ActionButtons />

                <BudgetsFinancialHealth
                    budgets={budgets}
                    onCreateNewPress={() =>
                        router.push('/(authenticated)/expense/budget/add' as any)
                    }
                />

                <RecentTransactions
                    transactions={transactions}
                    onViewAllPress={() => router.push(ROUTES.groupsTab('Expenses') as any)}
                />

                <SpendCategoriesInsights
                    categories={categories}
                    totalSpendAmount={totalSpendAmount}
                    showMerchants={false}
                    onViewAllPress={() => router.push(ROUTES.analyticsTab() as any)}
                />

                <PeersWellnessMonitor score="8.5/10" />
            </ScrollView>

            <OmniFAB />

            <DateRangeBottomSheet
                visible={dateRangeVisible}
                initialStartDate={dateRange?.startDate}
                initialEndDate={dateRange?.endDate}
                title="Select duration"
                confirmLabel="Apply range"
                onClose={() => setDateRangeVisible(false)}
                onConfirm={handleDateRangeConfirm}
                onClearFilter={() => setDateRange(null)}
            />
        </ScreenWrapper>
    );
};

export default DashboardScreen;
