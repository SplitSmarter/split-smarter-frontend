import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard} from 'react-native';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {format, parseISO, startOfMonth, startOfYear, subDays} from 'date-fns';
import type {DateData} from 'react-native-calendars';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {buildDateRangeMarks} from '@/src/components/common/utils/buildDateRangeMarks';
import type {
    DateRangePresetId,
    DateRangeResult,
} from '@/src/components/common/types/dateRangeBottomSheet.types';

const todayIso = () => format(new Date(), 'yyyy-MM-dd');

export const useDateRangeBottomSheet = (
    visible: boolean,
    initialStartDate: string | undefined,
    initialEndDate: string | undefined,
    onClose: () => void,
    onConfirm: (result: DateRangeResult) => void,
    maxDate?: string,
    onClearFilter?: () => void
) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const maxSelectable = maxDate ?? todayIso();

    const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
    const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);
    const [activePreset, setActivePreset] = useState<DateRangePresetId | null>(null);
    // Visible month when the sheet opens — do not retarget on every day tap
    const [calendarCurrent, setCalendarCurrent] = useState(
        () => initialStartDate ?? initialEndDate ?? maxSelectable
    );

    useEffect(() => {
        if (visible) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
            setActivePreset(null);
            setCalendarCurrent(initialStartDate ?? initialEndDate ?? maxSelectable);
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
        // maxSelectable is todayIso()-derived and stable enough for open; omit from deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, initialStartDate, initialEndDate]);

    const snapPoints = useMemo(() => ['76%'], []);

    const palette = useMemo(
        () => ({
            // Match dashboard dark canvas (#0C0C0C); cards sit slightly elevated
            background: isDark ? colors.bg.canvas : colors.bg.primary,
            cardBg: isDark ? colors.bg.overlay : colors.bg.lighter,
            // Keep in sync with cardBg — calendar inners historically used this token
            canvasBg: isDark ? colors.bg.overlay : colors.bg.lighter,
            handle: colors.status.border,
            textPrimary: colors.text.primary,
            textLighter: colors.text.lighter,
            border: colors.status.border,
            borderSoft: isDark ? '#1A1A1A' : colors.status.border,
            iconPrimary: colors.icon.primary,
            // Warm range accents (dashboard filter chrome)
            range: isDark ? '#F08A3A' : '#E07A2F',
            rangeMiddle: isDark ? '#3D2918' : '#FDEAD7',
            textOnMiddle: isDark ? '#FED7AA' : '#9A3412',
            todayRing: isDark ? '#F08A3A' : '#E07A2F',
            todayText: isDark ? '#FDBA74' : '#C2410C',
            chipBg: isDark ? colors.bg.darker : colors.bg.darker,
            chipActiveBg: isDark ? '#3D2918' : '#FDEAD7',
            chipActiveBorder: isDark ? '#F08A3A' : '#E07A2F',
            ctaBg: isDark ? '#E07A2F' : '#D2691E',
            ctaDisabled: isDark ? '#4A3420' : '#F6C9A3',
            ctaLabel: colors.text.contrast,
            ctaLabelDisabled: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(122, 54, 18, 0.45)',
            textDisabled: isDark ? '#525252' : '#A1A1AA',
        }),
        [colors, isDark]
    );

    const markedDates = useMemo(
        () =>
            buildDateRangeMarks(startDate, endDate, {
                range: palette.range,
                rangeMiddle: palette.rangeMiddle,
                textOnRange: '#FFFFFF',
                textOnMiddle: palette.textOnMiddle,
            }),
        [startDate, endDate, palette.range, palette.rangeMiddle, palette.textOnMiddle]
    );

    const canConfirm = Boolean(startDate && endDate);

    const onDayPress = useCallback(
        (day: DateData) => {
            const pressed = day.dateString;
            if (pressed > maxSelectable) return;

            setActivePreset(null);

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
        [startDate, endDate, maxSelectable]
    );

    const applyPreset = useCallback(
        (preset: DateRangePresetId) => {
            const today = parseISO(maxSelectable);
            let start: Date;
            const end: Date = today;

            switch (preset) {
                case '7d':
                    start = subDays(today, 6);
                    break;
                case '30d':
                    start = subDays(today, 29);
                    break;
                case 'this_month':
                    start = startOfMonth(today);
                    break;
                case 'this_year':
                    start = startOfYear(today);
                    break;
            }

            const startIso = format(start, 'yyyy-MM-dd');
            const endIso = format(end, 'yyyy-MM-dd');
            setStartDate(startIso);
            setEndDate(endIso);
            setActivePreset(preset);
            // Jump month only for presets (not every tap)
            setCalendarCurrent(startIso);
        },
        [maxSelectable]
    );

    const clearRange = useCallback(() => {
        setStartDate(undefined);
        setEndDate(undefined);
        setActivePreset(null);
        onClearFilter?.();
    }, [onClearFilter]);

    const handleSave = useCallback(() => {
        if (!startDate || !endDate) return;
        const safeEnd = endDate > maxSelectable ? maxSelectable : endDate;
        const safeStart = startDate > maxSelectable ? maxSelectable : startDate;
        Keyboard.dismiss();
        onConfirm({
            startDate: safeStart <= safeEnd ? safeStart : safeEnd,
            endDate: safeStart <= safeEnd ? safeEnd : safeStart,
        });
        onClose();
    }, [startDate, endDate, maxSelectable, onConfirm, onClose]);

    const formatLabel = useCallback((iso?: string) => {
        if (!iso) return '—';
        try {
            return format(parseISO(iso), 'dd.MM.yyyy');
        } catch {
            return iso;
        }
    }, []);

    return {
        theme,
        isDark,
        bottomSheetModalRef,
        snapPoints,
        palette,
        startDate,
        endDate,
        activePreset,
        markedDates,
        canConfirm,
        calendarCurrent,
        maxDate: maxSelectable,
        onDayPress,
        applyPreset,
        clearRange,
        handleSave,
        formatLabel,
    };
};
