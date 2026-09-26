import { z } from 'zod';

export enum ExpenseRecurringPeriod {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum EndType {
    NEVER = 'NEVER',
    COUNT = 'COUNT',
    UNTIL = 'UNTIL',
}

export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export const NonRecurringDateSchema = z.object({
    isRecurring: z.literal(false),
    selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const RecurringDateSchema = z.object({
    isRecurring: z.literal(true),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    recurringPeriod: z.nativeEnum(ExpenseRecurringPeriod),
    interval: z.number().int().min(1),
    selectedValues: z
        .object({
            byDay: z.array(z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])).optional(),
            monthlyOption: z.enum(['DAY_OF_MONTH', 'NTH_WEEKDAY', 'SPECIFIC_DATES']).optional(),
            yearlyOption: z.enum(['FIXED_DATE', 'NTH_WEEKDAY_OCT', 'SPECIFIC_MONTHS']).optional(),
        })
        .optional(),
    endType: z.nativeEnum(EndType),
    occurrenceCount: z.number().int().min(1).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const DateSelectionSchema = z.discriminatedUnion('isRecurring', [
    NonRecurringDateSchema,
    RecurringDateSchema,
]);

export type DateSelectionResult = z.infer<typeof DateSelectionSchema>;

export interface SelectDateBottomSheetProps {
    visible: boolean;
    initialDate?: string;
    onClose: () => void;
    onConfirm: (result: DateSelectionResult) => void;
}