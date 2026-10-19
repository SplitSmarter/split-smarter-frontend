import {
    ExpenseDetailsBasicResponse,
} from "@/src/api/dto/expense/expense";
import type {PlaceSource} from "@/src/api/dto/constants";
import type {PlacePhotoDetails} from "@/src/api/dto/user/place";
import type {LatLng} from "react-native-maps";

export type ScopeMode = "general" | "trip";
export type DisplayView = "spots" | "heatmap" | "trail";

/** Inclusive map date filter (yyyy-MM-dd). null = all mock dates. */
export type MapDateRange = {
    startDate: string;
    endDate: string;
} | null;

export interface PlaceAgg {
    placeId: number | string;
    placeName: string;
    latitude: number;
    longitude: number;
    address?: string;
    /** Address components for CUSTOM create (from reverse geocode / region). */
    city?: string;
    state?: string;
    country?: string;
    /** ISO 3166-1 alpha-2 when known. */
    countryCode?: string;
    totalAmount: number;
    expensesCount: number;
    expenses: ExpenseDetailsBasicResponse[];
    /** Place provider from location details (GOOGLE / CUSTOM). */
    provider?: PlaceSource | null;
    /**
     * Backend provider reference (numeric) used when creating/saving a place.
     * Distinct from `googlePlaceId` (ChIJ string) and from app `placeId`.
     */
    providerId?: number | null;
    /** Google Places ID (ChIJ…) when known — required for external directions / Google save. */
    googlePlaceId?: string | null;
    /** Place photos from saved user place or Google details (when already enriched). */
    photos?: PlacePhotoDetails[];
}

// Retain alias for VenueAgg to maintain backwards compatibility with existing UI components
export type VenueAgg = PlaceAgg;

// Explicitly define HeatPoint using standard LatLng + weight property
export interface HeatPoint extends LatLng {
    weight: number;
}

export interface DayOption {
    id: string;
    date: string;
    label: string;
    count: number;
}

export type SheetState =
    | { kind: "venue"; venue: PlaceAgg }
    | { kind: "cluster"; venues: PlaceAgg[] }
    | null;