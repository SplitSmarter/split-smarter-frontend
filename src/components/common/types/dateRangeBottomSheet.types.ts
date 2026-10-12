export type DateRangeResult = {
    startDate: string; // yyyy-MM-dd
    endDate: string; // yyyy-MM-dd
};

export type DateRangeBottomSheetProps = {
    visible: boolean;
    initialStartDate?: string;
    initialEndDate?: string;
    /** Inclusive max selectable day (yyyy-MM-dd). Defaults to today. */
    maxDate?: string;
    title?: string;
    confirmLabel?: string;
    onClose: () => void;
    onConfirm: (result: DateRangeResult) => void;
    /** Clears an applied filter in the parent (e.g. reset API range). */
    onClearFilter?: () => void;
};

export type DateRangePresetId = '7d' | '30d' | 'this_month' | 'this_year';
