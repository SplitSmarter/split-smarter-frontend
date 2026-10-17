import { computeDisplayAmounts, resolveContextItemIds } from './computeDisplayAmounts';
import {
    itemNodeId,
    payerNodeId,
    personKeyOf,
    splitNodeId,
    type ExpenseSplitGraphData,
    type GraphSelection,
    type GraphViewState,
    type HighlightSet,
} from './types';

export function computeHighlight(
    data: ExpenseSplitGraphData,
    selection: GraphSelection | null,
): HighlightSet | null {
    if (!selection) return null;

    const nodeIds = new Set<string>();
    const edgeIds = new Set<string>();

    if (selection.column === 'item') {
        const itemKey = itemNodeId(selection.id);
        nodeIds.add(itemKey);

        for (const edge of data.edges) {
            if (edge.kind === 'item-to-split' && edge.fromId === itemKey) {
                edgeIds.add(edge.id);
                nodeIds.add(edge.toId);
            }
            if (edge.kind === 'payer-to-item' && edge.toId === itemKey) {
                edgeIds.add(edge.id);
                nodeIds.add(edge.fromId);
            }
        }
        return { nodeIds, edgeIds };
    }

    if (selection.column === 'payer') {
        // selection.id is graphPersonKey
        const payerKey = payerNodeId(selection.id);
        nodeIds.add(payerKey);

        const fundedItemKeys = new Set<string>();
        for (const edge of data.edges) {
            if (edge.kind === 'payer-to-item' && edge.fromId === payerKey) {
                edgeIds.add(edge.id);
                nodeIds.add(edge.toId);
                fundedItemKeys.add(edge.toId);
            }
        }

        for (const edge of data.edges) {
            if (edge.kind === 'item-to-split' && fundedItemKeys.has(edge.fromId)) {
                edgeIds.add(edge.id);
                nodeIds.add(edge.toId);
            }
        }
        return { nodeIds, edgeIds };
    }

    const splitKey = splitNodeId(selection.id);
    nodeIds.add(splitKey);

    const relatedItemKeys = new Set<string>();
    for (const edge of data.edges) {
        if (edge.kind === 'item-to-split' && edge.toId === splitKey) {
            edgeIds.add(edge.id);
            nodeIds.add(edge.fromId);
            relatedItemKeys.add(edge.fromId);
        }
    }

    for (const edge of data.edges) {
        if (edge.kind === 'payer-to-item' && relatedItemKeys.has(edge.toId)) {
            edgeIds.add(edge.id);
            nodeIds.add(edge.fromId);
        }
    }

    return { nodeIds, edgeIds };
}

export function computeGraphViewState(
    data: ExpenseSplitGraphData,
    selection: GraphSelection | null,
): GraphViewState {
    const highlight = computeHighlight(data, selection);
    if (!selection || !highlight) {
        return {
            highlight: null,
            contextItemIds: [],
            displayAmounts: {},
        };
    }

    const contextItemIds = resolveContextItemIds(data, selection);
    const displayAmounts = computeDisplayAmounts(
        data,
        selection,
        highlight,
        contextItemIds,
    );

    return { highlight, contextItemIds, displayAmounts };
}

export function selectionCaption(
    data: ExpenseSplitGraphData,
    selection: GraphSelection,
): string {
    if (selection.column === 'item') {
        const item = data.items.find((i) => i.id === selection.id);
        if (!item) return '';
        if (item.assigneeIds.length === 0) {
            return `${item.title} · pooled across everyone`;
        }
        const names = item.assigneeIds
            .map(
                (key) =>
                    data.splitUsers.find((u) => personKeyOf(u) === key)?.name,
            )
            .filter(Boolean)
            .join(', ');
        return `${item.title} · assigned to ${names}`;
    }

    if (selection.column === 'payer') {
        const payer = data.payers.find((p) => personKeyOf(p) === selection.id);
        if (!payer) return '';
        const itemNames = payer.fundedItemIds
            .map((id) => data.items.find((i) => i.id === id)?.title)
            .filter(Boolean)
            .join(', ');
        return `${payer.name} paid · funded ${itemNames || '—'}`;
    }

    const user = data.splitUsers.find((u) => personKeyOf(u) === selection.id);
    if (!user) return '';
    return `${user.name} · path through related items`;
}
