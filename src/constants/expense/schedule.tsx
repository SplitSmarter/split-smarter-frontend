import {Month, Weekday } from "@/src/api/dto/expense/constant";

export type SchedulingTab = 'one_time' | 'recurring';
export type RecurringPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DateWeekly { weekday: Weekday }
export interface DateMonthly { day: number }
export interface DateYearly { day: number; month: Month }
export interface DateCustom { day: number }

export type DateComponentUnion = DateWeekly | DateMonthly | DateYearly | DateCustom;

export interface RecurringDateComponent {
    recurring_period: string; // matches backend string/enum
    custom_period_duration?: number;
    interval: number;
    selected_values: DateComponentUnion[];
    start_date?: string; // ISO String
    end_date?: string;   // ISO String
}

export interface DateComponentPayload {
    date?: string; // ISO String
    is_recurring: boolean;
    recurring_details: RecurringDateComponent | null;
}