import type {MapDateRange, PlaceAgg, SheetState} from '../../types/spatialMap.types';

export type VenueTrendMode = 'daily' | 'monthly';

export interface VenueDetailsBottomSheetProps {
    sheet: SheetState | null;
    onClose: () => void;
    onSelectVenue: (venue: PlaceAgg) => void;
    dateRange: MapDateRange;
    rangeTotalShared: number;
}
