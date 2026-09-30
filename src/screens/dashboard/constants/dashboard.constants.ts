import {
    BudgetGoal,
    ExpenseDataPoint,
    Merchant,
    PeerSettlement,
    SpendCategory,
    Transaction,
    UserProfile,
} from '../types/dashboard';

export const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export const MOCK_USER_PROFILE: UserProfile = {
    name: 'Nilesh',
    avatar: {
        id: 'user-nilesh-avatar',
        name: 'Nilesh Avatar',
        url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        extension: 'jpg',
    },
    totalBalance: 12680.42,
    rewardPoints: 100,
};

export const MOCK_EXPENSES: ExpenseDataPoint[] = [
    {id: '1', timestamp: '2026-01-15T10:20:00.000Z', amount: 420.5, category: 'Groceries'},
    {id: '2', timestamp: '2026-02-18T14:12:00.000Z', amount: 310.8, category: 'Shopping'},
    {id: '3', timestamp: '2026-03-22T08:45:00.000Z', amount: 648.24, category: 'Utilities'},
    {id: '4', timestamp: '2026-04-10T19:30:00.000Z', amount: 890.1, category: 'Dining Out'},
    {id: '5', timestamp: '2026-05-05T12:00:00.000Z', amount: 720.4, category: 'Entertainment'},
    {id: '6', timestamp: '2026-06-28T16:15:00.000Z', amount: 1150.0, category: 'Travel'},
    {id: '7', timestamp: '2026-07-14T09:10:00.000Z', amount: 980.0, category: 'Groceries'},
    {id: '8', timestamp: '2026-08-19T11:25:00.000Z', amount: 1050.5, category: 'Shopping'},
    {id: '9', timestamp: '2026-09-27T15:43:08.621Z', amount: 1280.75, category: 'Health'},
    {id: '10', timestamp: '2026-10-02T18:00:00.000Z', amount: 1100.0, category: 'Subscriptions'},
    {id: '11', timestamp: '2026-11-12T11:00:00.000Z', amount: 1150.0, category: 'Subscriptions'},
    {id: '12', timestamp: '2026-12-05T12:00:00.000Z', amount: 1300.0, category: 'Subscriptions'},
    {id: '13', timestamp: '2026-12-05T12:05:00.000Z', amount: 1310.0, category: 'Subscriptions'},
    {id: '14', timestamp: '2026-12-05T12:10:00.000Z', amount: 1320.0, category: 'Subscriptions'},
    {id: '15', timestamp: '2026-12-05T12:15:00.000Z', amount: 1330.0, category: 'Subscriptions'},
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 't1',
        title: 'Adobe Creative Cloud',
        timeLabel: 'Today, 09:42',
        amount: -59.99,
        type: 'expense',
        icon: {
            id: 'icon-adobe',
            name: 'Adobe Logo',
            url: 'https://cdn-icons-png.flaticon.com/512/5968/5968433.png',
            extension: 'png',
        },
        iconBgColor: 'bg-red-500/10',
        iconBorderColor: 'border-red-500/20',
    },
    {
        id: 't2',
        title: 'Stripe Payout',
        timeLabel: 'Today, 08:15',
        amount: 187.5,
        type: 'income',
        icon: {
            id: 'icon-stripe',
            name: 'Stripe Logo',
            url: 'https://cdn-icons-png.flaticon.com/512/5968/5968382.png',
            extension: 'png',
        },
        iconBgColor: 'bg-blue-500/10',
        iconBorderColor: 'border-blue-500/20',
    },
    {
        id: 't3',
        title: 'Office Supplies',
        timeLabel: 'Jun 28, 10:22',
        amount: -24.0,
        type: 'expense',
        icon: {
            id: 'icon-office',
            name: 'Office Box Icon',
            url: 'https://cdn-icons-png.flaticon.com/512/3074/3074058.png',
            extension: 'png',
        },
        iconBgColor: 'bg-zinc-800',
        iconBorderColor: 'border-white/10',
    },
];

export const MOCK_SPEND_CATEGORIES: SpendCategory[] = [
    {
        id: 'c1',
        name: 'Food & Dining',
        percentage: 40,
        color: '#FF7A00',
        icon: {
            id: 'cat-food',
            name: 'Food Category',
            url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
            extension: 'png',
        },
    },
    {
        id: 'c2',
        name: 'Shopping',
        percentage: 25,
        color: '#3B82F6',
        icon: {
            id: 'cat-shopping',
            name: 'Shopping Category',
            url: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png',
            extension: 'png',
        },
    },
    {
        id: 'c3',
        name: 'Utilities',
        percentage: 20,
        color: '#10B981',
        icon: {
            id: 'cat-utilities',
            name: 'Utilities Category',
            url: 'https://cdn-icons-png.flaticon.com/512/1040/1040238.png',
            extension: 'png',
        },
    },
    {
        id: 'c4',
        name: 'Travel',
        percentage: 15,
        color: '#A855F7',
        icon: {
            id: 'cat-travel',
            name: 'Travel Category',
            url: 'https://cdn-icons-png.flaticon.com/512/201/201623.png',
            extension: 'png',
        },
    },
];

export const MOCK_MERCHANTS: Merchant[] = [
    {
        id: 'm1',
        name: 'Amazon',
        amountSpent: 4320.0,
        icon: {
            id: 'merchant-amazon',
            name: 'Amazon Logo',
            url: 'https://cdn-icons-png.flaticon.com/512/5968/5968269.png',
            extension: 'png',
        },
    },
    {
        id: 'm2',
        name: 'Swiggy',
        amountSpent: 2225.0,
        icon: {
            id: 'merchant-swiggy',
            name: 'Swiggy Logo',
            url: 'https://cdn-icons-png.flaticon.com/512/2819/2819194.png',
            extension: 'png',
        },
    },
    {
        id: 'm3',
        name: 'Uber',
        amountSpent: 1150.0,
        icon: {
            id: 'merchant-uber',
            name: 'Uber Logo',
            url: 'https://cdn-icons-png.flaticon.com/512/5969/5969178.png',
            extension: 'png',
        },
    },
];

export const MOCK_PEERS: PeerSettlement[] = [
    {
        id: 'p1',
        name: 'Sarah',
        avatar: {
            id: 'peer-sarah',
            name: 'Sarah Avatar',
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            extension: 'jpg',
        },
        amount: 1200,
        type: 'owe_you',
    },
    {
        id: 'p2',
        name: 'Rahul',
        avatar: {
            id: 'peer-rahul',
            name: 'Rahul Avatar',
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            extension: 'jpg',
        },
        amount: -500,
        type: 'you_owe',
    },
    {
        id: 'p3',
        name: 'Ananya',
        avatar: {
            id: 'peer-ananya',
            name: 'Ananya Avatar',
            url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            extension: 'jpg',
        },
        amount: 450,
        type: 'owe_you',
    },
];

export const MOCK_BUDGETS: BudgetGoal[] = [
    {
        id: 'b1',
        title: 'Home Rent',
        statusText: 'Ends on 25/10/26 • Shared',
        type: 'linear',
        usedAmount: 14915,
        totalAmount: 15000,
        currencySymbol: '₹',
        progressPercent: 75,
        categories: [
            {
                id: 'bcat-rent',
                name: 'Housing',
                icon: {
                    id: 'bcat-icon-house',
                    name: 'House Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/619/619153.png',
                    extension: 'png',
                },
            },
            {
                id: 'bcat-bills',
                name: 'Bills',
                icon: {
                    id: 'bcat-icon-bill',
                    name: 'Bill Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/1040/1040238.png',
                    extension: 'png',
                },
            },
        ],
    },
    {
        id: 'b2',
        title: 'Annual Savings Goal',
        statusText: 'Till 28/09/27',
        type: 'ring',
        usedAmount: 10000,
        totalAmount: 500000,
        currencySymbol: '₹',
        progressPercent: 2,
        categories: [
            {
                id: 'bcat-investments',
                name: 'Investments',
                icon: {
                    id: 'bcat-icon-chart',
                    name: 'Chart Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    extension: 'png',
                },
            },
            {
                id: 'bcat-emergency',
                name: 'Emergency',
                icon: {
                    id: 'bcat-icon-shield',
                    name: 'Shield Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/1067/1067566.png',
                    extension: 'png',
                },
            },
            {
                id: 'bcat-gold',
                name: 'Gold',
                icon: {
                    id: 'bcat-icon-gold',
                    name: 'Gold Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/2589/2589903.png',
                    extension: 'png',
                },
            },
            {
                id: 'bcat-crypto',
                name: 'Crypto',
                icon: {
                    id: 'bcat-icon-crypto',
                    name: 'Crypto Icon',
                    url: 'https://cdn-icons-png.flaticon.com/512/6001/6001368.png',
                    extension: 'png',
                },
            },
        ],
    },
];