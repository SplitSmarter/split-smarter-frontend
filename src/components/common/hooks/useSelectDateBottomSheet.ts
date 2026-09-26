import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { themeStore } from '@/src/store/themeStore';
import {
    ExpenseRecurringPeriod,
    EndType,
    DayOfWeek,
    DateSelectionResult,
    NonRecurringDateSchema,
    RecurringDateSchema,
} from '@/src/components/common/types/selectDateBottomSheet.types';

export const useSelectDateBottomSheet = (
    visible: boolean,
    initialDate: string = new Date().toISOString().split('T')[0],
    onClose: () => void,
    onConfirm: (result: DateSelectionResult) => void
) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [activeTab, setActiveTab] = useState<'NO_REPEAT' | 'REPEAT'>('NO_REPEAT');
    const [selectedDate, setSelectedDate] = useState<string>(initialDate);

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
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    const snapPoints = useMemo(() => ['85%'], []);

    const toggleWeekday = useCallback((day: DayOfWeek) => {
        setSelectedWeekdays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    }, []);

    const palette = useMemo(
        () => ({
            background: isDark ? '#111827' : '#F8FAFC',
            cardBg: isDark ? '#1F2937' : '#FFFFFF',
            canvasBg: isDark ? '#0F172A' : '#FFFFFF',
            handle: isDark ? '#374151' : '#CBD5E1',
            textPrimary: isDark ? '#F9FAFB' : '#0F172A',
            textLighter: isDark ? '#9CA3AF' : '#64748B',
            accentSky: isDark ? '#38BDF8' : '#0284C7',
            accentSkyBg: isDark ? 'rgba(56, 189, 248, 0.12)' : '#E0F2FE',
            ctaBg: '#10B981',
            border: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
            segmentedBg: isDark ? '#1F2937' : '#E2E8F0',
        }),
        [isDark]
    );

    const handleSave = useCallback(() => {
        Keyboard.dismiss();
        if (activeTab === 'NO_REPEAT') {
            const payload: DateSelectionResult = {
                isRecurring: false,
                selectedDate,
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
        setActiveTab,
        setSelectedDate,
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