import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {formatInr} from '@/src/screens/dev/ledger-month/utils/formatInr';
import {getElevatedCardStyle} from '@/src/screens/dev/ledger-month/styles/elevatedCard';

type MonthStatStripProps = {
    shareInr: number;
    paidInr: number;
    openShareInr: number;
    postedCount: number;
};

export function MonthStatStrip({
    shareInr,
    paidInr,
    openShareInr,
    postedCount,
}: MonthStatStripProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const stats = [
        {label: 'Your share', value: formatInr(shareInr)},
        {label: 'You paid', value: formatInr(paidInr)},
        {label: 'Still open', value: formatInr(openShareInr), emphasize: true},
        {label: 'Posted', value: String(postedCount)},
    ];

    return (
        <View>
            <AppText
                variant="h4"
                className="mb-3 font-bold"
                style={{color: colors.text.primary}}
            >
                Month snapshot
            </AppText>
            <View className="flex-row flex-wrap" style={{gap: 10}}>
                {stats.map((stat) => (
                    <View
                        key={stat.label}
                        className="rounded-3xl border p-3.5"
                        style={[
                            getElevatedCardStyle(isDark),
                            {width: '48%', flexGrow: 1},
                        ]}
                    >
                        <AppText
                            variant="caption-xs"
                            className="mb-1 font-medium"
                            style={{color: colors.text.lighter}}
                        >
                            {stat.label}
                        </AppText>
                        <AppText
                            variant="body-base"
                            className="font-bold"
                            style={{
                                color: stat.emphasize
                                    ? colors.accent.sky
                                    : colors.text.primary,
                            }}
                        >
                            {stat.value}
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );
}
