import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {TIME_SLOT_COLORS} from './TrailLayer';

const LEGEND_ITEMS = [
    {label: 'Morning', color: TIME_SLOT_COLORS.morning},
    {label: 'Afternoon', color: TIME_SLOT_COLORS.afternoon},
    {label: 'Evening', color: TIME_SLOT_COLORS.evening},
    {label: 'Night', color: TIME_SLOT_COLORS.night},
] as const;

/** Compact daypart key — same row as spots/heatmap/trail, left side. */
export function TrailTimeLegend() {
    return (
        <View className="h-10 flex-row items-center gap-2 self-start rounded-full border border-border-input bg-bg-primary px-2.5 shadow-sm dark:bg-bg-overlay">
            {LEGEND_ITEMS.map((item) => (
                <View key={item.label} className="flex-row items-center gap-1">
                    <View
                        className="h-2.5 w-2.5 rounded-full border border-white/80"
                        style={{backgroundColor: item.color}}
                    />
                    <AppText
                        variant="caption-xs"
                        className="font-semibold text-text-primary-lighter"
                        numberOfLines={1}
                    >
                        {item.label}
                    </AppText>
                </View>
            ))}
        </View>
    );
}
