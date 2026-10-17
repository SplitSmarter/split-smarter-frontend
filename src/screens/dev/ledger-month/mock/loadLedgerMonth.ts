import type {LedgerMonthPayload} from '@/src/screens/dev/ledger-month/types';
import {OCTOBER_2026_PAYLOAD} from '@/src/screens/dev/ledger-month/mock/octoberLedgerMock';

function emptyMonth(year: number, month: number): LedgerMonthPayload {
    const daysInMonth = new Date(year, month, 0).getDate();
    const weekday = new Date(year, month - 1, 1).getDay(); // Sun=0
    const leadingBlanks = (weekday + 6) % 7; // Monday-start
    return {
        year,
        month,
        daysInMonth,
        leadingBlanks,
        todayDay: -1,
        events: [],
        memory: {id: '', title: '', startDay: 0, endDay: 0},
        budgets: [],
    };
}

/** Dummy loader — only October 2026 has data. Swap for API later. */
export function loadLedgerMonth(year: number, month: number): LedgerMonthPayload {
    if (year === OCTOBER_2026_PAYLOAD.year && month === OCTOBER_2026_PAYLOAD.month) {
        return OCTOBER_2026_PAYLOAD;
    }
    return emptyMonth(year, month);
}
