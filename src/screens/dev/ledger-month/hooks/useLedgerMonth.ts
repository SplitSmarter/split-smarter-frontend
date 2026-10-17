import {useMemo, useState} from 'react';
import {loadLedgerMonth} from '@/src/screens/dev/ledger-month/mock/loadLedgerMonth';
import type {DayCellModel, LedgerEvent, LedgerLens, LedgerScope} from '@/src/screens/dev/ledger-month/types';
import {lensAmount} from '@/src/screens/dev/ledger-month/utils/formatInr';

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export function useLedgerMonth() {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(10);
    const [lens, setLens] = useState<LedgerLens>('share');
    const [scope, setScope] = useState<LedgerScope>('all');
    const [showUpcoming, setShowUpcoming] = useState(true);
    const [showMemory, setShowMemory] = useState(true);
    const [openOnly, setOpenOnly] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(16);

    const payload = useMemo(() => loadLedgerMonth(year, month), [year, month]);

    const visibleEvents = useMemo(() => {
        return payload.events.filter((event) => {
            if (scope !== 'all' && event.scope !== scope) return false;
            if (event.upcoming && !showUpcoming) return false;
            if (openOnly && (event.settled || event.upcoming)) return false;
            return true;
        });
    }, [payload.events, scope, showUpcoming, openOnly]);

    const posted = useMemo(
        () => visibleEvents.filter((event) => !event.upcoming),
        [visibleEvents],
    );

    const totals = useMemo(() => {
        const shareInr = posted.reduce((sum, e) => sum + e.myShareInr, 0);
        const paidInr = posted.reduce((sum, e) => sum + e.iPaidInr, 0);
        const openShareInr = posted
            .filter((e) => !e.settled)
            .reduce((sum, e) => sum + e.myShareInr, 0);
        return {
            shareInr,
            paidInr,
            openShareInr,
            postedCount: posted.length,
        };
    }, [posted]);

    const byDay = useMemo(() => {
        const map = new Map<number, LedgerEvent[]>();
        for (const event of visibleEvents) {
            const list = map.get(event.day) ?? [];
            list.push(event);
            map.set(event.day, list);
        }
        return map;
    }, [visibleEvents]);

    const memoryVisible =
        showMemory && scope !== 'personal' && scope !== 'flatmates' && !!payload.memory.id;

    const cells = useMemo((): DayCellModel[] => {
        const result: DayCellModel[] = [];
        for (let day = 1; day <= payload.daysInMonth; day++) {
            const events = byDay.get(day) ?? [];
            const postedDay = events.filter((e) => !e.upcoming);
            result.push({
                day,
                postedSumInr: postedDay.reduce((sum, e) => sum + lensAmount(e, lens), 0),
                hasOpen: postedDay.some((e) => !e.settled),
                hasScheduled: events.some((e) => e.upcoming),
                inMemory:
                    memoryVisible &&
                    day >= payload.memory.startDay &&
                    day <= payload.memory.endDay,
                isToday: day === payload.todayDay,
            });
        }
        return result;
    }, [payload, byDay, lens, memoryVisible]);

    const dayEvents = selectedDay != null ? (byDay.get(selectedDay) ?? []) : [];

    const budgetProgress = useMemo(() => {
        return payload.budgets.map((budget) => {
            let spent = 0;
            if (budget.category) {
                spent = posted
                    .filter((e) => e.category === budget.category)
                    .reduce((sum, e) => sum + e.myShareInr, 0);
            } else if (budget.scope) {
                spent = posted
                    .filter((e) => e.scope === budget.scope)
                    .reduce((sum, e) => sum + e.myShareInr, 0);
            }
            return {...budget, spent};
        });
    }, [payload.budgets, posted]);

    const goPrevMonth = () => {
        if (month === 1) {
            setYear((y) => y - 1);
            setMonth(12);
        } else {
            setMonth((m) => m - 1);
        }
        setSelectedDay(null);
    };

    const goNextMonth = () => {
        if (month === 12) {
            setYear((y) => y + 1);
            setMonth(1);
        } else {
            setMonth((m) => m + 1);
        }
        setSelectedDay(null);
    };

    const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

    return {
        year,
        month,
        monthLabel,
        payload,
        lens,
        setLens,
        scope,
        setScope,
        showUpcoming,
        setShowUpcoming,
        showMemory,
        setShowMemory,
        openOnly,
        setOpenOnly,
        selectedDay,
        setSelectedDay,
        totals,
        cells,
        dayEvents,
        budgetProgress,
        memory: payload.memory,
        memoryVisible,
        goPrevMonth,
        goNextMonth,
        leadingBlanks: payload.leadingBlanks,
    };
}
