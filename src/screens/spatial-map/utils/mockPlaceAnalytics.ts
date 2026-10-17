import {AnalyticsBucket} from '@/src/api/dto/expense/constant';
import type {
    PlaceActivityAnalytics,
    PlaceActivityItem,
    PlaceAnalyticsBundle,
    PlaceCadenceAnalytics,
    PlaceCategoriesAnalytics,
    PlaceCategoryItem,
    PlaceSeriesAnalytics,
    PlaceSeriesPoint,
    PlaceSummaryAnalytics,
    PlaceWeekdayBucket,
    PlaceHourBucket,
} from '@/src/api/dto/expense/place_analytics';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import type {MapDateRange, PlaceAgg} from '../types/spatialMap.types';

function dayKey(expenseDate: string): string {
    return expenseDate.includes('T') ? expenseDate.split('T')[0] : expenseDate.slice(0, 10);
}

function parseExpenseDate(expenseDate: string): Date | null {
    const key = dayKey(expenseDate);
    const [y, m, d] = key.split('-').map(Number);
    if (!y || !m || !d) return null;
    const timeMatch = expenseDate.match(/T(\d{2}):(\d{2})/);
    const hour = timeMatch ? Number(timeMatch[1]) : 12;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;
    return new Date(y, m - 1, d, hour, minute);
}

function lastDayOfMonth(year: number, monthIndex0: number): number {
    return new Date(year, monthIndex0 + 1, 0).getDate();
}

function buildSummary(
    expenses: ExpenseDetailsBasicResponse[],
    rangeTotalShared: number
): PlaceSummaryAnalytics {
    let paid = 0;
    let shared = 0;
    expenses.forEach((e) => {
        paid += e.user_paid ?? e.total_amount ?? 0;
        shared += e.user_share ?? e.total_amount ?? 0;
    });
    const visit_count = expenses.length;
    return {
        paid_inr: paid,
        shared_inr: shared,
        net_inr: paid - shared,
        expense_count: visit_count,
        visit_count,
        avg_per_visit_inr: visit_count > 0 ? shared / visit_count : 0,
        share_of_spend: rangeTotalShared > 0 ? shared / rangeTotalShared : 0,
    };
}

function buildActivity(expenses: ExpenseDetailsBasicResponse[]): PlaceActivityAnalytics {
    const sorted = [...expenses].sort(
        (a, b) =>
            (parseExpenseDate(b.expense_date)?.getTime() ?? 0) -
            (parseExpenseDate(a.expense_date)?.getTime() ?? 0)
    );
    const items: PlaceActivityItem[] = sorted.slice(0, 20).map((e) => ({
        expense_id: e.id,
        name: e.name,
        expense_date: dayKey(e.expense_date),
        category_id: e.category?.id ?? null,
        category_name: e.category?.title ?? null,
        shared_inr: e.user_share ?? e.total_amount ?? 0,
        paid_inr: e.user_paid ?? e.total_amount ?? 0,
    }));
    return {items};
}

function buildCategories(expenses: ExpenseDetailsBasicResponse[]): PlaceCategoriesAnalytics {
    const map = new Map<number, PlaceCategoryItem>();
    let placeShared = 0;

    expenses.forEach((e) => {
        const shared = e.user_share ?? e.total_amount ?? 0;
        const paid = e.user_paid ?? e.total_amount ?? 0;
        placeShared += shared;
        const catId = e.category?.id ?? 0;
        const existing = map.get(catId);
        if (existing) {
            existing.paid_inr += paid;
            existing.shared_inr += shared;
            existing.net_inr = existing.paid_inr - existing.shared_inr;
            existing.expense_count += 1;
        } else {
            map.set(catId, {
                category_id: catId,
                category_name: e.category?.title ?? 'Other',
                paid_inr: paid,
                shared_inr: shared,
                net_inr: paid - shared,
                expense_count: 1,
                share_of_place: 0,
            });
        }
    });

    const items = Array.from(map.values())
        .map((item) => ({
            ...item,
            share_of_place: placeShared > 0 ? item.shared_inr / placeShared : 0,
        }))
        .sort((a, b) => b.shared_inr - a.shared_inr);

    return {items};
}

function addToSeriesBucket(
    buckets: Map<string, PlaceSeriesPoint>,
    key: string,
    period_start: string,
    period_end: string,
    paid: number,
    shared: number
) {
    const existing = buckets.get(key);
    if (existing) {
        existing.paid_inr += paid;
        existing.shared_inr += shared;
        existing.net_inr = existing.paid_inr - existing.shared_inr;
    } else {
        buckets.set(key, {
            period_start,
            period_end,
            paid_inr: paid,
            shared_inr: shared,
            net_inr: paid - shared,
        });
    }
}

function buildMonthlySeries(expenses: ExpenseDetailsBasicResponse[]): PlaceSeriesAnalytics {
    const buckets = new Map<string, PlaceSeriesPoint>();

    expenses.forEach((e) => {
        const key = dayKey(e.expense_date).slice(0, 7); // YYYY-MM
        const [y, m] = key.split('-').map(Number);
        const period_start = `${key}-01`;
        const period_end = `${key}-${String(lastDayOfMonth(y, m - 1)).padStart(2, '0')}`;
        const paid = e.user_paid ?? e.total_amount ?? 0;
        const shared = e.user_share ?? e.total_amount ?? 0;
        addToSeriesBucket(buckets, key, period_start, period_end, paid, shared);
    });

    const points = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, point]) => point);

    return {bucket: AnalyticsBucket.MONTH, points};
}

/** One bucket per calendar day for the venue spending-trend toggle. */
function buildDailySeries(expenses: ExpenseDetailsBasicResponse[]): PlaceSeriesAnalytics {
    const buckets = new Map<string, PlaceSeriesPoint>();

    expenses.forEach((e) => {
        const key = dayKey(e.expense_date);
        const paid = e.user_paid ?? e.total_amount ?? 0;
        const shared = e.user_share ?? e.total_amount ?? 0;
        addToSeriesBucket(buckets, key, key, key, paid, shared);
    });

    const points = Array.from(buckets.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, point]) => point);

    return {bucket: AnalyticsBucket.DAY, points};
}

export function getMockPlaceSeries(
    venue: PlaceAgg,
    mode: 'daily' | 'monthly'
): PlaceSeriesAnalytics {
    const expenses = venue.expenses ?? [];
    return mode === 'daily' ? buildDailySeries(expenses) : buildMonthlySeries(expenses);
}

export type PlaceSheetInsight = {
    badge: string;
    text: string;
};

/** Lightweight mock insight from cadence + summary (UI-only). */
export function getMockPlaceInsight(analytics: PlaceAnalyticsBundle): PlaceSheetInsight | null {
    const s = analytics.summary;
    const c = analytics.cadence;
    if (!s || s.visit_count === 0) return null;

    const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const topWd = [...(c?.by_weekday ?? [])].sort((a, b) => b.visit_count - a.visit_count)[0];
    const pct = (s.share_of_spend * 100).toFixed(1);

    if (topWd && topWd.visit_count > 0) {
        return {
            badge: 'Smart Insight',
            text: `You visit most on ${WEEKDAY[topWd.weekday] ?? 'weekdays'}. This place is ${pct}% of spend in the selected range.`,
        };
    }

    return {
        badge: 'Place Snapshot',
        text: `${s.visit_count} visit${s.visit_count === 1 ? '' : 's'} here · avg ${Math.round(s.avg_per_visit_inr)} per visit (${pct}% of range).`,
    };
}

function buildCadence(expenses: ExpenseDetailsBasicResponse[]): PlaceCadenceAnalytics {
    const weekdayMap = new Map<number, PlaceWeekdayBucket>();
    const hourMap = new Map<number, PlaceHourBucket>();
    let lastVisit: Date | null = null;

    expenses.forEach((e) => {
        const dt = parseExpenseDate(e.expense_date);
        if (!dt) return;
        const shared = e.user_share ?? e.total_amount ?? 0;
        const weekday = dt.getDay(); // 0=Sun
        const hour = dt.getHours();

        const wd = weekdayMap.get(weekday) ?? {weekday, visit_count: 0, shared_inr: 0};
        wd.visit_count += 1;
        wd.shared_inr += shared;
        weekdayMap.set(weekday, wd);

        const hb = hourMap.get(hour) ?? {hour, visit_count: 0, shared_inr: 0};
        hb.visit_count += 1;
        hb.shared_inr += shared;
        hourMap.set(hour, hb);

        if (!lastVisit || dt > lastVisit) lastVisit = dt;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let days_since_last_visit: number | null = null;
    let last_visit_on: string | null = null;
    if (lastVisit) {
        const lastDay = new Date(lastVisit);
        lastDay.setHours(0, 0, 0, 0);
        days_since_last_visit = Math.max(
            0,
            Math.round((today.getTime() - lastDay.getTime()) / 86400000)
        );
        last_visit_on = [
            lastVisit.getFullYear(),
            String(lastVisit.getMonth() + 1).padStart(2, '0'),
            String(lastVisit.getDate()).padStart(2, '0'),
        ].join('-');
    }

    const totalShared = expenses.reduce(
        (s, e) => s + (e.user_share ?? e.total_amount ?? 0),
        0
    );

    return {
        by_weekday: Array.from(weekdayMap.values()).sort((a, b) => a.weekday - b.weekday),
        by_hour: Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour),
        last_visit_on,
        days_since_last_visit,
        current: {visit_count: expenses.length, shared_inr: totalShared},
        previous: {visit_count: 0, shared_inr: 0},
    };
}

/**
 * Builds a PlaceAnalyticsBundle from date-filtered place expenses (mock).
 * Omits rank / price_band (not shown in venue sheet).
 */
export function getMockPlaceAnalytics(
    venue: PlaceAgg,
    dateRange: MapDateRange,
    rangeTotalShared: number
): PlaceAnalyticsBundle {
    const expenses = venue.expenses ?? [];
    const numericPlaceId =
        typeof venue.placeId === 'number' ? venue.placeId : Number(venue.placeId) || 0;

    let start_date = dateRange?.startDate ?? '';
    let end_date = dateRange?.endDate ?? '';
    if (!start_date || !end_date) {
        const days = expenses.map((e) => dayKey(e.expense_date)).sort();
        start_date = days[0] ?? new Date().toISOString().slice(0, 10);
        end_date = days[days.length - 1] ?? start_date;
    }

    return {
        place_ids: numericPlaceId > 0 ? [numericPlaceId] : [],
        place_id: numericPlaceId > 0 ? numericPlaceId : null,
        start_date,
        end_date,
        summary: buildSummary(expenses, rangeTotalShared),
        activity: buildActivity(expenses),
        categories: buildCategories(expenses),
        series: buildMonthlySeries(expenses),
        cadence: buildCadence(expenses),
    };
}
