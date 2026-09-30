import {
    MOCK_BUDGETS,
    MOCK_EXPENSES,
    MOCK_MERCHANTS,
    MOCK_PEERS,
    MOCK_SPEND_CATEGORIES,
    MOCK_TRANSACTIONS,
    MOCK_USER_PROFILE,
} from '../constants/dashboard.constants';
import {
    BudgetGoal,
    ExpenseDataPoint,
    Merchant,
    PeerSettlement,
    SpendCategory,
    Transaction,
    UserProfile,
} from '../types/dashboard';

interface UseDashboardDataProps {
    initialExpenses?: ExpenseDataPoint[];
    initialTransactions?: Transaction[];
    initialProfile?: UserProfile;
    initialCategories?: SpendCategory[];
    initialMerchants?: Merchant[];
    initialPeers?: PeerSettlement[];
    initialBudgets?: BudgetGoal[];
}

export const useDashboardData = (props?: UseDashboardDataProps) => {
    return {
        expenses: props?.initialExpenses ?? MOCK_EXPENSES,
        transactions: props?.initialTransactions ?? MOCK_TRANSACTIONS,
        profile: props?.initialProfile ?? MOCK_USER_PROFILE,
        categories: props?.initialCategories ?? MOCK_SPEND_CATEGORIES,
        merchants: props?.initialMerchants ?? MOCK_MERCHANTS,
        peers: props?.initialPeers ?? MOCK_PEERS,
        budgets: props?.initialBudgets ?? MOCK_BUDGETS,
    };
};