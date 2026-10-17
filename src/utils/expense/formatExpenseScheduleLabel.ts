import {ExpenseRecurringPeriod, Month} from '@/src/api/dto/expense/constant';
import {RecurringDateComponent} from '@/src/constants/expense/schedule';
import {normalizeRecurringPeriod} from '@/src/utils/expense/recurringDateMapper';

const WEEKDAY_SHORT: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
};

const MONTH_SHORT: Record<string, string> = {
    january: 'Jan',
    february: 'Feb',
    march: 'Mar',
    april: 'Apr',
    may: 'May',
    june: 'Jun',
    july: 'Jul',
    august: 'Aug',
    september: 'Sep',
    october: 'Oct',
    november: 'Nov',
    december: 'Dec',
};

const ordinal = (n: number): string => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    switch (n % 10) {
        case 1:
            return `${n}st`;
        case 2:
            return `${n}nd`;
        case 3:
            return `${n}rd`;
        default:
            return `${n}th`;
    }
};

const formatOneTimeDate = (isoOrDate: string): string => {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return 'Pick date';
    return d.toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'});
};

const weekdaysSummary = (details: RecurringDateComponent): string | null => {
    const days = (details.selected_values || [])
        .map((v) => ('weekday' in v ? WEEKDAY_SHORT[String(v.weekday).toLowerCase()] : null))
        .filter(Boolean) as string[];
    if (days.length === 0) return null;
    if (days.length <= 3) return days.join(', ');
    return `${days.slice(0, 2).join(', ')} +${days.length - 2}`;
};

const monthlyDaySummary = (details: RecurringDateComponent): string | null => {
    const day = (details.selected_values || []).find((v) => 'day' in v && !('month' in v));
    if (!day || !('day' in day)) return null;
    return ordinal(Number(day.day));
};

const yearlySummary = (details: RecurringDateComponent): string | null => {
    const entry = (details.selected_values || []).find(
        (v) => 'day' in v && 'month' in v,
    ) as {day: number; month: Month} | undefined;
    if (!entry) return null;
    const month = MONTH_SHORT[String(entry.month).toLowerCase()] || String(entry.month);
    return `${month} ${entry.day}`;
};

/**
 * Compact footer chip copy for one-time vs recurring expense dates.
 * One-time → "Fri, Oct 16"
 * Recurring → "Weekly · Mon, Wed" / "Monthly · 15th" / "Every 2 weeks"
 */
export const formatExpenseScheduleLabel = (
    expenseDate: string,
    isRecurring: boolean,
    recurringDetails: RecurringDateComponent | null | undefined,
): string => {
    if (!isRecurring || !recurringDetails) {
        return formatOneTimeDate(expenseDate);
    }

    let period: ExpenseRecurringPeriod;
    try {
        period = normalizeRecurringPeriod(String(recurringDetails.recurring_period));
    } catch {
        return `Repeats · ${formatOneTimeDate(expenseDate)}`;
    }

    const interval = Math.max(1, Number(recurringDetails.interval) || 1);
    const customDays = Math.max(
        1,
        Number(recurringDetails.custom_period_duration) || interval,
    );

    switch (period) {
        case ExpenseRecurringPeriod.DAILY:
            return interval === 1 ? 'Daily' : `Every ${interval} days`;

        case ExpenseRecurringPeriod.WEEKLY: {
            const days = weekdaysSummary(recurringDetails);
            if (interval === 1) {
                return days ? `Weekly · ${days}` : 'Weekly';
            }
            return days ? `Every ${interval} weeks · ${days}` : `Every ${interval} weeks`;
        }

        case ExpenseRecurringPeriod.MONTHLY: {
            const day = monthlyDaySummary(recurringDetails);
            if (interval === 1) {
                return day ? `Monthly · ${day}` : 'Monthly';
            }
            return day ? `Every ${interval} months · ${day}` : `Every ${interval} months`;
        }

        case ExpenseRecurringPeriod.YEARLY: {
            const when = yearlySummary(recurringDetails);
            if (interval === 1) {
                return when ? `Yearly · ${when}` : 'Yearly';
            }
            return when ? `Every ${interval} years · ${when}` : `Every ${interval} years`;
        }

        case ExpenseRecurringPeriod.CUSTOM:
            return customDays === 1 ? 'Every day' : `Every ${customDays} days`;

        default:
            return `Repeats · ${formatOneTimeDate(expenseDate)}`;
    }
};

export type ExpenseScheduleChipMode = 'once' | 'recurring';

export const getExpenseScheduleChipMode = (
    isRecurring: boolean,
    recurringDetails: RecurringDateComponent | null | undefined,
): ExpenseScheduleChipMode =>
    isRecurring && !!recurringDetails ? 'recurring' : 'once';
