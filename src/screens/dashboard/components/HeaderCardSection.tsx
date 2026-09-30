import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderBar } from './HeaderBar';
import { BalanceSummary } from './BalanceSummary';
import { AnalyticsChart } from './AnalyticsChart';
import { FormattedAnalyticsPoint, UserProfile } from '../types/dashboard';

interface HeaderCardSectionProps {
    profile: UserProfile;
    categoryTag: string;
    analyticsData: FormattedAnalyticsPoint[];
    onSelectPoint: (point: FormattedAnalyticsPoint) => void;
    onNotificationPress?: () => void;
    onFilterPress?: () => void;
}

export const HeaderCardSection: React.FC<HeaderCardSectionProps> = ({
                                                                        profile,
                                                                        categoryTag,
                                                                        analyticsData,
                                                                        onSelectPoint,
                                                                        onNotificationPress,
                                                                        onFilterPress,
                                                                    }) => {
    return (
        <LinearGradient
            colors={['#8B0000', '#B22222', '#D2691E', '#CC5500']}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            className="pt-2 px-5 pb-10 rounded-b-3xl overflow-hidden"
        >
            <HeaderBar
                profile={profile}
                onNotificationPress={onNotificationPress}
                onFilterPress={onFilterPress}
            />
            <BalanceSummary
                totalBalance={profile.totalBalance}
                categoryTag={categoryTag}
            />
            <AnalyticsChart
                data={analyticsData}
                onSelectPoint={onSelectPoint}
            />
        </LinearGradient>
    );
};