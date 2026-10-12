import {AnalyticsSeriesResponse} from '@/src/api/dto/expense/analytics';
import {BudgetAudienceType, BudgetPeriod} from '@/src/api/dto/expense/constant';
import {BudgetRuleDetails} from '@/src/api/dto/expense/budget';
import {
    ExchangeRateDetails,
    ExpenseCategoryBasicResponse,
    ExpenseDetailsBasicResponse,
} from '@/src/api/dto/expense/expense';
import {CATEGORY_PALETTE} from '../constants/dashboard.constants';
import {
    BudgetCategory,
    BudgetGoal,
    ExpenseSpendPoint,
    SpendCategory,
    Transaction,
} from '../types/dashboard';
import {
    convertAmountWithRates,
    convertInrToUserCurrency,
    getFormattedFullDate,
    getMonthShort,
    getUserCurrencySymbol,
} from './dashboard.utils';

const ICON_BG = [
    {bg: 'bg-red-500/10', border: 'border-red-500/20'},
    {bg: 'bg-blue-500/10', border: 'border-blue-500/20'},
    {bg: 'bg-amber-500/10', border: 'border-amber-500/20'},
    {bg: 'bg-emerald-500/10', border: 'border-emerald-500/20'},
    {bg: 'bg-purple-500/10', border: 'border-purple-500/20'},
];

function formatExpenseTimeLabel(expenseDate: string): string {
    const d = new Date(expenseDate);
    if (Number.isNaN(d.getTime())) return expenseDate;

    const today = new Date();
    const sameDay =
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

    if (sameDay) {
        return `Today, ${d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })}`;
    }

    return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
}

/**
 * API `user_share` (split share / spend) converted into the profile currency.
 */
export function getExpenseSpendInUserCurrency(
    expense: ExpenseDetailsBasicResponse,
    userCurrency: string
): number {
    const share = expense.user_share ?? expense.total_amount;
    return convertAmountWithRates(
        Math.abs(share),
        expense.currency,
        userCurrency,
        expense.exchange_rate
    );
}

/** Sum of spend shares across expenses (user currency). */
export function sumUserSpend(
    expenses: ExpenseDetailsBasicResponse[],
    userCurrency: string
): number {
    return expenses.reduce(
        (sum, expense) => sum + getExpenseSpendInUserCurrency(expense, userCurrency),
        0
    );
}

export function mapExpenseToTransaction(
    expense: ExpenseDetailsBasicResponse,
    userCurrency: string
): Transaction {
    const spend = getExpenseSpendInUserCurrency(expense, userCurrency);
    const style = ICON_BG[expense.id % ICON_BG.length];
    const catIcon = expense.category?.icon;

    return {
        id: String(expense.id),
        title: expense.name,
        timeLabel: formatExpenseTimeLabel(expense.expense_date),
        amount: -Math.abs(spend),
        type: 'expense',
        icon: {
            id: catIcon?.id ?? `expense-icon-${expense.id}`,
            name: catIcon?.name ?? expense.category?.title ?? 'Expense',
            url: catIcon?.url ?? '',
            extension: catIcon?.extension ?? 'png',
        },
        iconBgColor: style.bg,
        iconBorderColor: style.border,
    };
}

/**
 * One chart point per expense: value = user_share (spend) with that expense's rates.
 */
export function mapExpensesToChartPoints(
    expenses: ExpenseDetailsBasicResponse[],
    userCurrency: string
): ExpenseSpendPoint[] {
    const ordered = [...expenses].sort((a, b) => {
        const ta = new Date(a.expense_date).getTime();
        const tb = new Date(b.expense_date).getTime();
        return ta - tb;
    });

    return ordered.map((expense, idx) => {
        const amount = getExpenseSpendInUserCurrency(expense, userCurrency);
        const timestamp = expense.expense_date;
        const d = new Date(timestamp);
        const label = Number.isNaN(d.getTime())
            ? getMonthShort(timestamp)
            : `${d.getDate()} ${getMonthShort(timestamp)}`;

        return {
            id: String(expense.id),
            timestamp,
            amount,
            category: expense.category?.title ?? 'Spend',
            value: amount,
            label,
            date: getFormattedFullDate(timestamp),
            dataIndex: idx,
        };
    });
}

export function mapAnalyticsToSpendCategories(
    analytics: AnalyticsSeriesResponse,
    userCurrency: string,
    exchangeRates?: ExchangeRateDetails | null
): {categories: SpendCategory[]; totalSpendAmount: number} {
    const totalsByCategory = new Map<number, {name: string; sharedInr: number}>();

    for (const period of analytics.series) {
        for (const cat of period.by_category ?? []) {
            const existing = totalsByCategory.get(cat.category_id);
            if (existing) {
                existing.sharedInr += cat.shared_inr;
            } else {
                totalsByCategory.set(cat.category_id, {
                    name: cat.category_name ?? `Category ${cat.category_id}`,
                    sharedInr: cat.shared_inr,
                });
            }
        }
    }

    const rows = [...totalsByCategory.entries()].sort(
        (a, b) => b[1].sharedInr - a[1].sharedInr
    );
    const totalSharedInr =
        analytics.totals.shared_inr ||
        rows.reduce((sum, [, row]) => sum + row.sharedInr, 0);

    const totalSpendAmount = convertInrToUserCurrency(
        totalSharedInr,
        userCurrency,
        exchangeRates
    );

    if (totalSharedInr <= 0 || rows.length === 0) {
        return {categories: [], totalSpendAmount};
    }

    const categories = rows.map(([id, row], idx) => ({
        id: String(id),
        name: row.name,
        percentage: Math.round((row.sharedInr / totalSharedInr) * 100),
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
    }));

    return {categories, totalSpendAmount};
}

/**
 * Spend Analysis from expense list categories (respects date-range filter).
 * Percentages are based on user_share in the profile currency.
 */
export function mapExpensesToSpendCategories(
    expenses: ExpenseDetailsBasicResponse[],
    userCurrency: string
): {categories: SpendCategory[]; totalSpendAmount: number} {
    const totalsByCategory = new Map<
        number,
        {name: string; amount: number; icon?: SpendCategory['icon']}
    >();

    for (const expense of expenses) {
        const cat = expense.category;
        if (!cat?.id) continue;

        const amount = getExpenseSpendInUserCurrency(expense, userCurrency);
        const existing = totalsByCategory.get(cat.id);
        if (existing) {
            existing.amount += amount;
        } else {
            const icon = cat.icon
                ? {
                      id: cat.icon.id,
                      name: cat.icon.name,
                      url: cat.icon.url,
                      extension: cat.icon.extension,
                  }
                : undefined;
            totalsByCategory.set(cat.id, {
                name: cat.title ?? `Category ${cat.id}`,
                amount,
                icon,
            });
        }
    }

    const rows = [...totalsByCategory.entries()].sort(
        (a, b) => b[1].amount - a[1].amount
    );
    const totalSpendAmount = rows.reduce((sum, [, row]) => sum + row.amount, 0);

    if (totalSpendAmount <= 0 || rows.length === 0) {
        return {categories: [], totalSpendAmount: 0};
    }

    const categories = rows.map(([id, row], idx) => ({
        id: String(id),
        name: row.name,
        percentage: Math.round((row.amount / totalSpendAmount) * 100),
        color: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
        icon: row.icon,
    }));

    // Keep donut segments summing to 100 after rounding
    const pctSum = categories.reduce((sum, c) => sum + c.percentage, 0);
    if (categories.length > 0 && pctSum !== 100) {
        categories[0] = {
            ...categories[0],
            percentage: Math.max(0, categories[0].percentage + (100 - pctSum)),
        };
    }

    return {categories, totalSpendAmount};
}

function budgetStatusText(rule: BudgetRuleDetails): string {
    const end = rule.current_instance?.end_date ?? rule.end_date;
    const endLabel = end
        ? `Ends on ${new Date(end).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
          })}`
        : rule.period
          ? `${rule.period}`
          : 'Active';

    if (rule.audience_type === BudgetAudienceType.USER_SHARED) {
        return `${endLabel} • Shared`;
    }
    if (rule.audience_type === BudgetAudienceType.GROUP) {
        return `${endLabel} • Group`;
    }
    return endLabel;
}

function mapBudgetCategories(
    categoryIds: number[],
    categoryById?: Record<number, ExpenseCategoryBasicResponse>
): BudgetCategory[] | undefined {
    if (!categoryIds.length) return undefined;

    return categoryIds.map((id) => {
        const cat = categoryById?.[id];
        const icon = cat?.icon;
        return {
            id: String(id),
            name: cat?.title ?? `Category ${id}`,
            icon: {
                id: icon?.id ?? `cat-${id}`,
                name: icon?.name ?? cat?.title ?? `Category ${id}`,
                url: icon?.url ?? '',
                extension: icon?.extension ?? 'png',
            },
        };
    });
}

export function mapBudgetDetailsToGoal(
    rule: BudgetRuleDetails,
    userCurrency: string,
    exchangeRates?: ExchangeRateDetails | null,
    categoryById?: Record<number, ExpenseCategoryBasicResponse>
): BudgetGoal {
    const totalAmount = convertInrToUserCurrency(
        rule.current_instance?.amount ?? rule.amount,
        userCurrency,
        exchangeRates
    );
    const usedAmount = convertInrToUserCurrency(
        rule.progress?.spent ?? 0,
        userCurrency,
        exchangeRates
    );
    const progressPercent = rule.progress?.percent ?? 0;
    const isRing =
        rule.audience_type === BudgetAudienceType.GROUP ||
        rule.period === BudgetPeriod.YEARLY;

    return {
        id: String(rule.id),
        title: rule.name,
        statusText: budgetStatusText(rule),
        type: isRing ? 'ring' : 'linear',
        usedAmount,
        totalAmount,
        currencySymbol: getUserCurrencySymbol(userCurrency),
        progressPercent: Math.min(100, Math.max(0, progressPercent)),
        categories: mapBudgetCategories(rule.category_ids ?? [], categoryById),
    };
}

export function pickExchangeRates(
    expenses: ExpenseDetailsBasicResponse[]
): ExchangeRateDetails | null {
    for (let i = expenses.length - 1; i >= 0; i -= 1) {
        if (expenses[i]?.exchange_rate) return expenses[i].exchange_rate;
    }
    return null;
}
