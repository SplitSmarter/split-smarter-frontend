export type GraphColumn = 'item' | 'payer' | 'split';

export interface GraphItem {
    id: string;
    title: string;
    amount: number;
    iconUrl?: string | null;
    /**
     * Split participant keys (`graphPersonKey`) this item is assigned to.
     * Empty = pool (all split users).
     */
    assigneeIds: string[];
}

export interface GraphUser {
    /** Entity id (may collide across USER vs CUSTOM). */
    id: string;
    /** Distinguishes USER vs CUSTOM — required for unique node keys. */
    userType: string;
    name: string;
    amount: number;
    avatarUrl?: string | null;
}

export interface GraphPayer extends GraphUser {
    /** Items this payer funded (approximate when no real attribution). */
    fundedItemIds: string[];
}

export type GraphEdgeKind = 'item-to-split' | 'payer-to-item';

export interface GraphEdge {
    id: string;
    kind: GraphEdgeKind;
    fromId: string;
    toId: string;
    itemId: string;
    amount?: number;
    isPool?: boolean;
}

export interface ExpenseSplitGraphData {
    title: string;
    totalAmount: number;
    currencySymbol: string;
    items: GraphItem[];
    payers: GraphPayer[];
    splitUsers: GraphUser[];
    edges: GraphEdge[];
}

export interface NodeLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type NodeLayouts = Record<string, NodeLayout>;

/**
 * Selection identity:
 * - item column → item.id
 * - payer / split → graphPersonKey(id, userType)
 */
export interface GraphSelection {
    column: GraphColumn;
    id: string;
}

export interface HighlightSet {
    nodeIds: Set<string>;
    edgeIds: Set<string>;
}

export interface GraphViewState {
    highlight: HighlightSet | null;
    contextItemIds: string[];
    displayAmounts: Record<string, number>;
}

/** Stable person key — matches draft compound identity (id + type). */
export function graphPersonKey(id: string, userType: string) {
    return `${id}-${userType}`;
}

export function itemNodeId(id: string) {
    return `item:${id}`;
}

export function payerNodeId(personKey: string) {
    return `payer:${personKey}`;
}

export function splitNodeId(personKey: string) {
    return `split:${personKey}`;
}

export function personKeyOf(user: Pick<GraphUser, 'id' | 'userType'>) {
    return graphPersonKey(user.id, user.userType);
}
