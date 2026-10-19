import React, {useCallback, useEffect, useRef, useState} from 'react';
import {BackHandler, ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {useIsFocused} from '@react-navigation/native';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {DateRangeBottomSheet} from '@/src/components/common/DateRangeBottomSheet';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {themeStore} from '@/src/store/themeStore';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {ROUTES} from '@/src/constants/routes';
import {useAlert} from '@/src/context/alertContext';
import {
    BackDismissStackProvider,
    useRegisterOverlayDismiss,
} from '@/src/hooks/useBackDismissStack';

import {useDashboardData} from './hooks/useDashboardData';
import {useExpenseSpendChart} from './hooks/useExpenseSpendChart';
import {HeaderCardSection} from './components/HeaderCardSection';
import {ActionButtons} from './components/ActionButtons';
import {RecentTransactions} from './components/RecentTransactions';
import {SpendCategoriesInsights} from './components/SpendCategoriesInsights';
import {BudgetsFinancialHealth} from './components/BudgetsFinancialHealth';
import {PeersWellnessMonitor} from './components/PeersWellnessMonitor';
import {OmniFAB} from './components/OmniFAB';
import {CreateHubModal} from './components/CreateHubModal';

const EXIT_CONFIRM_MS = 2000;

function DashboardOverlayRegistration({
    dateRangeVisible,
    setDateRangeVisible,
    createHubVisible,
    setCreateHubVisible,
}: {
    dateRangeVisible: boolean;
    setDateRangeVisible: (v: boolean) => void;
    createHubVisible: boolean;
    setCreateHubVisible: (v: boolean) => void;
}) {
    useRegisterOverlayDismiss(dateRangeVisible, () => setDateRangeVisible(false));
    useRegisterOverlayDismiss(createHubVisible, () => setCreateHubVisible(false));
    return null;
}

export const DashboardScreen: React.FC = () => {
    const router = useRouter();
    const isFocused = useIsFocused();
    const {showAlert} = useAlert();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;

    const [dateRangeVisible, setDateRangeVisible] = useState(false);
    const [createHubVisible, setCreateHubVisible] = useState(false);
    const [dateRange, setDateRange] = useState<DateRangeResult | null>(null);
    const lastBackAtRef = useRef(0);

    useEffect(() => {
        if (!isFocused) lastBackAtRef.current = 0;
    }, [isFocused]);

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

    /** Second back within window exits; first shows a hint. Overlays are handled by the stack. */
    const handleEmptyBack = useCallback(() => {
        const now = Date.now();
        if (now - lastBackAtRef.current < EXIT_CONFIRM_MS) {
            lastBackAtRef.current = 0;
            BackHandler.exitApp();
            return;
        }
        lastBackAtRef.current = now;
        showAlert('Press back again to exit', 'info');
    }, [showAlert]);

    return (
        <BackDismissStackProvider
            onEmptyBack={handleEmptyBack}
            consumeEmptyHardwareBack
            interceptSystemBack={isFocused}
        >
            <DashboardOverlayRegistration
                dateRangeVisible={dateRangeVisible}
                setDateRangeVisible={setDateRangeVisible}
                createHubVisible={createHubVisible}
                setCreateHubVisible={setCreateHubVisible}
            />
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

                    <ActionButtons
                        onExpensePress={() =>
                            router.push(ROUTES.groupsTab('Expenses') as any)
                        }
                        onSettlementsPress={() =>
                            showAlert('Settlements coming soon', 'info')
                        }
                        onTransferPress={() =>
                            router.push({
                                pathname: '/(authenticated)/expense/add',
                                params: {tab: 'transfer'},
                            } as any)
                        }
                    />

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

                <OmniFAB onPress={() => setCreateHubVisible(true)} />

                <CreateHubModal
                    visible={createHubVisible}
                    onClose={() => setCreateHubVisible(false)}
                />

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
        </BackDismissStackProvider>
    );
};

export default DashboardScreen;
