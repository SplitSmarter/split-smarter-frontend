import React, {useCallback, useState} from 'react';
import {ScrollView} from 'react-native';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {DateRangeBottomSheet} from '@/src/components/common/DateRangeBottomSheet';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

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
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

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
            backgroundColor="#8B0000"
            statusBarStyle="light-content"
            withPadding={false}
            className="relative flex-1"
        >
            <ScrollView
                className="flex-1"
                style={{backgroundColor: isDark ? colors.bg.canvas : colors.bg.primary}}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 140}}
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

                <BudgetsFinancialHealth budgets={budgets} />

                <RecentTransactions transactions={transactions} />

                <SpendCategoriesInsights
                    categories={categories}
                    totalSpendAmount={totalSpendAmount}
                    showMerchants={false}
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
