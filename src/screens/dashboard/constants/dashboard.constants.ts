import {RelationWithUserType} from '@/src/api/dto/constants';
import {
    AnalyticsSeriesResponse,
} from '@/src/api/dto/expense/analytics';
import {
    BudgetAudienceType,
    BudgetCapMode,
    BudgetMemberRole,
    BudgetPeriod,
    AnalyticsBucket,
    AnalyticsGroupBy,
    ExpenseComponentType,
    ExpenseStatus,
} from '@/src/api/dto/expense/constant';
import {BudgetRuleDetails} from '@/src/api/dto/expense/budget';
import {
    ExpenseCategoryBasicResponse,
    ExpenseDetailsBasicResponse,
    ExchangeRateDetails,
} from '@/src/api/dto/expense/expense';
import {BasicImage} from '@/src/api/dto/user/asset';
import {BasicUserDetails} from '@/src/api/dto/user/user';
import {UserProfile} from '../types/dashboard';

export const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const CATEGORY_PALETTE = ['#FF7A00', '#3B82F6', '#2B8761', '#A855F7', '#EF4444', '#14B8A6'];

const INR_RATE: ExchangeRateDetails = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    CAD: 0.016,
    GBP: 0.0095,
};

const avatar = (id: string, url: string): BasicImage => ({
    id,
    name: id,
    url,
    extension: 'jpg',
});

const icon = (id: string, url: string): BasicImage => ({
    id,
    name: id,
    url,
    extension: 'png',
});

const selfUser: BasicUserDetails = {
    id: 1,
    name: 'Nilesh',
    user_type: RelationWithUserType.USER,
    avatar: avatar(
        'user-nilesh-avatar',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    ),
};

const category = (
    id: number,
    title: string,
    iconUrl: string
): ExpenseCategoryBasicResponse => ({
    id,
    title,
    icon: icon(`cat-${id}`, iconUrl),
});

const CAT_GROCERIES = category(
    1,
    'Groceries',
    'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
);
const CAT_SHOPPING = category(
    2,
    'Shopping',
    'https://cdn-icons-png.flaticon.com/512/3081/3081648.png'
);
const CAT_UTILITIES = category(
    3,
    'Utilities',
    'https://cdn-icons-png.flaticon.com/512/1040/1040238.png'
);
const CAT_DINING = category(
    4,
    'Food & Dining',
    'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
);
const CAT_TRAVEL = category(
    5,
    'Travel',
    'https://cdn-icons-png.flaticon.com/512/201/201623.png'
);
const CAT_SUBSCRIPTIONS = category(
    6,
    'Subscriptions',
    'https://cdn-icons-png.flaticon.com/512/5968/5968433.png'
);

/** Fixture category catalog for budget `category_ids` → icon/name lookup. */
export const MOCK_CATEGORY_BY_ID: Record<number, ExpenseCategoryBasicResponse> = {
    1: CAT_GROCERIES,
    2: CAT_SHOPPING,
    3: CAT_UTILITIES,
    4: CAT_DINING,
    5: CAT_TRAVEL,
    6: CAT_SUBSCRIPTIONS,
};

/** UI profile shell (name/avatar). Spend total comes from analytics via mappers/hooks. */
export const MOCK_USER_PROFILE: UserProfile = {
    name: selfUser.name,
    avatar: {
        id: selfUser.avatar.id,
        name: selfUser.avatar.name,
        url: selfUser.avatar.url,
        extension: selfUser.avatar.extension,
    },
};

function makeExpense(
    partial: Pick<
        ExpenseDetailsBasicResponse,
        'id' | 'name' | 'expense_date' | 'total_amount' | 'category'
    > & {
        /** Viewer's split share (spend). Defaults to full total. */
        user_share?: number;
        /** Viewer's cash paid. Defaults to full total. */
        user_paid?: number;
    } & Partial<ExpenseDetailsBasicResponse>
): ExpenseDetailsBasicResponse {
    const total = partial.total_amount;
    const userShare = partial.user_share ?? total;
    const userPaid = partial.user_paid ?? total;
    return {
        status: ExpenseStatus.ACTIVE,
        expense_type: ExpenseComponentType.ITEM,
        currency: 'INR',
        exchange_rate: INR_RATE,
        memory: null,
        paid_by_users: [{...selfUser, amount: userPaid}],
        sharers: [{...selfUser, amount: userShare}],
        user_share: userShare,
        user_paid: userPaid,
        user_net: userPaid - userShare,
        group: null,
        place: null,
        is_scheduled_blueprint: false,
        has_attachment: false,
        is_user_settled: true,
        ...partial,
    };
}

/** API-shaped expense list fixture (`GET /expense/v1/`). */
export const MOCK_EXPENSE_LIST: ExpenseDetailsBasicResponse[] = [
    makeExpense({
        id: 101,
        name: 'Adobe Creative Cloud',
        expense_date: '2026-10-11',
        total_amount: 4999,
        user_share: 4999,
        user_paid: 4999,
        category: CAT_SUBSCRIPTIONS,
        is_user_settled: true,
    }),
    makeExpense({
        id: 102,
        name: 'BigBasket Weekly',
        expense_date: '2026-10-10',
        total_amount: 2450,
        user_share: 1225,
        user_paid: 2450,
        category: CAT_GROCERIES,
        is_user_settled: false,
    }),
    makeExpense({
        id: 103,
        name: 'Office Supplies',
        expense_date: '2026-06-28',
        total_amount: 1999,
        user_share: 1999,
        user_paid: 1999,
        category: CAT_SHOPPING,
        is_user_settled: true,
    }),
    makeExpense({
        id: 104,
        name: 'Uber Airport',
        expense_date: '2026-09-15',
        total_amount: 850,
        user_share: 850,
        user_paid: 850,
        category: CAT_TRAVEL,
        is_user_settled: true,
    }),
    makeExpense({
        id: 105,
        name: 'Electricity Bill',
        expense_date: '2026-09-05',
        total_amount: 3200,
        user_share: 1600,
        user_paid: 1600,
        category: CAT_UTILITIES,
        is_user_settled: true,
    }),
    makeExpense({
        id: 106,
        name: 'Dinner at Truffles',
        expense_date: '2026-08-22',
        total_amount: 2800,
        user_share: 1400,
        user_paid: 2800,
        category: CAT_DINING,
        is_user_settled: false,
    }),
];

const emptyTransferBlock = null;

/** API-shaped analytics fixture (`GET /expense/v1/analytics/series`). */
export const MOCK_ANALYTICS_SERIES: AnalyticsSeriesResponse = {
    period_start: '2026-01-01',
    period_end: '2026-12-31',
    include_transfers: false,
    bucket: AnalyticsBucket.MONTH,
    group_by: AnalyticsGroupBy.CATEGORY,
    totals: {
        paid_inr: 142500,
        shared_inr: 118200,
        net_inr: 24300,
    },
    series: [
        {
            period_start: '2026-01-01',
            period_end: '2026-01-31',
            totals: {paid_inr: 9200, shared_inr: 8400, net_inr: 800},
            by_category: [
                {category_id: 1, category_name: 'Groceries', paid_inr: 4200, shared_inr: 4200, net_inr: 0},
                {category_id: 4, category_name: 'Food & Dining', paid_inr: 5000, shared_inr: 4200, net_inr: 800},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-02-01',
            period_end: '2026-02-28',
            totals: {paid_inr: 7800, shared_inr: 7200, net_inr: 600},
            by_category: [
                {category_id: 2, category_name: 'Shopping', paid_inr: 4800, shared_inr: 4800, net_inr: 0},
                {category_id: 3, category_name: 'Utilities', paid_inr: 3000, shared_inr: 2400, net_inr: 600},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-03-01',
            period_end: '2026-03-31',
            totals: {paid_inr: 10500, shared_inr: 9800, net_inr: 700},
            by_category: [
                {category_id: 3, category_name: 'Utilities', paid_inr: 4500, shared_inr: 4500, net_inr: 0},
                {category_id: 5, category_name: 'Travel', paid_inr: 6000, shared_inr: 5300, net_inr: 700},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-04-01',
            period_end: '2026-04-30',
            totals: {paid_inr: 11200, shared_inr: 10100, net_inr: 1100},
            by_category: [
                {category_id: 4, category_name: 'Food & Dining', paid_inr: 7200, shared_inr: 6100, net_inr: 1100},
                {category_id: 1, category_name: 'Groceries', paid_inr: 4000, shared_inr: 4000, net_inr: 0},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-05-01',
            period_end: '2026-05-31',
            totals: {paid_inr: 9800, shared_inr: 9100, net_inr: 700},
            by_category: [
                {category_id: 2, category_name: 'Shopping', paid_inr: 5500, shared_inr: 5500, net_inr: 0},
                {category_id: 6, category_name: 'Subscriptions', paid_inr: 4300, shared_inr: 3600, net_inr: 700},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-06-01',
            period_end: '2026-06-30',
            totals: {paid_inr: 13400, shared_inr: 12200, net_inr: 1200},
            by_category: [
                {category_id: 5, category_name: 'Travel', paid_inr: 9000, shared_inr: 7800, net_inr: 1200},
                {category_id: 1, category_name: 'Groceries', paid_inr: 4400, shared_inr: 4400, net_inr: 0},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-07-01',
            period_end: '2026-07-31',
            totals: {paid_inr: 12100, shared_inr: 11500, net_inr: 600},
            by_category: [
                {category_id: 1, category_name: 'Groceries', paid_inr: 6100, shared_inr: 6100, net_inr: 0},
                {category_id: 4, category_name: 'Food & Dining', paid_inr: 6000, shared_inr: 5400, net_inr: 600},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-08-01',
            period_end: '2026-08-31',
            totals: {paid_inr: 12800, shared_inr: 11900, net_inr: 900},
            by_category: [
                {category_id: 2, category_name: 'Shopping', paid_inr: 7000, shared_inr: 7000, net_inr: 0},
                {category_id: 4, category_name: 'Food & Dining', paid_inr: 5800, shared_inr: 4900, net_inr: 900},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-09-01',
            period_end: '2026-09-30',
            totals: {paid_inr: 14100, shared_inr: 13200, net_inr: 900},
            by_category: [
                {category_id: 3, category_name: 'Utilities', paid_inr: 5200, shared_inr: 5200, net_inr: 0},
                {category_id: 5, category_name: 'Travel', paid_inr: 8900, shared_inr: 8000, net_inr: 900},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-10-01',
            period_end: '2026-10-31',
            totals: {paid_inr: 13600, shared_inr: 12400, net_inr: 1200},
            by_category: [
                {category_id: 6, category_name: 'Subscriptions', paid_inr: 5600, shared_inr: 5600, net_inr: 0},
                {category_id: 1, category_name: 'Groceries', paid_inr: 8000, shared_inr: 6800, net_inr: 1200},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-11-01',
            period_end: '2026-11-30',
            totals: {paid_inr: 12500, shared_inr: 11800, net_inr: 700},
            by_category: [
                {category_id: 6, category_name: 'Subscriptions', paid_inr: 6500, shared_inr: 6500, net_inr: 0},
                {category_id: 2, category_name: 'Shopping', paid_inr: 6000, shared_inr: 5300, net_inr: 700},
            ],
            transfers: emptyTransferBlock,
        },
        {
            period_start: '2026-12-01',
            period_end: '2026-12-31',
            totals: {paid_inr: 15500, shared_inr: 14600, net_inr: 900},
            by_category: [
                {category_id: 6, category_name: 'Subscriptions', paid_inr: 8200, shared_inr: 8200, net_inr: 0},
                {category_id: 5, category_name: 'Travel', paid_inr: 7300, shared_inr: 6400, net_inr: 900},
            ],
            transfers: emptyTransferBlock,
        },
    ],
    transfers: emptyTransferBlock,
};

const emptyProgressMaps = {
    by_category: {} as Record<string, number>,
    by_merchant: {} as Record<string, number>,
    by_place: {} as Record<string, number>,
    by_memory: {} as Record<string, number>,
    by_user: {} as Record<string, number>,
};

/** API-shaped budget detail fixtures (`GET /budget/v1/rules/{id}`). */
export const MOCK_BUDGET_DETAILS: BudgetRuleDetails[] = [
    {
        id: 201,
        name: 'Home Rent',
        amount: 15000,
        period: BudgetPeriod.MONTHLY,
        period_value: 1,
        start_date: '2026-10-01',
        end_date: '2026-10-25',
        is_active: true,
        audience_type: BudgetAudienceType.USER_SHARED,
        group_id: null,
        cap_mode: BudgetCapMode.SOFT,
        category_ids: [3],
        merchant_ids: [],
        place_ids: [],
        memory_ids: [],
        members: [{user_id: 1, role: BudgetMemberRole.OWNER}],
        current_instance: {
            id: 301,
            start_date: '2026-10-01',
            end_date: '2026-10-25',
            amount: 15000,
        },
        progress: {
            spent: 14915,
            remaining: 85,
            percent: 99.4,
            ...emptyProgressMaps,
            by_category: {'3': 14915},
            fair_share: [],
            warnings: [],
        },
        created_by_id: 1,
        created_at: '2026-09-01T10:00:00.000Z',
        updated_at: '2026-10-10T10:00:00.000Z',
    },
    {
        id: 202,
        name: 'Annual Savings Goal',
        amount: 500000,
        period: BudgetPeriod.YEARLY,
        period_value: 1,
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        is_active: true,
        audience_type: BudgetAudienceType.USER,
        group_id: null,
        cap_mode: BudgetCapMode.SOFT,
        category_ids: [2, 5],
        merchant_ids: [],
        place_ids: [],
        memory_ids: [],
        members: [{user_id: 1, role: BudgetMemberRole.OWNER}],
        current_instance: {
            id: 302,
            start_date: '2026-01-01',
            end_date: '2026-12-31',
            amount: 500000,
        },
        progress: {
            spent: 10000,
            remaining: 490000,
            percent: 2,
            ...emptyProgressMaps,
            by_category: {'2': 6000, '5': 4000},
            fair_share: [],
            warnings: [],
        },
        created_by_id: 1,
        created_at: '2026-01-01T10:00:00.000Z',
        updated_at: '2026-10-01T10:00:00.000Z',
    },
];
