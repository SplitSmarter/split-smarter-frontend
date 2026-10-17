import type { ExpenseItem, PayerUser } from '@/src/store/draft/expenseDraftStore';
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

export interface DraftGraphInput {
    title: string;
    totalAmount: number;
    currencySymbol: string;
    expenseItems: ExpenseItem[];
    payers: PayerUser[];
    splitParticipants: PayerUser[];
}

function lineAmount(item: ExpenseItem): number {
    return (item.cost || 0) * Math.max(1, item.quantity || 1);
}

function avatarUrl(user: PayerUser): string | null {
    return user.avatar?.url ?? null;
}

function toGraphUser(p: PayerUser): GraphUser {
    return {
        id: String(p.id),
        userType: String(p.user_type),
        name: p.name,
        amount: p.amount || 0,
        avatarUrl: avatarUrl(p),
    };
}

/**
 * Maps expense draft → connections graph model (live Add Expense).
 * Payer→item from `paidBetween` (empty = all payers).
 * Item→split from `sharedBetween` (empty = all split users).
 */
export function buildGraphFromDraft(input: DraftGraphInput): ExpenseSplitGraphData {
    const {
        title,
        totalAmount,
        currencySymbol,
        expenseItems,
        payers,
        splitParticipants,
    } = input;

    const items: GraphItem[] = expenseItems.map((item) => ({
        id: String(item.id),
        title: item.title,
        amount: lineAmount(item),
        iconUrl: item.iconUrl ?? null,
        assigneeIds:
            item.sharedBetween?.length > 0
                ? item.sharedBetween.map((s) =>
                      graphPersonKey(String(s.user_id), String(s.user_type)),
                  )
                : [],
    }));

    const payerKeys = payers.map((p) =>
        graphPersonKey(String(p.id), String(p.user_type)),
    );

    /** itemId → map of payerPersonKey → funded amount */
    const paidByItem = new Map<string, Map<string, number>>();
    for (const item of expenseItems) {
        const itemId = String(item.id);
        const line = lineAmount(item);
        const paid = item.paidBetween ?? [];
        const byPayer = new Map<string, number>();

        if (paid.length > 0) {
            for (const entry of paid) {
                const key = graphPersonKey(String(entry.user_id), String(entry.user_type));
                byPayer.set(key, entry.amount || 0);
            }
        } else {
            // Pool: equal slice across all payers (display only; settlement is top-level)
            const each =
                payerKeys.length > 0 ? line / payerKeys.length : line;
            for (const key of payerKeys) {
                byPayer.set(key, each);
            }
        }
        paidByItem.set(itemId, byPayer);
    }

    const graphPayers: GraphPayer[] = payers.map((p) => {
        const payerKey = graphPersonKey(String(p.id), String(p.user_type));
        const fundedItemIds = items
            .filter((item) => paidByItem.get(item.id)?.has(payerKey))
            .map((item) => item.id);
        return {
            ...toGraphUser(p),
            fundedItemIds,
        };
    });

    const splitUsers: GraphUser[] = splitParticipants.map(toGraphUser);

    return {
        title: title.trim() || 'Expense',
        totalAmount,
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
