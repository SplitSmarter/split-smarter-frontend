import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

type LegendItemProps = {
    swatch: React.ReactNode;
    label: string;
};

function LegendItem({swatch, label}: LegendItemProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="mr-3 mb-1.5 flex-row items-center gap-1.5">
            {swatch}
            <AppText
                variant="caption-xs"
                className="font-medium"
                style={{color: colors.text.lighter}}
            >
                {label}
            </AppText>
        </View>
    );
}

/** Explains calendar day cues — sits above Filters so the grid stays readable. */
export function LedgerCalendarLegend() {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View
            className="mb-2.5 rounded-2xl border px-3 py-2.5"
            style={{
                backgroundColor: colors.bg.lighter,
                borderColor: colors.status.border,
            }}
        >
            <AppText
                variant="caption-xs"
                className="mb-2 font-bold uppercase tracking-wider"
                style={{color: colors.text.lighter}}
            >
                Legend
            </AppText>
            <View className="flex-row flex-wrap">
                <LegendItem
                    label="Today"
                    swatch={
                        <View
                            className="h-4 w-4 items-center justify-center rounded-full"
                            style={{backgroundColor: colors.accent.sky}}
                        >
                            <AppText
                                variant="caption-xs"
                                className="text-[8px] font-bold"
                                style={{color: COLORS.light.text.contrast}}
                            >
                                1
                            </AppText>
                        </View>
                    }
                />
                <LegendItem
                    label="Memory"
                    swatch={
                        <View
                            className="h-1 w-4 rounded-full"
                            style={{backgroundColor: colors.accent.sky}}
                        />
                    }
                />
                <LegendItem
                    label="Open balance"
                    swatch={
                        <View
                            className="h-2 w-2 rounded-full"
                            style={{backgroundColor: colors.status.warning}}
                        />
                    }
                />
                <LegendItem
                    label="Posted"
                    swatch={
                        <View
                            className="h-4 w-4 rounded-md border"
                            style={{
                                borderColor: colors.status.border,
                                backgroundColor: colors.bg.primary,
                            }}
                        />
                    }
                />
                <LegendItem
                    label="Scheduled"
                    swatch={
                        <View
                            className="h-4 w-4 rounded-md border border-dashed"
                            style={{borderColor: colors.status.border}}
                        />
                    }
                />
            </View>
        </View>
    );
}
