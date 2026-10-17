import { RelationWithUserType } from '@/src/api/dto/constants';
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

const ALICE = 'user-alice';
const BOB = 'user-bob';
const CAROL = 'user-carol';
const UT = RelationWithUserType.USER;

const KEY_ALICE = graphPersonKey(ALICE, UT);
const KEY_BOB = graphPersonKey(BOB, UT);
const KEY_CAROL = graphPersonKey(CAROL, UT);

const ITEM_PIZZA = 'pizza';
const ITEM_DRINKS = 'drinks';
const ITEM_DESSERT = 'dessert';

const items: GraphItem[] = [
    {
        id: ITEM_PIZZA,
        title: 'Pizza',
        amount: 800,
        iconUrl: null,
        assigneeIds: [KEY_BOB],
    },
    {
        id: ITEM_DRINKS,
        title: 'Drinks',
        amount: 1200,
        iconUrl: null,
        assigneeIds: [],
    },
    {
        id: ITEM_DESSERT,
        title: 'Dessert',
        amount: 800,
        iconUrl: null,
        assigneeIds: [KEY_ALICE, KEY_CAROL],
    },
];

const payers: GraphPayer[] = [
    {
        id: ALICE,
        userType: UT,
        name: 'Alice',
        amount: 2000,
        avatarUrl: null,
        fundedItemIds: [ITEM_PIZZA, ITEM_DRINKS],
    },
    {
        id: BOB,
        userType: UT,
        name: 'Bob',
        amount: 800,
        avatarUrl: null,
        fundedItemIds: [ITEM_DESSERT],
    },
];

const splitUsers: GraphUser[] = [
    { id: ALICE, userType: UT, name: 'Alice', amount: 1000, avatarUrl: null },
    { id: BOB, userType: UT, name: 'Bob', amount: 1400, avatarUrl: null },
    { id: CAROL, userType: UT, name: 'Carol', amount: 400, avatarUrl: null },
];

function resolveAssignees(item: GraphItem, allSplit: GraphUser[]): {
    ids: string[];
    isPool: boolean;
} {
    if (item.assigneeIds.length === 0) {
        return { ids: allSplit.map((u) => personKeyOf(u)), isPool: true };
    }
    return { ids: item.assigneeIds, isPool: false };
}

function buildEdges(
    graphItems: GraphItem[],
    graphPayers: GraphPayer[],
    graphSplit: GraphUser[],
): GraphEdge[] {
    const edges: GraphEdge[] = [];

    for (const item of graphItems) {
        const { ids: assignees, isPool } = resolveAssignees(item, graphSplit);
        const perShare =
            assignees.length > 0 ? Math.round(item.amount / assignees.length) : item.amount;
        for (const splitKey of assignees) {
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
            const item = graphItems.find((i) => i.id === itemId);
            edges.push({
                id: `p2i-${payerKey}-${itemId}`,
                kind: 'payer-to-item',
                fromId: payerNodeId(payerKey),
                toId: itemNodeId(itemId),
                itemId,
                amount: item?.amount,
            });
        }
    }

    return edges;
}

/** Mock dinner fixture for the dev playground only — not used by Add Expense. */
export const MOCK_EXPENSE_SPLIT_GRAPH: ExpenseSplitGraphData = {
    title: "Dinner at Luigi's",
    totalAmount: 2800,
    currencySymbol: '₹',
    items,
    payers,
    splitUsers,
    edges: buildEdges(items, payers, splitUsers),
};
