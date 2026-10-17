import {
    itemNodeId,
    payerNodeId,
    personKeyOf,
    splitNodeId,
    type ExpenseSplitGraphData,
    type GraphSelection,
    type HighlightSet,
} from './types';

function itemAmount(data: ExpenseSplitGraphData, itemId: string): number {
    return data.items.find((i) => i.id === itemId)?.amount ?? 0;
}

/** Selected payer's fraction of an item (0..1) via payer→item edge. */
function payerFractionOfItem(
    data: ExpenseSplitGraphData,
    payerPersonKey: string,
    itemId: string,
): number {
    const total = itemAmount(data, itemId);
    if (total <= 0) return 0;
    const edge = data.edges.find(
        (e) =>
            e.kind === 'payer-to-item' &&
            e.fromId === payerNodeId(payerPersonKey) &&
            e.itemId === itemId,
    );
    return (edge?.amount ?? 0) / total;
}

/** Selected split person's fraction of an item (0..1) via item→split edge. */
function splitFractionOfItem(
    data: ExpenseSplitGraphData,
    splitPersonKey: string,
    itemId: string,
): number {
    const total = itemAmount(data, itemId);
    if (total <= 0) return 0;
    const edge = data.edges.find(
        (e) =>
            e.kind === 'item-to-split' &&
            e.toId === splitNodeId(splitPersonKey) &&
            e.itemId === itemId,
    );
    return (edge?.amount ?? 0) / total;
}

/**
 * Path-local amounts with items as the bridge:
 * - Select payer → items = payer→item; split = item→split × payer's fraction of item
 * - Select split → items = item→split; payers = payer→item × split's fraction of item
 * - Select item → both sides = edges on that item only (no extra scale)
 */
export function computeDisplayAmounts(
    data: ExpenseSplitGraphData,
    selection: GraphSelection,
    highlight: HighlightSet,
    contextItemIds: string[],
): Record<string, number> {
    const amounts: Record<string, number> = {};
    const contextSet = new Set(contextItemIds);

    if (contextSet.size === 0) return amounts;

    // --- Split column ---
    for (const user of data.splitUsers) {
        const key = splitNodeId(personKeyOf(user));
        if (!highlight.nodeIds.has(key)) continue;

        let sum = 0;
        for (const edge of data.edges) {
            if (
                edge.kind !== 'item-to-split' ||
                edge.toId !== key ||
                !contextSet.has(edge.itemId)
            ) {
                continue;
            }
            const raw = edge.amount ?? 0;
            if (selection.column === 'payer') {
                // Flow from selected payer through this item into the split person
                sum += raw * payerFractionOfItem(data, selection.id, edge.itemId);
            } else {
                sum += raw;
            }
        }
        amounts[key] = sum;
    }

    // --- Paid by column ---
    for (const payer of data.payers) {
        const key = payerNodeId(personKeyOf(payer));
        if (!highlight.nodeIds.has(key)) continue;

        let sum = 0;
        for (const edge of data.edges) {
            if (
                edge.kind !== 'payer-to-item' ||
                edge.fromId !== key ||
                !contextSet.has(edge.itemId)
            ) {
                continue;
            }
            const raw = edge.amount ?? 0;
            if (selection.column === 'split') {
                // Flow from this payer through the item into the selected split person
                sum += raw * splitFractionOfItem(data, selection.id, edge.itemId);
            } else {
                sum += raw;
            }
        }
        amounts[key] = sum;
    }

    // --- Items column ---
    for (const item of data.items) {
        const key = itemNodeId(item.id);
        if (!highlight.nodeIds.has(key)) continue;
        if (!contextSet.has(item.id)) continue;

        if (selection.column === 'item') continue;

        if (selection.column === 'payer') {
            const edge = data.edges.find(
                (e) =>
                    e.kind === 'payer-to-item' &&
                    e.fromId === payerNodeId(selection.id) &&
                    e.itemId === item.id,
            );
            amounts[key] = edge?.amount ?? 0;
            continue;
        }

        // selection.column === 'split'
        const edge = data.edges.find(
            (e) =>
                e.kind === 'item-to-split' &&
                e.toId === splitNodeId(selection.id) &&
                e.itemId === item.id,
        );
        amounts[key] = edge?.amount ?? 0;
    }

    return amounts;
}

export function resolveContextItemIds(
    data: ExpenseSplitGraphData,
    selection: GraphSelection,
): string[] {
    if (selection.column === 'item') return [selection.id];

    if (selection.column === 'payer') {
        const payer = data.payers.find((p) => personKeyOf(p) === selection.id);
        return payer?.fundedItemIds ?? [];
    }

    const splitKey = splitNodeId(selection.id);
    const ids: string[] = [];
    for (const edge of data.edges) {
        if (edge.kind === 'item-to-split' && edge.toId === splitKey) {
            if (!ids.includes(edge.itemId)) ids.push(edge.itemId);
        }
    }
    return ids;
}
