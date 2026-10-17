import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {DayCellModel} from '@/src/screens/dev/ledger-month/types';
import {LedgerDayCell} from '@/src/screens/dev/ledger-month/components/LedgerDayCell';
import {getElevatedCardStyle} from '@/src/screens/dev/ledger-month/styles/elevatedCard';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type LedgerMonthGridProps = {
    cells: DayCellModel[];
    leadingBlanks: number;
    selectedDay: number | null;
    onSelectDay: (day: number) => void;
    onFilterPress?: () => void;
    /** Non-default filter count for badge. */
    activeFilterCount?: number;
};

export function LedgerMonthGrid({
    cells,
    leadingBlanks,
    selectedDay,
    onSelectDay,
    onFilterPress,
    activeFilterCount = 0,
}: LedgerMonthGridProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View>
            <View className="mb-2 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Calendar
                </AppText>
                {onFilterPress ? (
                    <Pressable
                        onPress={onFilterPress}
                        accessibilityRole="button"
                        accessibilityLabel="Open filters"
                        hitSlop={8}
                        className="flex-row items-center gap-1 rounded-full border px-2.5 py-1 active:opacity-70"
                        style={{
                            backgroundColor: colors.bg.lighter,
                            borderColor: colors.status.border,
                        }}
                    >
                        <Iconify
                            icon="heroicons:funnel"
                            size={14}
                            color={
                                activeFilterCount > 0
                                    ? colors.accent.sky
                                    : colors.icon.primary
                            }
                        />
                        <AppText
                            variant="caption-xs"
                            className="font-semibold"
                            style={{
                                color:
                                    activeFilterCount > 0
                                        ? colors.accent.sky
                                        : colors.text.link,
                            }}
                        >
                            Filters
                        </AppText>
                        {activeFilterCount > 0 ? (
                            <View
                                className="min-w-[16px] items-center rounded-full px-1"
                                style={{backgroundColor: colors.accent.sky}}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className="text-[10px] font-bold"
                                    style={{color: COLORS.light.text.contrast}}
                                >
                                    {activeFilterCount}
                                </AppText>
                            </View>
                        ) : null}
                    </Pressable>
                ) : null}
            </View>
            <View className="rounded-3xl border p-2.5" style={getElevatedCardStyle(isDark)}>
                <View className="mb-1.5 flex-row">
                    {WEEKDAYS.map((label) => (
                        <View
                            key={label}
                            style={{width: '14.28%'}}
                            className="items-center py-1"
                        >
                            <AppText
                                variant="caption-xs"
                                className="font-semibold"
                                style={{color: colors.text.lighter}}
                            >
                                {label}
                            </AppText>
                        </View>
                    ))}
                </View>
                <View className="flex-row flex-wrap">
                    {Array.from({length: leadingBlanks}).map((_, index) => (
                        <View
                            key={`blank-${index}`}
                            style={{width: '13.8%', marginHorizontal: '0.24%'}}
                        />
                    ))}
                    {cells.map((cell) => (
                        <LedgerDayCell
                            key={cell.day}
                            cell={cell}
                            selected={selectedDay === cell.day}
                            onPress={() => onSelectDay(cell.day)}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
}
