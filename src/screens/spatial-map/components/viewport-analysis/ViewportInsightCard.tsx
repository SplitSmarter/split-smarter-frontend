import React from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {ViewportAnalysisInsight} from '../../utils/viewportAnalytics';
import {SurfaceCard} from '../venue-details/SurfaceCard';

interface ViewportInsightCardProps {
    insight: ViewportAnalysisInsight;
}

export function ViewportInsightCard({insight}: ViewportInsightCardProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <SurfaceCard className="flex-row gap-x-3 p-4">
            <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-accent-sky-bg">
                <Iconify
                    icon="heroicons:light-bulb"
                    size={20}
                    color={colors.accent.sky}
                />
            </View>
            <View className="min-w-0 flex-1">
                <AppText
                    variant="caption-xs"
                    className="mb-1 font-semibold uppercase tracking-wide text-accent-sky"
                >
                    {insight.badge}
                </AppText>
                <AppText variant="body-small" className="text-text-primary">
                    {insight.text}
                </AppText>
            </View>
        </SurfaceCard>
    );
}
