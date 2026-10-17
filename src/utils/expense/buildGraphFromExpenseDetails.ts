import type {
    ExpenseDetailsBasicResponse,
    ExpenseDetailsResponse,
    ExpenseLineItemDetail,
} from '@/src/api/dto/expense/expense';
import {Currency} from '@/src/constants/expense/currency';
import {
    graphPersonKey,
    itemNodeId,
    payerNodeId,
    personKeyOf,
    splitNodeId,
    type ExpenseSplitGraphData,
    type GraphEdge,
    type GraphItem,
    type GraphPayer,
    type GraphUser,
} from '@/src/components/expense/connections-graph/types';

type ExpenseView = ExpenseDetailsBasicResponse | ExpenseDetailsResponse;

function isFull(e: ExpenseView): e is ExpenseDetailsResponse {
    return 'line_items' in e && Array.isArray((e as ExpenseDetailsResponse).line_items);
}

function lineAmount(item: ExpenseLineItemDetail): number {
    if (item.total_amount != null) return item.total_amount;
    if (item.unit_price != null) {
        return item.unit_price * Math.max(1, item.quantity ?? 1);
    }
    return 0;
}

/**
 * Maps GET expense details → connections graph (read-only details screen).
 * Payer→item from line `paid_between` (or pool across expense payers).
 * Item→split from line `shared_between` (or pool across expense sharers).
 * When there are no line items, synthesizes a single “Bill total” item.
 */
export function buildGraphFromExpenseDetails(
    expense: ExpenseView,
    itemTitles: Record<number, string> = {},
): ExpenseSplitGraphData {
    const currencySymbol =
        Currency[expense.currency as keyof typeof Currency]?.symbol ?? '₹';

    const payers: GraphPayer[] = (expense.paid_by_users ?? []).map((p) => ({
        id: String(p.id),
        userType: String(p.user_type),
        name: p.name,
        amount: p.amount || 0,
        avatarUrl: p.avatar?.url ?? null,
        fundedItemIds: [],
    }));

    const splitUsers: GraphUser[] = (expense.sharers ?? []).map((s) => ({
        id: String(s.id),
        userType: String(s.user_type),
        name: s.name,
        amount: s.amount || 0,
        avatarUrl: s.avatar?.url ?? null,
    }));

    const payerKeys = payers.map((p) => personKeyOf(p));
    const lineItems = isFull(expense) ? expense.line_items ?? [] : [];

    const sourceItems: ExpenseLineItemDetail[] =
        lineItems.length > 0
            ? lineItems
            : [
                  {
                      expense_item_id: 0,
                      total_amount: expense.total_amount,
                      currency: expense.currency,
                      is_shared_by_everyone: true,
                      shared_between: [],
                      is_paid_by_everyone: true,
                      paid_between: [],
                  },
              ];

    const items: GraphItem[] = sourceItems.map((item, index) => {
        const id =
            item.expense_item_id != null && item.expense_item_id !== 0
                ? String(item.expense_item_id)
                : `bill-${index}`;
        const title =
            item.expense_item_id === 0
                ? 'Bill total'
                : itemTitles[item.expense_item_id] ??
                  expense.category?.title ??
                  `Item #${item.expense_item_id}`;

        const assigneeIds =
            !item.is_shared_by_everyone && item.shared_between?.length
                ? item.shared_between.map((s) =>
                      graphPersonKey(String(s.id), String(s.user_type)),
                  )
                : [];

        return {
            id,
            title,
            amount: lineAmount(item),
            iconUrl: null,
            assigneeIds,
        };
    });

    /** itemId → map of payerPersonKey → funded amount */
    const paidByItem = new Map<string, Map<string, number>>();

    sourceItems.forEach((item, index) => {
        const itemId = items[index].id;
        const line = items[index].amount;
        const byPayer = new Map<string, number>();

        if (!item.is_paid_by_everyone && item.paid_between?.length) {
            for (const entry of item.paid_between) {
                const key = graphPersonKey(String(entry.id), String(entry.user_type));
                byPayer.set(key, entry.amount || 0);
            }
        } else if (payerKeys.length > 0) {
            // Distribute by top-level paid_by amounts when possible
            const declared = payers.reduce((sum, p) => sum + (p.amount || 0), 0);
            if (declared > 0.005) {
                for (const payer of payers) {
                    byPayer.set(
                        personKeyOf(payer),
                        line * ((payer.amount || 0) / declared),
                    );
                }
            } else {
                const each = line / payerKeys.length;
                for (const key of payerKeys) byPayer.set(key, each);
            }
        }

        paidByItem.set(itemId, byPayer);
    });

    const graphPayers: GraphPayer[] = payers.map((p) => {
        const payerKey = personKeyOf(p);
        const fundedItemIds = items
            .filter((item) => {
                const funded = paidByItem.get(item.id)?.get(payerKey);
                return funded != null && funded > 0.0001;
            })
            .map((item) => item.id);
        return {...p, fundedItemIds};
    });

    return {
        title: expense.name?.trim() || 'Expense',
        totalAmount: expense.total_amount,
        currencySymbol,
        items,
        payers: graphPayers,
        splitUsers,
        edges: buildEdges(items, graphPayers, splitUsers, paidByItem),
    };
}

function buildEdges(
    graphItems: GraphItem[],
    graphPayers: GraphPayer[],
    graphSplit: GraphUser[],
    paidByItem: Map<string, Map<string, number>>,
): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const item of graphItems) {
        const isPool = item.assigneeIds.length === 0;
        const assigneeKeys = isPool
            ? graphSplit.map((u) => personKeyOf(u))
            : item.assigneeIds;
        const perShare =
            assigneeKeys.length > 0 ? item.amount / assigneeKeys.length : item.amount;

        for (const splitKey of assigneeKeys) {
            edges.push({
                id: `i2s-${item.id}-${splitKey}`,
                kind: 'item-to-split',
                fromId: itemNodeId(item.id),
                toId: splitNodeId(splitKey),
                itemId: item.id,
                amount: perShare,
                isPool,
            });
        }
    }

    for (const payer of graphPayers) {
        const payerKey = personKeyOf(payer);
        for (const itemId of payer.fundedItemIds) {
            const funded = paidByItem.get(itemId)?.get(payerKey);
            if (funded == null) continue;
            edges.push({
                id: `p2i-${payerKey}-${itemId}`,
                kind: 'payer-to-item',
                fromId: payerNodeId(payerKey),
                toId: itemNodeId(itemId),
                itemId,
                amount: funded,
            });
        }
    }

    return edges;
}
