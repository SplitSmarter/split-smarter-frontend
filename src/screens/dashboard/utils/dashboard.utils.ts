import { MONTH_NAMES_FULL, MONTH_NAMES_SHORT } from '../constants/dashboard.constants';

export const getMonthShort = (isoString: string): string => {
    const d = new Date(isoString);
    return MONTH_NAMES_SHORT[d.getMonth()] || '';
};

export const getFormattedFullDate = (isoString: string): string => {
    const d = new Date(isoString);
    return `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};