import {eachDayOfInterval, format, isBefore, parseISO} from 'date-fns';
import type {DateRangeDayMarking} from '@/src/components/common/components/DateRangeDay';
import { COLORS } from '@/src/constants/colors';

export type DateRangeMarkColors = {
    range: string;
    rangeMiddle: string;
    textOnRange: string;
    textOnMiddle: string;
};

/**
 * Builds markedDates for a continuous glass period range.
 * Endpoints use solid `range`; the connecting track uses translucent `rangeMiddle`.
 */
export function buildDateRangeMarks(
    startDate?: string,
    endDate?: string,
    colors?: DateRangeMarkColors
): Record<string, DateRangeDayMarking> {
    const palette: DateRangeMarkColors = colors ?? {
        range: COLORS.light.accent.sky,
        rangeMiddle: COLORS.light.accent.skyBg,
        textOnRange: COLORS.light.text.contrast,
        textOnMiddle: COLORS.light.text.primary,
    };

    if (!startDate) {
        return {};
    }

    if (!endDate || startDate === endDate) {
        return {
            [startDate]: {
                startingDay: true,
                endingDay: true,
                color: palette.range,
                textColor: palette.textOnRange,
                rangeFill: palette.rangeMiddle,
            },
        };
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const [from, to] = isBefore(start, end) ? [start, end] : [end, start];
    const days = eachDayOfInterval({start: from, end: to});
    const marked: Record<string, DateRangeDayMarking> = {};

    days.forEach((day, index) => {
        const key = format(day, 'yyyy-MM-dd');
        if (index === 0) {
            marked[key] = {
                startingDay: true,
                color: palette.range,
                textColor: palette.textOnRange,
                rangeFill: palette.rangeMiddle,
            };
            return;
        }
        if (index === days.length - 1) {
            marked[key] = {
                endingDay: true,
                color: palette.range,
                textColor: palette.textOnRange,
                rangeFill: palette.rangeMiddle,
            };
            return;
        }
        marked[key] = {
            color: palette.rangeMiddle,
            textColor: palette.textOnMiddle,
            rangeFill: palette.rangeMiddle,
        };
    });

    return marked;
}
