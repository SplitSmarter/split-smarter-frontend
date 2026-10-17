import type {Currency} from '@/src/api/dto/constants';

const SYMBOL: Partial<Record<string, string>> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
};

export function formatExpenseMoney(
    amount: number | null | undefined,
    currency?: Currency | string | null
): string {
    if (amount == null || Number.isNaN(amount)) return '—';
    const code = currency ?? 'INR';
    const symbol = SYMBOL[code] ?? `${code} `;
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    });
    const sign = amount < 0 ? '-' : '';
    return `${sign}${symbol}${formatted}`;
}

export function netPositionLabel(net: number | null | undefined, settled: boolean): string {
    if (settled) return 'Settled for you';
    if (net == null || Math.abs(net) < 0.005) return 'Balanced';
    if (net > 0) return 'You are owed';
    return 'You owe';
}
