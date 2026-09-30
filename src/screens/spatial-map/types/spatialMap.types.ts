import {
    ExpenseDetailsBasicResponse,
} from "@/src/api/dto/expense/expense";
import type {LatLng} from "react-native-maps";

export type ScopeMode = "general" | "trip";
export type DisplayView = "spots" | "heatmap" | "trail";
export type MarkerFilter = "all" | "local" | "travel";

export interface PlaceAgg {
    placeId: number | string;
    placeName: string;
    latitude: number;
    longitude: number;
    address?: string;
    totalAmount: number;
    expensesCount: number;
    isLocal: boolean;
    expenses: ExpenseDetailsBasicResponse[];
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