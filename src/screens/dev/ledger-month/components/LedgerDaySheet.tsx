import React from 'react';
import {View, ScrollView, Pressable, StyleSheet} from 'react-native';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {Iconify} from 'react-native-iconify';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {LedgerEvent, LedgerLens, LedgerMemory} from '@/src/screens/dev/ledger-month/types';
import {formatInr, lensAmount} from '@/src/screens/dev/ledger-month/utils/formatInr';
import {getElevatedCardStyle} from '@/src/screens/dev/ledger-month/styles/elevatedCard';

type LedgerDaySheetProps = {
    visible: boolean;
    day: number | null;
    monthLabel: string;
    events: LedgerEvent[];
    lens: LedgerLens;
    memory: LedgerMemory;
    inMemory: boolean;
    onClose: () => void;
    onAddExpense: (day: number) => void;
};

export function LedgerDaySheet({
    visible,
    day,
    monthLabel,
    events,
    lens,
    memory,
    inMemory,
    onClose,
    onAddExpense,
}: LedgerDaySheetProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <AppBottomSheet
            isVisible={visible}
            onClose={onClose}
            snapPoints={['55%', '85%']}
            showCloseButton
        >
            <View className="flex-1 px-5 pb-6">
                <AppText
                    variant="caption-xs"
                    className="mb-1 font-semibold uppercase tracking-wider"
                    style={{color: colors.text.lighter}}
                >
                    Day ledger
                </AppText>
                <AppText
                    variant="h3"
                    className="mb-1 font-bold"
                    style={{color: colors.text.primary}}
                >
                    {day != null ? `${day} ${monthLabel}` : 'Day'}
                </AppText>
                <AppText
                    variant="caption-xs"
                    className="mb-4"
                    style={{color: colors.text.lighter}}
                >
                    Amounts follow the active lens · no payment accounts
                </AppText>

                {inMemory && memory.title ? (
                    <View className="mb-3 rounded-2xl border border-accent-sky bg-accent-sky-bg px-3.5 py-2.5">
                        <AppText
                            variant="body-xs"
                            className="font-semibold text-accent-sky"
                        >
                            {memory.title}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-0.5"
                            style={{color: colors.text.lighter}}
                        >
                            This day sits inside a memory band.
                        </AppText>
                    </View>
                ) : null}

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                    {events.length === 0 ? (
                        <View
                            className="items-center rounded-3xl border px-5 py-8"
                            style={getElevatedCardStyle(isDark)}
                        >
                            <View
                                className="mb-3 h-12 w-12 items-center justify-center rounded-full"
                                style={{backgroundColor: colors.bg.darker}}
                            >
                                <Iconify
                                    icon="heroicons:calendar-days"
                                    size={22}
                                    color={colors.icon.lighter}
                                />
                            </View>
                            <AppText
                                variant="body-small"
                                className="mb-1 text-center font-semibold"
                                style={{color: colors.text.primary}}
                            >
                                Nothing in this view
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mb-4 text-center"
                                style={{color: colors.text.lighter}}
                            >
                                Start an expense with this date filled in.
                            </AppText>
                            {day != null ? (
                                <AppButton
                                    variant="primary"
                                    onPress={() => onAddExpense(day)}
                                    renderIcon={(c) => (
                                        <Iconify
                                            icon="heroicons:plus-circle"
                                            size={18}
                                            color={c}
                                        />
                                    )}
                                >
                                    Add expense
                                </AppButton>
                            ) : null}
                        </View>
                    ) : (
                        events.map((event) => {
                            const statusColor = event.upcoming
                                ? colors.text.lighter
                                : event.settled
                                  ? colors.status.success
                                  : colors.status.warning;
                            const statusLabel = event.upcoming
                                ? 'Scheduled'
                                : event.settled
                                  ? 'Cleared'
                                  : 'Open';

                            return (
                                <View
                                    key={event.id}
                                    className="mb-3 rounded-3xl border p-4"
                                    style={getElevatedCardStyle(isDark)}
                                >
                                    <View className="mb-1.5 flex-row items-start justify-between">
                                        <AppText
                                            variant="body-base"
                                            className="min-w-0 flex-1 pr-2 font-semibold"
                                            style={{color: colors.text.primary}}
                                        >
                                            {event.name}
                                        </AppText>
                                        <AppText
                                            variant="body-small"
                                            className="font-bold"
                                            style={{color: colors.text.primary}}
                                        >
                                            {event.upcoming
                                                ? '—'
                                                : formatInr(lensAmount(event, lens))}
                                        </AppText>
                                    </View>

                                    <View className="mb-2 flex-row flex-wrap items-center gap-2">
                                        <View
                                            className="rounded-full border px-2 py-0.5"
                                            style={{
                                                backgroundColor: colors.bg.primary,
                                                borderColor: colors.status.border,
                                            }}
                                        >
                                            <AppText
                                                variant="caption-xs"
                                                style={{color: statusColor}}
                                                className="font-bold"
                                            >
                                                {statusLabel}
                                            </AppText>
                                        </View>
                                        <AppText
                                            variant="caption-xs"
                                            style={{color: colors.text.lighter}}
                                        >
                                            {event.category} · {event.leaf}
                                            {event.group
                                                ? ` · ${event.group}`
                                                : ' · Personal'}
                                        </AppText>
                                    </View>

                                    <AppText
                                        variant="caption-xs"
                                        style={{color: colors.text.primary}}
                                    >
                                        Paid by {event.paidBy} · Shared by {event.sharers}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-1"
                                        style={{color: colors.text.lighter}}
                                    >
                                        {event.currency === 'INR'
                                            ? `Full ${formatInr(event.totalInr)} · Share ${formatInr(event.myShareInr)} · You paid ${formatInr(event.iPaidInr)}`
                                            : `Full €${event.totalOriginal} (${formatInr(event.totalInr)}) · Share ${formatInr(event.myShareInr)} · You paid ${formatInr(event.iPaidInr)}`}
                                    </AppText>
                                    {event.place ? (
                                        <AppText
                                            variant="caption-xs"
                                            className="mt-1"
                                            style={{color: colors.text.primary}}
                                        >
                                            Place: {event.place}
                                        </AppText>
                                    ) : null}
                                </View>
                            );
                        })
                    )}

                    {events.length > 0 && day != null ? (
                        <Pressable
                            onPress={() => onAddExpense(day)}
                            className="mt-1 flex-row items-center justify-center rounded-2xl border py-3.5 active:opacity-80"
                            style={{
                                backgroundColor: colors.bg.lighter,
                                borderColor: colors.status.border,
                            }}
                        >
                            <Iconify
                                icon="heroicons:plus-circle"
                                size={18}
                                color={colors.accent.sky}
                            />
                            <AppText
                                variant="body-xs"
                                className="ml-2 font-semibold"
                                style={{color: colors.text.primary}}
                            >
                                Add expense on this day
                            </AppText>
                        </Pressable>
                    ) : null}
                </ScrollView>
            </View>
        </AppBottomSheet>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 0,
        maxHeight: 420,
    },
});
