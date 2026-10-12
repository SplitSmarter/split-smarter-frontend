import {AnalyticsBucket, AnalyticsGroupBy} from "@/src/api/dto/expense/constant";

export interface ObligationTotals {
    paid_inr: number;
    shared_inr: number;
    net_inr: number;
}

export interface CategoryObligationTotals {
    category_id: number;
    category_name: string | null;
    paid_inr: number;
    shared_inr: number;
    net_inr: number;
}

export interface TransferTotals {
    inflow_inr: number;
    outflow_inr: number;
    linked_inr: number;
    unsettled_inr: number;
    net_payment_inr: number;
}

export interface CategoryLinkedTransferTotals {
    category_id: number;
    category_name: string | null;
    linked_inr: number;
}

export interface TransferAnalyticsBlock {
    totals: TransferTotals;
    by_category: CategoryLinkedTransferTotals[] | null;
    uncategorized_unsettled_inr: number;
}

export interface AnalyticsPeriodPoint {
    period_start: string; // YYYY-MM-DD
    period_end: string; // YYYY-MM-DD
    totals: ObligationTotals;
    by_category: CategoryObligationTotals[] | null;
    transfers: TransferAnalyticsBlock | null;
}

export interface AnalyticsSeriesResponse {
    period_start: string; // YYYY-MM-DD
    period_end: string; // YYYY-MM-DD
    include_transfers: boolean;
    bucket: AnalyticsBucket;
    group_by: AnalyticsGroupBy;
    totals: ObligationTotals;
    series: AnalyticsPeriodPoint[];
    transfers: TransferAnalyticsBlock | null;
}
