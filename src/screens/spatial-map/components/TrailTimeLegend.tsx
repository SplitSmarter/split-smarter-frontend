import React, {useMemo} from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {getTimeSlotColors} from './TrailLayer';

/** Compact daypart key — same row as spots/heatmap/trail, left side. */
export function TrailTimeLegend() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const legendItems = useMemo(() => {
        const colors = getTimeSlotColors(isDark);
        return [
            {label: 'Morning', color: colors.morning},
            {label: 'Afternoon', color: colors.afternoon},
            {label: 'Evening', color: colors.evening},
            {label: 'Night', color: colors.night},
        ] as const;
    }, [isDark]);

    return (
        <View className="h-10 flex-row items-center gap-1 self-start rounded-full border border-border-input bg-bg-primary px-2 shadow-sm dark:bg-bg-overlay">
            {legendItems.map((item) => (
                <View key={item.label} className="flex-row items-center gap-0.5">
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
