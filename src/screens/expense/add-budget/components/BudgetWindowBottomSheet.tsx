import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Pressable, StyleSheet, View} from 'react-native';
import {
    BottomSheetBackdrop,
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetModal,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {Calendar} from 'react-native-calendars';
import type {DateData} from 'react-native-calendars';
import {addYears, format, parseISO} from 'date-fns';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {DateRangeDay} from '@/src/components/common/components/DateRangeDay';
import {buildDateRangeMarks} from '@/src/components/common/utils/buildDateRangeMarks';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {
    BudgetWindowPreset,
    BudgetWindowResult,
    WINDOW_PRESET_OPTIONS,
} from '../types';
import {datesForWindowPreset} from '../utils/windowPresets';

export type {BudgetWindowResult};

type Props = {
    visible: boolean;
    initialPreset: BudgetWindowPreset;
    initialStartDate: string | null;
    initialEndDate: string | null;
    onClose: () => void;
    onConfirm: (result: BudgetWindowResult) => void;
};

const todayIso = () => format(new Date(), 'yyyy-MM-dd');
const farFutureIso = () => format(addYears(new Date(), 5), 'yyyy-MM-dd');

function formatLabel(iso?: string | null) {
    if (!iso) return '—';
    try {
        return format(parseISO(iso), 'dd MMM yyyy');
    } catch {
        return iso;
    }
}

export function BudgetWindowBottomSheet({
    visible,
    initialPreset,
    initialStartDate,
    initialEndDate,
    onClose,
    onConfirm,
}: Props) {
    const theme = themeStore((s) => s.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const insets = useSafeAreaInsets();
    const footerPad = Math.max(insets.bottom, 12) + 8;

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['82%'], []);
    const maxSelectable = farFutureIso();

    const [preset, setPreset] = useState<BudgetWindowPreset>(initialPreset);
    const [startDate, setStartDate] = useState<string | undefined>(
        initialStartDate ?? undefined,
    );
    const [endDate, setEndDate] = useState<string | undefined>(
        initialEndDate ?? undefined,
    );
    const [calendarCurrent, setCalendarCurrent] = useState(
        () => initialStartDate ?? todayIso(),
    );

    useEffect(() => {
        if (visible) {
            setPreset(initialPreset);
            setStartDate(initialStartDate ?? undefined);
            setEndDate(initialEndDate ?? undefined);
            setCalendarCurrent(initialStartDate ?? todayIso());
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, initialPreset, initialStartDate, initialEndDate]);

    const palette = useMemo(
        () => ({
            background: isDark ? colors.bg.canvas : colors.bg.primary,
            cardBg: isDark ? colors.bg.overlay : colors.bg.lighter,
            borderSoft: colors.bg.darker,
            handle: colors.status.border,
            textPrimary: colors.text.primary,
            textLighter: colors.text.lighter,
            border: colors.status.border,
            iconPrimary: colors.icon.primary,
            range: colors.accent.sky,
            rangeMiddle: colors.accent.skyBg,
            textOnMiddle: colors.accent.sky,
            todayRing: colors.accent.sky,
            todayText: colors.accent.sky,
            chipBg: colors.bg.darker,
            chipActiveBg: colors.accent.skyBg,
            chipActiveBorder: colors.accent.sky,
            ctaBg: colors.brand.primary,
            ctaDisabled: colors.status.border,
            ctaLabel: colors.text.contrast,
            ctaLabelDisabled: `${colors.text.contrast}73`,
            textDisabled: colors.text.placeholder,
        }),
        [colors, isDark],
    );

    const markedDates = useMemo(
        () =>
            buildDateRangeMarks(startDate, endDate, {
                range: palette.range,
                rangeMiddle: palette.rangeMiddle,
                textOnRange: COLORS.light.text.contrast,
                textOnMiddle: palette.textOnMiddle,
            }),
        [startDate, endDate, palette.range, palette.rangeMiddle, palette.textOnMiddle],
    );

    const showCalendar = preset === 'custom';

    const canConfirm = useMemo(() => {
        if (preset === 'forever') return true;
        if (preset === 'this_month' || preset === 'next_90') {
            return Boolean(startDate && endDate);
        }
        // Custom: start required; end optional (open-ended)
        return Boolean(startDate);
    }, [preset, startDate, endDate]);

    const applyPreset = useCallback((next: BudgetWindowPreset) => {
        setPreset(next);
        if (next === 'forever') {
            setStartDate(undefined);
            setEndDate(undefined);
            return;
        }
        if (next === 'custom') {
            // Keep existing dates if any; otherwise wait for taps
            return;
        }
        const dates = datesForWindowPreset(next);
        setStartDate(dates.startDate ?? undefined);
        setEndDate(dates.endDate ?? undefined);
        if (dates.startDate) setCalendarCurrent(dates.startDate);
    }, []);

    const onDayPress = useCallback(
        (day: DateData) => {
            if (preset !== 'custom') return;
            const pressed = day.dateString;
            if (pressed > maxSelectable) return;

            if (!startDate || (startDate && endDate)) {
                setStartDate(pressed);
                setEndDate(undefined);
                return;
            }

            if (pressed < startDate) {
                setEndDate(startDate);
                setStartDate(pressed);
                return;
            }

            setEndDate(pressed);
        },
        [preset, startDate, endDate, maxSelectable],
    );

    const clearOpenEnd = useCallback(() => {
        setEndDate(undefined);
        setPreset('custom');
    }, []);

    const clearAll = useCallback(() => {
        setPreset('forever');
        setStartDate(undefined);
        setEndDate(undefined);
    }, []);

    const handleSave = useCallback(() => {
        if (!canConfirm) return;
        Keyboard.dismiss();

        if (preset === 'forever') {
            onConfirm({preset: 'forever', startDate: null, endDate: null});
            onClose();
            return;
        }

        if (preset === 'this_month' || preset === 'next_90') {
            const dates = datesForWindowPreset(preset);
            onConfirm({
                preset,
                startDate: dates.startDate,
                endDate: dates.endDate,
            });
            onClose();
            return;
        }

        // custom
        if (!startDate) return;
        let safeStart = startDate;
        let safeEnd = endDate ?? null;
        if (safeEnd && safeEnd < safeStart) {
            const tmp = safeStart;
            safeStart = safeEnd;
            safeEnd = tmp;
        }
        onConfirm({
            preset: 'custom',
            startDate: safeStart,
            endDate: safeEnd,
        });
        onClose();
    }, [canConfirm, preset, startDate, endDate, onConfirm, onClose]);

    const durationCopy = useMemo(() => {
        if (preset === 'forever') return 'No fixed dates — follows reset period';
        if (!startDate && !endDate) return 'Pick a start date on the calendar';
        if (startDate && !endDate) {
            return `${formatLabel(startDate)}  →  open-ended`;
        }
        return `${formatLabel(startDate)}  →  ${formatLabel(endDate)}`;
    }, [preset, startDate, endDate]);

    const dayTheme = useMemo(
        () => ({
            dayTextColor: palette.textPrimary,
            textDisabledColor: palette.textDisabled,
            todayTextColor: palette.todayText,
            todayRingColor: palette.todayRing,
        }),
        [palette],
    );

    const BoundDay = useMemo(() => {
        const Comp = (props: any) => <DateRangeDay {...props} theme={dayTheme} />;
        Comp.displayName = 'BoundBudgetWindowDay';
        return Comp;
    }, [dayTheme]);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.7 : 0.4}
            />
        ),
        [isDark],
    );

    const renderFooter = useCallback(
        (props: BottomSheetFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={0}>
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 12,
                        paddingBottom: footerPad,
                        backgroundColor: palette.background,
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: palette.borderSoft,
                    }}
                >
                    <Pressable
                        onPress={handleSave}
                        disabled={!canConfirm}
                        className="h-12 flex-row items-center justify-center gap-2 rounded-2xl"
                        style={{
                            backgroundColor: canConfirm ? palette.ctaBg : palette.ctaDisabled,
                        }}
                    >
                        <Iconify
                            icon="heroicons:check-circle"
                            size={20}
                            color={canConfirm ? palette.ctaLabel : palette.ctaLabelDisabled}
                        />
                        <AppText
                            className="text-base font-bold"
                            style={{
                                color: canConfirm ? palette.ctaLabel : palette.ctaLabelDisabled,
                            }}
                        >
                            Apply window
                        </AppText>
                    </Pressable>
                </View>
            </BottomSheetFooter>
        ),
        [footerPad, palette, canConfirm, handleSave],
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            footerComponent={renderFooter}
            backgroundStyle={{
                backgroundColor: palette.background,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
            }}
            handleIndicatorStyle={{
                backgroundColor: palette.handle,
                width: 40,
                height: 4,
                marginTop: 6,
            }}
        >
            <View
                className="flex-row items-center px-4 pb-3 pt-1"
                style={{
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: palette.borderSoft,
                }}
            >
                <View className="w-16 items-start">
                    <Pressable
                        onPress={onClose}
                        hitSlop={12}
                        className="h-9 w-9 items-center justify-center rounded-full"
                        style={{backgroundColor: palette.chipBg}}
                    >
                        <Iconify icon="heroicons:x-mark" size={18} color={palette.iconPrimary} />
                    </Pressable>
                </View>
                <AppText
                    className="flex-1 text-center text-[17px] font-bold"
                    style={{color: palette.textPrimary}}
                >
                    Budget window
                </AppText>
                <View className="w-16 items-end">
                    <Pressable onPress={clearAll} hitSlop={12} className="py-2">
                        <AppText className="text-sm font-semibold" style={{color: palette.todayText}}>
                            Forever
                        </AppText>
                    </Pressable>
                </View>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 88 + footerPad,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    className="rounded-2xl border px-3.5 py-2.5"
                    style={{
                        backgroundColor: palette.cardBg,
                        borderColor: palette.border,
                    }}
                >
                    <AppText
                        className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{color: palette.textLighter}}
                    >
                        Window
                    </AppText>
                    <AppText
                        className="text-[15px] font-bold"
                        style={{color: palette.textPrimary}}
                    >
                        {durationCopy}
                    </AppText>
                </View>

                <View className="flex-row flex-wrap gap-2">
                    {WINDOW_PRESET_OPTIONS.map((opt) => {
                        const active = preset === opt.value;
                        return (
                            <Pressable
                                key={opt.value}
                                onPress={() => applyPreset(opt.value)}
                                className="h-9 items-center justify-center rounded-full border px-3"
                                style={{
                                    backgroundColor: active
                                        ? palette.chipActiveBg
                                        : palette.chipBg,
                                    borderColor: active
                                        ? palette.chipActiveBorder
                                        : palette.border,
                                    minWidth: '22%',
                                    flexGrow: 1,
                                }}
                            >
                                <AppText
                                    className="text-[11px] font-semibold"
                                    style={{
                                        color: active ? palette.range : palette.textLighter,
                                    }}
                                >
                                    {opt.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {preset === 'forever' ? (
                    <View
                        className="flex-row items-start gap-2 rounded-2xl border px-3 py-3"
                        style={{
                            backgroundColor: palette.cardBg,
                            borderColor: palette.border,
                        }}
                    >
                        <Iconify
                            icon="heroicons:arrow-path"
                            size={18}
                            color={palette.range}
                        />
                        <AppText
                            className="flex-1 text-xs"
                            style={{color: palette.textLighter}}
                        >
                            No start or end date. The budget follows its reset cadence with no
                            fixed calendar bound.
                        </AppText>
                    </View>
                ) : null}

                {showCalendar ? (
                    <>
                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={clearOpenEnd}
                                disabled={!startDate}
                                className="h-9 flex-1 items-center justify-center rounded-full border"
                                style={{
                                    backgroundColor: startDate && !endDate
                                        ? palette.chipActiveBg
                                        : palette.chipBg,
                                    borderColor: startDate && !endDate
                                        ? palette.chipActiveBorder
                                        : palette.border,
                                    opacity: startDate ? 1 : 0.45,
                                }}
                            >
                                <AppText
                                    className="text-[11px] font-semibold"
                                    style={{
                                        color:
                                            startDate && !endDate
                                                ? palette.range
                                                : palette.textLighter,
                                    }}
                                >
                                    Open-ended (no end)
                                </AppText>
                            </Pressable>
                        </View>

                        <AppText className="text-xs" style={{color: palette.textLighter}}>
                            Tap a start day, then optionally an end day. Future dates are allowed.
                        </AppText>

                        <View
                            className="overflow-hidden rounded-3xl border px-1 pb-2 pt-1"
                            style={{
                                backgroundColor: palette.cardBg,
                                borderColor: palette.border,
                            }}
                        >
                            <Calendar
                                key={`budget-win-${theme}-${palette.cardBg}-${calendarCurrent}`}
                                current={calendarCurrent}
                                onDayPress={onDayPress}
                                maxDate={maxSelectable}
                                markingType="period"
                                markedDates={markedDates}
                                dayComponent={BoundDay}
                                enableSwipeMonths
                                hideExtraDays={false}
                                style={{backgroundColor: palette.cardBg}}
                                headerStyle={{backgroundColor: palette.cardBg}}
                                theme={
                                    {
                                        calendarBackground: palette.cardBg,
                                        textSectionTitleColor: palette.textLighter,
                                        selectedDayBackgroundColor: palette.range,
                                        selectedDayTextColor: palette.ctaLabel,
                                        todayTextColor: palette.todayText,
                                        todayBackgroundColor: 'transparent',
                                        dayTextColor: palette.textPrimary,
                                        textDisabledColor: palette.textDisabled,
                                        monthTextColor: palette.textPrimary,
                                        arrowColor: palette.range,
                                        textMonthFontWeight: '700',
                                        textDayHeaderFontWeight: '600',
                                        textDayFontWeight: '500',
                                        textDayHeaderFontSize: 12,
                                        weekVerticalMargin: 6,
                                    } as React.ComponentProps<typeof Calendar>['theme']
                                }
                            />
                        </View>
                    </>
                ) : null}

                {(preset === 'this_month' || preset === 'next_90') && startDate && endDate ? (
                    <View
                        className="flex-row items-center gap-2 rounded-2xl border px-3 py-3"
                        style={{
                            backgroundColor: palette.cardBg,
                            borderColor: palette.border,
                        }}
                    >
                        <Iconify
                            icon="heroicons:calendar-days"
                            size={18}
                            color={palette.range}
                        />
                        <AppText
                            className="flex-1 text-xs font-semibold"
                            style={{color: palette.textPrimary}}
                        >
                            {formatLabel(startDate)} → {formatLabel(endDate)}
                        </AppText>
                    </View>
                ) : null}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}
