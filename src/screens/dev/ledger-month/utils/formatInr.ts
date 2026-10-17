import type {LedgerEvent, LedgerLens} from '@/src/screens/dev/ledger-month/types';

export function formatInr(n: number): string {
    return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function lensAmount(event: LedgerEvent, lens: LedgerLens): number {
    if (lens === 'paid') return event.iPaidInr;
    if (lens === 'total') return event.totalInr;
    return event.myShareInr;
}
