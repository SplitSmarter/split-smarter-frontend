import { create } from 'zustand';

// Explicitly define your application's valid picker origins
export type PickerContextType = 'group_details' | 'add_expense' | 'user_profile' | null;

interface UIState {
    categoryPickerContext: PickerContextType;
    setCategoryPickerContext: (context: PickerContextType) => void;
    resetCategoryPicker: () => void;
}

export const uiStore = create<UIState>((set) => ({
    categoryPickerContext: null,

    setCategoryPickerContext: (context) => set({ categoryPickerContext: context }),
    resetCategoryPicker: () => set({ categoryPickerContext: null }),
}));