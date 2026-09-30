import React from 'react';
import {ScrollView} from 'react-native';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';

import {useDashboardData} from './hooks/useDashboardData';
import {useFormattedAnalytics} from './hooks/useFormattedAnalytics';
import {HeaderCardSection} from './components/HeaderCardSection';
import {ActionButtons} from './components/ActionButtons';
import {RecentTransactions} from './components/RecentTransactions';
import {SpendCategoriesInsights} from './components/SpendCategoriesInsights';
import {PrivateP2PSettlements} from './components/PrivateP2PSettlements';
import {BudgetsFinancialHealth} from './components/BudgetsFinancialHealth';
import {PeersWellnessMonitor} from './components/PeersWellnessMonitor';
import {OmniFAB} from './components/OmniFAB';

export const DashboardScreen: React.FC = () => {
    const {
        expenses,
        transactions,
        profile,
        categories,
        merchants,
        peers,
        budgets,
    } = useDashboardData();

    const {analyticsData, setSelectedPoint, displayCategory} =
        useFormattedAnalytics(expenses);

    return (
        <ScreenWrapper
            backgroundColor="#8B0000"
            statusBarStyle="light-content"
            withPadding={false}
            className="bg-black flex-1 relative"
        >
            <ScrollView
                className="flex-1 bg-black"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 140}}
            >
                {/* Section 1: Header, Balance & Integrated Graph */}
                <HeaderCardSection
                    profile={profile}
                    categoryTag={displayCategory}
                    analyticsData={analyticsData}
                    onSelectPoint={setSelectedPoint}
                />

                {/* Section 2: Action Buttons */}
                <ActionButtons/>

                {/* Section 6: Budgets & Financial Health */}
                <BudgetsFinancialHealth budgets={budgets}/>

                {/* Section 3: Recent Transactions */}
                <RecentTransactions transactions={transactions}/>

                {/* Section 4: Spend Categories & Insights */}
                <SpendCategoriesInsights
                    categories={categories}
                    merchants={merchants}
                />

                {/* Section 5: Private P2P Settlements */}
                <PrivateP2PSettlements peers={peers}/>


                {/* Section 7: Peers Wellness Monitor */}
                <PeersWellnessMonitor score="8.5/10"/>
            </ScrollView>

            {/* Omni Floating Action Button */}
            <OmniFAB/>
        </ScreenWrapper>
    );
};

export default DashboardScreen;