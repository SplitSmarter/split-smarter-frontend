import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {HeaderBar} from './HeaderBar';
import {SpendSummary} from './SpendSummary';
import {AnalyticsChart} from './AnalyticsChart';
import {ExpenseSpendPoint, UserProfile} from '../types/dashboard';

interface HeaderCardSectionProps {
    profile: UserProfile;
    totalSpend: number;
    categoryTag: string;
    spendChartData: ExpenseSpendPoint[];
    onSelectPoint: (point: ExpenseSpendPoint) => void;
    onNotificationPress?: () => void;
    onFilterPress?: () => void;
}

export const HeaderCardSection: React.FC<HeaderCardSectionProps> = ({
    profile,
    totalSpend,
    categoryTag,
    spendChartData,
    onSelectPoint,
    onNotificationPress,
    onFilterPress,
}) => {
    return (
        <LinearGradient
            colors={['#8B0000', '#B22222', '#D2691E', '#CC5500']}
            start={{x: 0.1, y: 0.1}}
            end={{x: 0.9, y: 0.9}}
            className="rounded-b-3xl px-5 pb-10 pt-1"
        >
            <HeaderBar
                profile={profile}
                onNotificationPress={onNotificationPress}
                onFilterPress={onFilterPress}
            />
            <SpendSummary totalSpend={totalSpend} categoryTag={categoryTag} />
            <AnalyticsChart data={spendChartData} onSelectPoint={onSelectPoint} />
        </LinearGradient>
    );
};
