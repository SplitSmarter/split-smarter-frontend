import {
    DateComponentUnion,
    DateCustom,
    DateMonthly,
    DateWeekly,
    DateYearly,
    RecurringDateComponent,
} from '@/src/api/dto/expense/expense';
import {ExpenseRecurringPeriod, Month, Weekday} from '@/src/api/dto/expense/constant';
import {
    DateSelectionResult,
    DayOfWeek,
} from '@/src/components/common/types/selectDateBottomSheet.types';
import {RecurringDateComponent as UiRecurringDateComponent} from '@/src/constants/expense/schedule';

const DOW_TO_WEEKDAY: Record<DayOfWeek, Weekday> = {
    MO: 'monday',
    TU: 'tuesday',
    WE: 'wednesday',
    TH: 'thursday',
    FR: 'friday',
    SA: 'saturday',
    SU: 'sunday',
};

const MONTH_INDEX_TO_VALUE: Month[] = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

const toDateOnly = (isoOrDate: string | undefined | null): string | null => {
    if (!isoOrDate) return null;
    return isoOrDate.includes('T') ? isoOrDate.split('T')[0] : isoOrDate;
};

const parseYmd = (ymd: string): {day: number; month: Month} => {
    const [y, m, d] = ymd.split('-').map((n) => Number(n));
    if (!y || !m || !d || m < 1 || m > 12) {
        throw new Error(`Invalid date for recurring mapping: ${ymd}`);
    }
    return {day: d, month: MONTH_INDEX_TO_VALUE[m - 1]};
};

/** Normalize any UI / legacy period token to the backend enum value. */
export const normalizeRecurringPeriod = (raw: string): ExpenseRecurringPeriod => {
    const key = raw.trim().toLowerCase();
    switch (key) {
        case 'daily':
            return ExpenseRecurringPeriod.DAILY;
        case 'weekly':
            return ExpenseRecurringPeriod.WEEKLY;
        case 'monthly':
            return ExpenseRecurringPeriod.MONTHLY;
        case 'yearly':
            return ExpenseRecurringPeriod.YEARLY;
        case 'custom':
            return ExpenseRecurringPeriod.CUSTOM;
        default:
            throw new Error(`Unsupported recurring_period: ${raw}`);
    }
};

/**
 * Builds backend `selected_values` from the date-picker UI result.
 * Backend unions are strictly `{weekday}` | `{day}` | `{day,month}` — never `byDay`.
 */
export const buildSelectedValuesFromDateSelection = (
    period: ExpenseRecurringPeriod,
    startDateYmd: string,
    selectedValues?: {
        byDay?: DayOfWeek[];
        monthlyOption?: string;
        yearlyOption?: string;
    }
): DateComponentUnion[] => {
    const {day, month} = parseYmd(startDateYmd);

    switch (period) {
        case ExpenseRecurringPeriod.DAILY:
            // Daily ignores selected_values in the scheduler; empty list is valid.
            return [];

        case ExpenseRecurringPeriod.WEEKLY: {
            const days = selectedValues?.byDay?.length
                ? selectedValues.byDay
                : ([
                      ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][
                          new Date(`${startDateYmd}T12:00:00`).getDay()
                      ] as DayOfWeek,
                  ]);
            return days.map((d): DateWeekly => ({weekday: DOW_TO_WEEKDAY[d]}));
        }

        case ExpenseRecurringPeriod.MONTHLY:
            return [{day} satisfies DateMonthly];

        case ExpenseRecurringPeriod.YEARLY:
            return [{day, month} satisfies DateYearly];

        case ExpenseRecurringPeriod.CUSTOM:
            return [{day} satisfies DateCustom];

        default:
            return [];
    }
};

/** Maps SelectDateBottomSheet confirm result → draft/API recurring_details. */
export const mapDateSelectionToRecurringDetails = (
    result: Extract<DateSelectionResult, {isRecurring: true}>
): UiRecurringDateComponent => {
    const period = normalizeRecurringPeriod(result.recurringPeriod);
    const start = toDateOnly(result.startDate)!;

    return {
        recurring_period: period,
        interval: Math.max(1, result.interval || 1),
        custom_period_duration:
            period === ExpenseRecurringPeriod.CUSTOM ? Math.max(1, result.interval || 1) : undefined,
        selected_values: buildSelectedValuesFromDateSelection(
            period,
            start,
            result.selectedValues
        ),
        start_date: start,
        end_date: result.endDate ? toDateOnly(result.endDate) ?? undefined : undefined,
    };
};

/**
 * Sanitizes draft recurring_details into the strict API shape
 * (lowercase enums, correct selected_values unions, YYYY-MM-DD dates).
 */
export const sanitizeRecurringDetailsForApi = (
    draft: UiRecurringDateComponent
): RecurringDateComponent => {
    const period = normalizeRecurringPeriod(String(draft.recurring_period));
    const start = toDateOnly(draft.start_date ?? null);
    const end = toDateOnly(draft.end_date ?? null);

    let selectedValues = (draft.selected_values || []) as DateComponentUnion[];

    // Legacy / UI shapes that still have byDay etc.
    const first = selectedValues[0] as unknown as Record<string, unknown> | undefined;
    if (first && ('byDay' in first || 'monthlyOption' in first || 'yearlyOption' in first)) {
        selectedValues = buildSelectedValuesFromDateSelection(
            period,
            start || new Date().toISOString().split('T')[0],
            first as {byDay?: DayOfWeek[]; monthlyOption?: string; yearlyOption?: string}
        );
    } else {
        selectedValues = selectedValues.map((v) => normalizeSelectedValue(v, period));
    }

    return {
        recurring_period: period,
        custom_period_duration:
            period === ExpenseRecurringPeriod.CUSTOM
                ? draft.custom_period_duration ?? draft.interval ?? 1
                : null,
        interval: Math.max(1, Number(draft.interval) || 1),
        selected_values: selectedValues,
        start_date: start,
        end_date: end,
    };
};

const normalizeSelectedValue = (
    value: DateComponentUnion | Record<string, unknown>,
    period: ExpenseRecurringPeriod
): DateComponentUnion => {
    const v = value as Record<string, unknown>;

    if (period === ExpenseRecurringPeriod.WEEKLY && typeof v.weekday === 'string') {
        return {weekday: String(v.weekday).toLowerCase() as Weekday};
    }
    if (
        (period === ExpenseRecurringPeriod.MONTHLY || period === ExpenseRecurringPeriod.CUSTOM) &&
        typeof v.day === 'number'
    ) {
        return {day: v.day};
    }
    if (
        period === ExpenseRecurringPeriod.YEARLY &&
        typeof v.day === 'number' &&
        typeof v.month === 'string'
    ) {
        return {day: v.day, month: String(v.month).toLowerCase() as Month};
    }

    // Already correct or unknown — return as-is for Pydantic to validate.
    return value as DateComponentUnion;
};
