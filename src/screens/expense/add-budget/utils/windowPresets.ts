import {BudgetWindowPreset} from '../types';

function toYmd(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function datesForWindowPreset(preset: BudgetWindowPreset): {
    startDate: string | null;
    endDate: string | null;
} {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset === 'forever') {
        return {startDate: null, endDate: null};
    }
    if (preset === 'this_month') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {startDate: toYmd(start), endDate: toYmd(end)};
    }
    if (preset === 'next_90') {
        const end = new Date(today);
        end.setDate(end.getDate() + 90);
        return {startDate: toYmd(today), endDate: toYmd(end)};
    }
    return {startDate: null, endDate: null};
}
