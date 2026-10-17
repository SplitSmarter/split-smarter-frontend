export type LedgerLens = 'share' | 'paid' | 'total';

export type LedgerScope = 'all' | 'personal' | 'flatmates' | 'goa';

export type LedgerEvent = {
    id: string;
    day: number;
    name: string;
    category: string;
    leaf: string;
    scope: Exclude<LedgerScope, 'all'>;
    group?: string;
    place?: string;
    memory?: string;
    currency: string;
    totalOriginal: number;
    totalInr: number;
    myShareInr: number;
    iPaidInr: number;
    settled: boolean;
    upcoming: boolean;
    source: string;
    paidBy: string;
    sharers: string;
    detail: string;
};

export type LedgerMemory = {
    id: string;
    title: string;
    startDay: number;
    endDay: number;
};

export type LedgerBudget = {
    id: string;
    name: string;
    capMode: 'soft' | 'hard';
    windowLabel: string;
    amount: number;
    category?: string;
    scope?: Exclude<LedgerScope, 'all'>;
};

export type LedgerMonthPayload = {
    year: number;
    month: number;
    daysInMonth: number;
    leadingBlanks: number;
    todayDay: number;
    events: LedgerEvent[];
    memory: LedgerMemory;
    budgets: LedgerBudget[];
};

export type DayCellModel = {
    day: number;
    postedSumInr: number;
    hasOpen: boolean;
    hasScheduled: boolean;
    inMemory: boolean;
    isToday: boolean;
};
