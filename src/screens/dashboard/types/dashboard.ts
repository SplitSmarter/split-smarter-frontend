export interface BasicImage {
    id: string;
    name: string;
    url: string;
    extension: string;
}

export interface ExpenseDataPoint {
    id: string;
    timestamp: string;
    amount: number;
    category: string;
}

export interface FormattedAnalyticsPoint extends ExpenseDataPoint {
    value: number;
    label: string;
    date: string;
    dataIndex: number;
}

export interface Transaction {
    id: string;
    title: string;
    timeLabel: string;
    amount: number;
    type: 'expense' | 'income';
    icon: BasicImage;
    iconBgColor: string;
    iconBorderColor: string;
}

export interface UserProfile {
    name: string;
    avatar: BasicImage;
    totalBalance: number;
    rewardPoints: number;
}

export interface SpendCategory {
    id: string;
    name: string;
    percentage: number;
    color: string;
    icon?: BasicImage;
}

export interface Merchant {
    id: string;
    name: string;
    amountSpent: number;
    icon: BasicImage;
}

export interface PeerSettlement {
    id: string;
    name: string;
    avatar: BasicImage;
    amount: number; // Positive = owe you, Negative = you owe
    type: 'owe_you' | 'you_owe';
}

export interface BudgetCategory {
    id: string;
    name: string;
    icon: BasicImage;
}

export interface BudgetGoal {
    id: string;
    title: string;
    statusText: string;
    type: 'linear' | 'ring';
    usedAmount: number;
    totalAmount: number;
    currencySymbol: string;
    progressPercent: number;
    categories?: BudgetCategory[];
}