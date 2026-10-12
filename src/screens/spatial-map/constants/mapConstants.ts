import {DisplayView} from '../types/spatialMap.types';

export const DEBOUNCE_MS = 150;
export const TAB_BAR_IDLE_MS = 2500;
export const TAB_BAR_CLEARANCE = 72;
export const MY_LOCATION_REGION_DELTA = 0.005;
export const MAP_FAB_SIZE = 52;
export const MAP_FAB_GAP = 12;

export const MARKER_FILTER_OPTIONS = [
    { id: 'all', label: 'All Spots' },
    { id: 'local', label: 'Local' },
    { id: 'travel', label: 'Travel' },
] as const;

export const DISPLAY_VIEW_OPTIONS: Array<{
    id: DisplayView;
    label: string;
    description: string;
}> = [
    {
        id: 'spots',
        label: 'Spots',
        description: 'Individual places as map markers',
    },
    {
        id: 'heatmap',
        label: 'Heatmap',
        description: 'Spend intensity as a heat layer',
    },
    {
        id: 'trail',
        label: 'Trail',
        description: 'Chronological path of visits',
    },
];