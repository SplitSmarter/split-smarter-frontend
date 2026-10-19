import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {BudgetPeriod} from '@/src/api/dto/expense/constant';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {BudgetWindowPreset, PERIOD_OPTIONS, WINDOW_PRESET_OPTIONS} from '../types';
import {getElevatedCardStyle} from '../styles/elevatedCard';
import {BudgetSectionHeader} from './BudgetSectionHeader';

function formatDisplayDate(ymd: string | null): string {
    if (!ymd) return '—';
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type Props = {
    period: BudgetPeriod;
    onPeriodChange: (p: BudgetPeriod) => void;
    windowPreset: BudgetWindowPreset;
    startDate: string | null;
    endDate: string | null;
    onOpenPicker: () => void;
};

export function BudgetWindowSection({
    period,
    onPeriodChange,
    windowPreset,
    startDate,
    endDate,
    onOpenPicker,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const presetLabel =
        WINDOW_PRESET_OPTIONS.find((o) => o.value === windowPreset)?.label ?? 'Forever';

    const summary = useMemo(() => {
        if (windowPreset === 'forever' || (!startDate && !endDate)) {
            return 'No fixed dates — follows reset period';
        }
        if (startDate && !endDate) {
            return `${formatDisplayDate(startDate)} → open-ended`;
        }
        return `${formatDisplayDate(startDate)} → ${formatDisplayDate(endDate)}`;
    }, [windowPreset, startDate, endDate]);

    return (
        <View>
            <BudgetSectionHeader
                title="Window"
                renderIcon={(c) => (
                    <Iconify icon="heroicons:clock" size={18} color={c} />
                )}
            />
            <View className="rounded-3xl border p-4" style={getElevatedCardStyle(isDark)}>
                <AppText
                    variant="caption-xs"
                    className="mb-2 font-semibold text-text-primary-lighter"
                >
                    Resets
                </AppText>
                <View className="mb-4 flex-row rounded-2xl border border-border-input bg-bg-primary p-1.5">
                    {PERIOD_OPTIONS.map((opt) => {
                        const selected = period === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => onPeriodChange(opt.value)}
                                className={`flex-1 items-center rounded-xl py-2.5 ${
                                    selected ? 'bg-accent-sky-bg' : ''
                                }`}
                            >
                                <AppText
                                    variant="caption-xs"
                                    className={`font-bold ${
                                        selected
                                            ? 'text-accent-sky'
                                            : 'text-text-primary-lighter'
                                    }`}
                                >
                                    {opt.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                <View className="border-t border-border-input pt-4">
                    <AppText
                        variant="caption-xs"
                        className="mb-2 font-semibold text-text-primary-lighter"
                    >
                        Dates · Optional
                    </AppText>
                    <Pressable
                        onPress={onOpenPicker}
                        accessibilityRole="button"
                        accessibilityLabel="Edit budget window"
                        className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-primary px-4 py-3.5 active:opacity-80"
                    >
                        <View className="flex-1 pr-3">
                            <View className="mb-1 flex-row items-center gap-2">
                                <View className="rounded-full border border-accent-sky bg-accent-sky-bg px-2 py-0.5">
                                    <AppText
                                        variant="caption-xs"
                                        className="font-bold text-accent-sky"
                                    >
                                        {presetLabel}
                                    </AppText>
                                </View>
                            </View>
                            <AppText className="font-semibold text-text-primary">
                                {summary}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-1 text-accent-sky"
                            >
                                Tap to change · future & open-ended supported
                            </AppText>
                        </View>
                        <Iconify
                            icon="heroicons:chevron-right"
                            size={18}
                            color={colors.icon.lighter}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
