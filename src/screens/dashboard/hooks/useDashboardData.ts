import {useMemo} from 'react';
import {AnalyticsSeriesResponse} from '@/src/api/dto/expense/analytics';
import {BudgetRuleDetails} from '@/src/api/dto/expense/budget';
import {
    ExpenseCategoryBasicResponse,
    ExpenseDetailsBasicResponse,
} from '@/src/api/dto/expense/expense';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {userStore} from '@/src/store/userStore';
import {
    MOCK_ANALYTICS_SERIES,
    MOCK_BUDGET_DETAILS,
    MOCK_CATEGORY_BY_ID,
    MOCK_EXPENSE_LIST,
    MOCK_USER_PROFILE,
} from '../constants/dashboard.constants';
import {BudgetGoal, SpendCategory, Transaction, UserProfile} from '../types/dashboard';
import {filterExpensesByDateRange, getUserCurrencyCode} from '../utils/dashboard.utils';
import {
    mapBudgetDetailsToGoal,
    mapExpensesToSpendCategories,
    mapExpenseToTransaction,
    pickExchangeRates,
    sumUserSpend,
} from '../utils/mappers';

interface UseDashboardDataProps {
    expenseList?: ExpenseDetailsBasicResponse[];
    analytics?: AnalyticsSeriesResponse;
    budgetDetails?: BudgetRuleDetails[];
    initialProfile?: UserProfile;
    /** Inclusive expense filter; later maps to API range params. */
    dateRange?: DateRangeResult | null;
}

export const useDashboardData = (props?: UseDashboardDataProps) => {
    const userCurrency =
        userStore((s) => s.user?.currency) || getUserCurrencyCode();

    const rawExpenseList = props?.expenseList ?? MOCK_EXPENSE_LIST;
    const analytics = props?.analytics ?? MOCK_ANALYTICS_SERIES;
    const budgetDetails = props?.budgetDetails ?? MOCK_BUDGET_DETAILS;
    const dateRange = props?.dateRange ?? null;

    const expenseList = useMemo(
        () => filterExpensesByDateRange(rawExpenseList, dateRange),
        [rawExpenseList, dateRange]
    );

    const exchangeRates = useMemo(
        () => pickExchangeRates(rawExpenseList) ?? pickExchangeRates(expenseList),
        [rawExpenseList, expenseList]
    );

    const transactions: Transaction[] = useMemo(
        () => expenseList.map((expense) => mapExpenseToTransaction(expense, userCurrency)),
        [expenseList, userCurrency]
    );

    const {categories, totalSpendAmount}: {
        categories: SpendCategory[];
        totalSpendAmount: number;
    } = useMemo(
        () => mapExpensesToSpendCategories(expenseList, userCurrency),
        [expenseList, userCurrency]
    );

    const categoryById = useMemo(() => {
        const map: Record<number, ExpenseCategoryBasicResponse> = {
            ...MOCK_CATEGORY_BY_ID,
        };
        for (const expense of expenseList) {
            if (expense.category?.id != null) {
                map[expense.category.id] = expense.category;
            }
        }
        return map;
    }, [expenseList]);

    const budgets: BudgetGoal[] = useMemo(
        () =>
            budgetDetails.map((rule) =>
                mapBudgetDetailsToGoal(rule, userCurrency, exchangeRates, categoryById)
            ),
        [budgetDetails, categoryById, exchangeRates, userCurrency]
    );

    const totalSpend = useMemo(
        () => sumUserSpend(expenseList, userCurrency),
        [expenseList, userCurrency]
    );

    const profile: UserProfile = props?.initialProfile ?? MOCK_USER_PROFILE;

    return {
        expenseList,
        dateRange,
        analytics,
        budgetDetails,
        exchangeRates,
        userCurrency,
        profile,
        transactions,
        categories,
        budgets,
        totalSpend,
        totalSpendAmount,
    };
};
