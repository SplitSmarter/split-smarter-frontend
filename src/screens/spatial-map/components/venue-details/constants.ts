import {COLORS} from '@/src/constants/colors';

export const WEEKDAY_LABELS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
] as const;

export const CATEGORY_BAR_COLORS = [
    COLORS.light.accent.sky,
    COLORS.light.accent.teal,
    COLORS.light.status.warning,
    COLORS.light.accent.violet,
    COLORS.light.status.success,
] as const;

export const CLUSTER_DIST_COLORS = [
    COLORS.light.accent.sky,
    COLORS.light.accent.teal,
    COLORS.light.status.warning,
    COLORS.light.accent.violet,
    COLORS.light.status.success,
] as const;

export const VENUE_SHEET_SNAP_POINTS = ['64%', '92%'] as const;
