import type {
    ExpenseDetailsBasicResponse,
    ExpenseDetailsResponse,
} from '@/src/api/dto/expense/expense';
import type {MemoryResponse} from '@/src/api/dto/user/memory';
import type {ListExpensesQueryParams} from '@/src/api/expense/expense';
import {DUMMY_EXPENSES, MEMORIES} from '../dummyExpenseMapData';

function expenseDayKey(expenseDate: string): string {
    return expenseDate.includes('T')
        ? expenseDate.split('T')[0]
        : expenseDate.slice(0, 10);
}

/**
 * List memories for the map options sheet.
 * Dummy today — swap body for `GetMemoriesApi` later (same return type).
 */
export async function listMapMemories(): Promise<MemoryResponse[]> {
    return Object.values(MEMORIES).map((m) => ({
        ...m,
        assets: [],
        created_at: m.start_at,
    }));
}

/**
 * List expenses for the map, honoring the same query shape as `listUserExpensesApi`.
 * Dummy today — swap body for `listUserExpensesApi(params)` later.
 */
export async function listMapExpenses(
    params: ListExpensesQueryParams = {}
): Promise<ExpenseDetailsBasicResponse[]> {
    let rows = [...DUMMY_EXPENSES];

    if (params.memory_id?.length) {
        const ids = new Set(params.memory_id.map(Number));
        rows = rows.filter(
            (e) => e.memory?.id != null && ids.has(Number(e.memory.id))
        );
    }

    if (params.start_date) {
        rows = rows.filter(
            (e) => expenseDayKey(e.expense_date) >= params.start_date!
        );
    }
    if (params.end_date) {
        rows = rows.filter(
            (e) => expenseDayKey(e.expense_date) <= params.end_date!
        );
    }

    if (params.place_id?.length) {
        const placeIds = new Set(params.place_id.map(Number));
        rows = rows.filter(
            (e) => e.place?.id != null && placeIds.has(Number(e.place.id))
        );
    }

    const offset = params.offset ?? 0;
    const limit = params.limit ?? 100;
    return rows.slice(offset, offset + limit);
}

/**
 * Single expense for map / trail detail sheet.
 * Dummy today — swap for `getExpenseByIdApi(expenseId)` later.
 */
export async function getMapExpenseById(
    expenseId: number
): Promise<ExpenseDetailsResponse | null> {
    const basic = DUMMY_EXPENSES.find((e) => Number(e.id) === Number(expenseId));
    if (!basic) return null;

    const self = basic.paid_by_users[0];
    const lineTotal = basic.total_amount;
    const qty = 1;

    return {
        ...basic,
        payment_links: basic.payment_links ?? [],
        description: `Visit at ${basic.place?.name ?? basic.name}`,
        assets: basic.has_attachment
            ? [
                  {
                      id: `dummy-asset-${basic.id}`,
                      name: 'receipt',
                      url: 'https://assets.app/receipts/sample.png',
                      extension: 'png',
                  },
              ]
            : [],
        created_by: self ?? {
            id: 1,
            name: 'Self',
            user_type: 'CUSTOM' as any,
            avatar: {
                id: 'avatar-1',
                name: 'profile',
                url: 'https://assets.app/avatars/user.png',
                extension: 'png',
            },
        },
        created_at: basic.expense_date,
        updated_at: basic.expense_date,
        extra_details: [],
        schedule_blueprint: null,
        line_items: [
            {
                expense_item_id: basic.category?.id ?? basic.id,
                quantity: qty,
                unit_price: lineTotal,
                total_amount: lineTotal,
                currency: basic.currency,
                is_shared_by_everyone: (basic.sharers?.length ?? 0) <= 1,
                shared_between: (basic.sharers ?? []).map((s) => ({
                    id: s.id,
                    name: s.name,
                    user_type: s.user_type,
                    avatar: s.avatar,
                    amount: s.amount,
                })),
                is_paid_by_everyone: false,
                paid_between: (basic.paid_by_users ?? []).map((p) => ({
                    id: p.id,
                    name: p.name,
                    user_type: p.user_type,
                    avatar: p.avatar,
                    amount: p.amount,
                })),
            },
        ],
    };
}
