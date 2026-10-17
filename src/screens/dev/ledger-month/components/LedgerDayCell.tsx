import React from 'react';
import {Pressable, View, StyleSheet} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {DayCellModel} from '@/src/screens/dev/ledger-month/types';
import {formatInr} from '@/src/screens/dev/ledger-month/utils/formatInr';

type LedgerDayCellProps = {
    cell: DayCellModel;
    selected: boolean;
    onPress: () => void;
};

export function LedgerDayCell({cell, selected, onPress}: LedgerDayCellProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const hasActivity = cell.postedSumInr > 0 || cell.hasScheduled;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Day ${cell.day}`}
            style={[
                styles.cell,
                {
                    borderColor: selected
                        ? colors.accent.sky
                        : cell.hasScheduled && !hasActivity
                          ? colors.status.border
                          : colors.status.border,
                    backgroundColor: selected
                        ? isDark
                            ? 'rgba(56, 189, 248, 0.14)'
                            : 'rgba(14, 165, 233, 0.1)'
                        : hasActivity
                          ? colors.bg.primary
                          : isDark
                            ? colors.bg.darker
                            : colors.bg.primary,
                    borderStyle: cell.hasScheduled && cell.postedSumInr === 0 ? 'dashed' : 'solid',
                },
            ]}
        >
            <View
                style={[
                    styles.memoryBar,
                    {
                        backgroundColor: cell.inMemory
                            ? colors.accent.sky
                            : 'transparent',
                    },
                ]}
            />
            <View className="mb-0.5 flex-row items-center justify-between">
                <View
                    className="h-5 min-w-[20px] items-center justify-center rounded-full px-1"
                    style={
                        cell.isToday
                            ? {backgroundColor: colors.accent.sky}
                            : undefined
                    }
                >
                    <AppText
                        variant="caption-xs"
                        className="font-bold"
                        style={{
                            color: cell.isToday
                                ? COLORS.light.text.contrast
                                : selected
                                  ? colors.accent.sky
                                  : colors.text.primary,
                        }}
                    >
                        {cell.day}
                    </AppText>
                </View>
                {cell.hasOpen ? (
                    <View
                        style={[
                            styles.openDot,
                            {backgroundColor: colors.status.warning},
                        ]}
                    />
                ) : null}
            </View>
            {cell.postedSumInr > 0 ? (
                <AppText
                    variant="caption-xs"
                    className="font-semibold"
                    style={{color: colors.text.lighter}}
                    numberOfLines={1}
                >
                    {formatInr(cell.postedSumInr)}
                </AppText>
            ) : cell.hasScheduled ? (
                <AppText
                    variant="caption-xs"
                    style={{color: colors.text.lighter}}
                    numberOfLines={1}
                >
                    Soon
                </AppText>
            ) : (
                <AppText variant="caption-xs" style={{color: 'transparent'}}>
                    —
                </AppText>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    cell: {
        width: '13.8%',
        marginHorizontal: '0.24%',
        minHeight: 64,
        paddingHorizontal: 4,
        paddingTop: 4,
        paddingBottom: 6,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 6,
    },
    memoryBar: {
        height: 3,
        borderRadius: 2,
        marginBottom: 4,
    },
    openDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
