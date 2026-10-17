import {create} from 'zustand';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';

interface OpenExpenseDetailsOptions {
    seed?: ExpenseDetailsBasicResponse | null;
    /** Prefer map dummy hydrate (trail / map activity) instead of live GET. */
    useDummy?: boolean;
}

interface ExpenseDetailsSheetState {
    visible: boolean;
    expenseId: number | null;
    seed: ExpenseDetailsBasicResponse | null;
    useDummy: boolean;
    open: (expenseId: number, options?: OpenExpenseDetailsOptions) => void;
    close: () => void;
}

export const expenseDetailsSheetStore = create<ExpenseDetailsSheetState>((set) => ({
    visible: false,
    expenseId: null,
    seed: null,
    useDummy: false,
    open: (expenseId, options = {}) =>
        set({
            visible: true,
            expenseId,
            seed: options.seed ?? null,
            useDummy: options.useDummy ?? false,
        }),
    close: () =>
        set({
            visible: false,
            expenseId: null,
            seed: null,
            useDummy: false,
        }),
}));
