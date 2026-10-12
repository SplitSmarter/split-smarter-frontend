import {Currency, CurrencyCode} from '@/src/constants/expense/currency';
import {
    ExchangeRateDetails,
    ExpenseDetailsBasicResponse,
} from '@/src/api/dto/expense/expense';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';
import {userStore} from '@/src/store/userStore';
import {MONTH_NAMES_FULL, MONTH_NAMES_SHORT} from '../constants/dashboard.constants';

/** Rates relative to INR (INR = 1), matching expense `exchange_rate` semantics. */
export const FALLBACK_EXCHANGE_RATES: ExchangeRateDetails = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    CAD: 0.016,
    GBP: 0.0095,
};

export const getMonthShort = (isoString: string): string => {
    const d = new Date(isoString);
    return MONTH_NAMES_SHORT[d.getMonth()] || '';
};

export const getFormattedFullDate = (isoString: string): string => {
    const d = new Date(isoString);
    return `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

export const getUserCurrencyCode = (): CurrencyCode => {
    const code = userStore.getState().user?.currency || 'INR';
    return (code in Currency ? code : 'INR') as CurrencyCode;
};

export const getUserCurrencySymbol = (currencyCode?: string): string => {
    const code = (currencyCode || getUserCurrencyCode()) as CurrencyCode;
    return Currency[code]?.symbol || code;
};

/**
 * Convert an amount between currencies using expense exchange_rate rows
 * (same formula as ExpenseRow custom view): amount / fromRate * toRate.
 */
export function convertAmountWithRates(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRates?: ExchangeRateDetails | null
): number {
    if (!Number.isFinite(amount) || amount === 0) return 0;
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount;

    const rates = exchangeRates ?? FALLBACK_EXCHANGE_RATES;
    const fromRate = rates[fromCurrency as keyof ExchangeRateDetails];
    const toRate = rates[toCurrency as keyof ExchangeRateDetails];

    if (!fromRate || fromRate <= 0 || !toRate || toRate <= 0) {
        return amount;
    }

    return (amount / fromRate) * toRate;
}

/** Analytics series values are INR — convert into the user currency. */
export function convertInrToUserCurrency(
    amountInr: number,
    toCurrency: string,
    exchangeRates?: ExchangeRateDetails | null
): number {
    return convertAmountWithRates(amountInr, 'INR', toCurrency, exchangeRates);
}

export const formatCurrency = (amount: number, currencyCode?: string): string => {
    const symbol = getUserCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
};

/** Inclusive local filter by `expense_date` (yyyy-MM-dd). Ready for API range params. */
export function filterExpensesByDateRange(
    expenses: ExpenseDetailsBasicResponse[],
    range?: DateRangeResult | null
): ExpenseDetailsBasicResponse[] {
    if (!range?.startDate || !range?.endDate) return expenses;

    const start = range.startDate;
    const end = range.endDate;

    return expenses.filter((expense) => {
        const day = (expense.expense_date || '').slice(0, 10);
        if (!day) return false;
        return day >= start && day <= end;
    });
}
