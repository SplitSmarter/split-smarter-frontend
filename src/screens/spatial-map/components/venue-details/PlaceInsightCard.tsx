import React from 'react';
import {View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {PlaceSheetInsight} from '../../utils/mockPlaceAnalytics';

interface PlaceInsightCardProps {
    insight: PlaceSheetInsight;
}

export function PlaceInsightCard({insight}: PlaceInsightCardProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const sky = isDark ? COLORS.dark.accent.sky : COLORS.light.accent.sky;

    return (
        <View className="flex-row gap-x-3 rounded-[24px] border border-border-input bg-bg-canvas px-4 py-3.5">
            <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-2xl bg-accent-sky-bg">
                <Iconify icon="heroicons:sparkles" size={16} color={sky} />
            </View>
            <View className="min-w-0 flex-1">
                <AppText
                    variant="caption-xs"
                    className="font-semibold uppercase tracking-[1px] text-accent-sky"
                >
                    {insight.badge}
                </AppText>
                <AppText variant="body-small" className="mt-1 leading-5 text-text-primary">
                    {insight.text}
                </AppText>
            </View>
        </View>
    );
}
