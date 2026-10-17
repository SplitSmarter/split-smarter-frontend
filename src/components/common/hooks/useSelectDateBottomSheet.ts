import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';
import {
    ExpenseRecurringPeriod,
    EndType,
    DayOfWeek,
    DateSelectionResult,
    NonRecurringDateSchema,
    RecurringDateSchema,
} from '@/src/components/common/types/selectDateBottomSheet.types';

const todayYmd = () => new Date().toISOString().split('T')[0];

const clampToTodayIfNeeded = (ymd: string, allowFuture: boolean): string => {
    if (allowFuture) return ymd;
    const today = todayYmd();
    return ymd > today ? today : ymd;
};

export const useSelectDateBottomSheet = (
    visible: boolean,
    initialDate: string = todayYmd(),
    onClose: () => void,
    onConfirm: (result: DateSelectionResult) => void,
    allowFutureDates: boolean = false,
) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [activeTab, setActiveTab] = useState<'NO_REPEAT' | 'REPEAT'>('NO_REPEAT');
    const [selectedDate, setSelectedDate] = useState<string>(() =>
        clampToTodayIfNeeded(initialDate, allowFutureDates),
    );

    // Recurrence pattern state
    const [period, setPeriod] = useState<ExpenseRecurringPeriod>(ExpenseRecurringPeriod.DAILY);
    const [interval, setInterval] = useState<number>(1);
    const [selectedWeekdays, setSelectedWeekdays] = useState<DayOfWeek[]>(['TH']);
    const [monthlyOption, setMonthlyOption] = useState<'DAY_OF_MONTH' | 'NTH_WEEKDAY' | 'SPECIFIC_DATES'>('DAY_OF_MONTH');
    const [yearlyOption, setYearlyOption] = useState<'FIXED_DATE' | 'NTH_WEEKDAY_OCT' | 'SPECIFIC_MONTHS'>('FIXED_DATE');

    // Duration options state
    const [endType, setEndType] = useState<EndType>(EndType.NEVER);
    const [occurrenceCount, setOccurrenceCount] = useState<number>(10);
    const [untilDate, setUntilDate] = useState<string>(initialDate);

    useEffect(() => {
        if (visible) {
            setSelectedDate(clampToTodayIfNeeded(initialDate, allowFutureDates));
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, initialDate, allowFutureDates]);

    const snapPoints = useMemo(() => ['85%'], []);

    const maxSingleDate = allowFutureDates ? undefined : todayYmd();

    const selectSingleDate = useCallback(
        (ymd: string) => {
            setSelectedDate(clampToTodayIfNeeded(ymd, allowFutureDates));
        },
        [allowFutureDates],
    );

    const toggleWeekday = useCallback((day: DayOfWeek) => {
        setSelectedWeekdays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    }, []);

    const colors = isDark ? COLORS.dark : COLORS.light;

    const palette = useMemo(
        () => ({
            background: colors.bg.primary,
            cardBg: colors.bg.lighter,
            canvasBg: colors.bg.canvas,
            handle: colors.icon.lighter,
            textPrimary: colors.text.primary,
            textLighter: colors.text.lighter,
            accentSky: colors.accent.sky,
            accentSkyBg: colors.accent.skyBg,
            ctaBg: colors.brand.primary,
            ctaLabel: colors.text.contrast,
            border: colors.status.border,
            segmentedBg: colors.bg.darker,
        }),
        [colors]
    );

    const handleSave = useCallback(() => {
        Keyboard.dismiss();
        if (activeTab === 'NO_REPEAT') {
            const safeDate = clampToTodayIfNeeded(selectedDate, allowFutureDates);
            const payload: DateSelectionResult = {
                isRecurring: false,
                selectedDate: safeDate,
            };
            const parsed = NonRecurringDateSchema.parse(payload);
            onConfirm(parsed);
        } else {
            const selectedValuesPayload: Record<string, any> = {};

            if (period === ExpenseRecurringPeriod.WEEKLY) {
                selectedValuesPayload.byDay = selectedWeekdays;
            } else if (period === ExpenseRecurringPeriod.MONTHLY) {
                selectedValuesPayload.monthlyOption = monthlyOption;
            } else if (period === ExpenseRecurringPeriod.YEARLY) {
                selectedValuesPayload.yearlyOption = yearlyOption;
            }

            const payload: DateSelectionResult = {
                isRecurring: true,
                startDate: selectedDate,
                recurringPeriod: period,
                interval: interval || 1,
                selectedValues: Object.keys(selectedValuesPayload).length > 0 ? selectedValuesPayload : undefined,
                endType,
                occurrenceCount: endType === EndType.COUNT ? occurrenceCount || 1 : undefined,
                endDate: endType === EndType.UNTIL ? untilDate : undefined,
            };

            const parsed = RecurringDateSchema.parse(payload);
            onConfirm(parsed);
        }
        onClose();
    }, [
        activeTab,
        selectedDate,
        allowFutureDates,
        period,
        selectedWeekdays,
        monthlyOption,
        yearlyOption,
        interval,
        endType,
        occurrenceCount,
        untilDate,
        onConfirm,
        onClose,
    ]);

    return {
        isDark,
        bottomSheetModalRef,
        activeTab,
        selectedDate,
        period,
        interval,
        selectedWeekdays,
        monthlyOption,
        yearlyOption,
        endType,
        occurrenceCount,
        untilDate,
        snapPoints,
        palette,
        maxSingleDate,
        allowFutureDates,
        setActiveTab,
        setSelectedDate: selectSingleDate,
        setPeriod,
        setInterval,
        setMonthlyOption,
        setYearlyOption,
        setEndType,
        setOccurrenceCount,
        setUntilDate,
        toggleWeekday,
        handleSave,
    };
};