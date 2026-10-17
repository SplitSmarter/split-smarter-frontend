import {AnalyticsBucket} from '@/src/api/dto/expense/constant';
import {RelationWithUserType} from '@/src/api/dto/constants';

/** Mirrors backend PlaceAnalyticsSection */
export enum PlaceAnalyticsSection {
    SUMMARY = 'summary',
    ACTIVITY = 'activity',
    SERIES = 'series',
    CATEGORIES = 'categories',
    PEOPLE = 'people',
    GROUPS = 'groups',
    MEMORIES = 'memories',
    CADENCE = 'cadence',
    RANK = 'rank',
    SETTLEMENTS = 'settlements',
    BUDGETS = 'budgets',
    MERCHANTS = 'merchants',
    PRICE_BAND = 'price_band',
    PEERS = 'peers',
}

export enum PriceBandPosition {
    BELOW = 'below',
    WITHIN = 'within',
    ABOVE = 'above',
    UNKNOWN = 'unknown',
}

export interface PlaceSummaryAnalytics {
    paid_inr: number;
    shared_inr: number;
    net_inr: number;
    expense_count: number;
    visit_count: number;
    avg_per_visit_inr: number;
    share_of_spend: number;
}

export interface PlaceActivityItem {
    expense_id: number;
    name: string;
    expense_date: string; // YYYY-MM-DD
    category_id: number | null;
    category_name: string | null;
    shared_inr: number;
    paid_inr: number;
}

export interface PlaceActivityAnalytics {
    items: PlaceActivityItem[];
}

export interface PlaceSeriesPoint {
    period_start: string; // YYYY-MM-DD
    period_end: string; // YYYY-MM-DD
    paid_inr: number;
    shared_inr: number;
    net_inr: number;
}

export interface PlaceSeriesAnalytics {
    bucket: AnalyticsBucket;
    points: PlaceSeriesPoint[];
}

export interface PlaceCategoryItem {
    category_id: number;
    category_name: string | null;
    paid_inr: number;
    shared_inr: number;
    net_inr: number;
    expense_count: number;
    share_of_place: number;
}

export interface PlaceCategoriesAnalytics {
    items: PlaceCategoryItem[];
}

export interface PlacePeopleItem {
    user_id: number;
    user_type: RelationWithUserType;
    name: string | null;
    visit_count: number;
    shared_inr: number;
    their_paid_inr: number;
    caller_paid_inr: number;
}

export interface PlacePeopleAnalytics {
    items: PlacePeopleItem[];
}

export interface PlaceGroupItem {
    group_id: number | null;
    title: string | null;
    expense_count: number;
    visit_count: number;
    shared_inr: number;
    paid_inr: number;
}

export interface PlaceGroupsAnalytics {
    items: PlaceGroupItem[];
}

export interface PlaceMemoryItem {
    memory_id: number;
    title: string | null;
    expense_count: number;
    shared_inr: number;
    paid_inr: number;
}

export interface PlaceMemoriesAnalytics {
    items: PlaceMemoryItem[];
}

export interface PlaceWeekdayBucket {
    weekday: number;
    visit_count: number;
    shared_inr: number;
}

export interface PlaceHourBucket {
    hour: number;
    visit_count: number;
    shared_inr: number;
}

export interface PlaceCadenceWindowStats {
    visit_count: number;
    shared_inr: number;
}

export interface PlaceCadenceAnalytics {
    by_weekday: PlaceWeekdayBucket[];
    by_hour: PlaceHourBucket[];
    last_visit_on: string | null; // YYYY-MM-DD
    days_since_last_visit: number | null;
    current: PlaceCadenceWindowStats;
    previous: PlaceCadenceWindowStats;
}

export interface PlaceRankAnalytics {
    rank: number | null;
    place_count: number;
    shared_inr: number;
    percentile: number | null;
}

export interface PlaceSettlementsAnalytics {
    unsettled_inr: number;
    linked_inr: number;
    expense_count_with_open_balance: number;
}

export interface PlaceBudgetItem {
    budget_id: number;
    name: string;
    sub_limit_amount: number | null;
    used_inr: number;
    window_start: string; // YYYY-MM-DD
    window_end: string; // YYYY-MM-DD
}

export interface PlaceBudgetsAnalytics {
    items: PlaceBudgetItem[];
}

export interface PlaceMerchantItem {
    user_merchant_id: number;
    name: string | null;
    location_id: number;
    inflow_inr: number;
    outflow_inr: number;
    transfer_count: number;
}

export interface PlaceMerchantsAnalytics {
    items: PlaceMerchantItem[];
}

export interface PlacePriceBandAnalytics {
    avg_ticket_inr: number;
    price_range_min: number | null;
    price_range_max: number | null;
    position: PriceBandPosition;
}

export interface PlacePeersAnalytics {
    peer_count: number;
    median_shared_inr: number | null;
    your_shared_inr: number;
    your_percentile: number | null;
}

export interface PlaceAnalyticsBundle {
    /** Combined place IDs (multi-place bundle). Single-place may still set place_id. */
    place_ids: number[];
    place_id?: number | null;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    summary?: PlaceSummaryAnalytics | null;
    activity?: PlaceActivityAnalytics | null;
    series?: PlaceSeriesAnalytics | null;
    categories?: PlaceCategoriesAnalytics | null;
    people?: PlacePeopleAnalytics | null;
    groups?: PlaceGroupsAnalytics | null;
    memories?: PlaceMemoriesAnalytics | null;
    cadence?: PlaceCadenceAnalytics | null;
    rank?: PlaceRankAnalytics | null;
    settlements?: PlaceSettlementsAnalytics | null;
    budgets?: PlaceBudgetsAnalytics | null;
    merchants?: PlaceMerchantsAnalytics | null;
    price_band?: PlacePriceBandAnalytics | null;
    peers?: PlacePeersAnalytics | null;
}

/** Section path → response payload type */
export type PlaceAnalyticsSectionDataMap = {
    [PlaceAnalyticsSection.SUMMARY]: PlaceSummaryAnalytics;
    [PlaceAnalyticsSection.ACTIVITY]: PlaceActivityAnalytics;
    [PlaceAnalyticsSection.SERIES]: PlaceSeriesAnalytics;
    [PlaceAnalyticsSection.CATEGORIES]: PlaceCategoriesAnalytics;
    [PlaceAnalyticsSection.PEOPLE]: PlacePeopleAnalytics;
    [PlaceAnalyticsSection.GROUPS]: PlaceGroupsAnalytics;
    [PlaceAnalyticsSection.MEMORIES]: PlaceMemoriesAnalytics;
    [PlaceAnalyticsSection.CADENCE]: PlaceCadenceAnalytics;
    [PlaceAnalyticsSection.RANK]: PlaceRankAnalytics;
    [PlaceAnalyticsSection.SETTLEMENTS]: PlaceSettlementsAnalytics;
    [PlaceAnalyticsSection.BUDGETS]: PlaceBudgetsAnalytics;
    [PlaceAnalyticsSection.MERCHANTS]: PlaceMerchantsAnalytics;
    [PlaceAnalyticsSection.PRICE_BAND]: PlacePriceBandAnalytics;
    [PlaceAnalyticsSection.PEERS]: PlacePeersAnalytics;
};

export type PlaceAnalyticsSectionData<S extends PlaceAnalyticsSection> =
    PlaceAnalyticsSectionDataMap[S];

export interface PlaceAnalyticsQueryParams {
    start_date: string; // YYYY-MM-DD inclusive
    end_date: string; // YYYY-MM-DD inclusive
    bucket?: AnalyticsBucket;
    limit?: number;
    activity_limit?: number;
}

export interface PlaceAnalyticsBundleQueryParams extends PlaceAnalyticsQueryParams {
    /** One or more sections to include in the bundle */
    include: PlaceAnalyticsSection[];
}

/** Multi-place bundle query (place_ids passed separately or inline). */
export interface MultiPlaceAnalyticsBundleQueryParams
    extends PlaceAnalyticsBundleQueryParams {
    place_ids?: number[];
}
