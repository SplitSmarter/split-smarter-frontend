import React, {useCallback} from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {AppText} from '@/src/components/common/AppText';
import {MarkerFilter} from '@/src/test/features/spatial-map/types/spatialMap.types';
import {MARKER_FILTER_OPTIONS} from '@/src/test/features/spatial-map/constants/mapConstants';

interface LayerOptionsBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    markerFilter: MarkerFilter;
    onSelectFilter: (filter: MarkerFilter) => void;
    showHabitRadius: boolean;
    onToggleHabitRadius: () => void;
}

export function LayerOptionsBottomSheet({
                                            isVisible,
                                            onClose,
                                            markerFilter,
                                            onSelectFilter,
                                            showHabitRadius,
                                            onToggleHabitRadius,
                                        }: LayerOptionsBottomSheetProps) {
    const handleFilterSelect = useCallback(
        (id: MarkerFilter) => {
            onSelectFilter(id);
        },
        [onSelectFilter]
    );

    return (
        <AppBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={['38%']}>
            <View className="p-4">
                <AppText variant="h3" className="mb-4 font-bold text-text-primary">
                    Map Preferences
                </AppText>

                {/* Marker Filter Section */}
                <AppText variant="body-xs" className="mb-2 font-bold uppercase text-text-secondary">
                    Filter Spots
                </AppText>
                <View className="mb-5 flex-row flex-wrap gap-2">
                    {MARKER_FILTER_OPTIONS.map((f) => {
                        const isSelected = markerFilter === f.id;
                        return (
                            <Pressable
                                key={f.id}
                                onPress={() => handleFilterSelect(f.id)}
                                accessibilityRole="button"
                                accessibilityState={{selected: isSelected}}
                                accessibilityLabel={`Filter by ${f.label}`}
                                className={`rounded-xl border px-3 py-2 ${
                                    isSelected ? 'border-[#2D8A5B] bg-[#2D8A5B]' : 'border-foreground/20 bg-transparent'
                                }`}
                            >
                                <AppText
                                    variant="body-xs"
                                    className={isSelected ? 'font-bold text-white' : 'text-text-primary'}
                                >
                                    {f.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Overlays Section */}
                <AppText variant="body-xs" className="mb-2 font-bold uppercase text-text-secondary">
                    Overlays
                </AppText>
                <Pressable
                    onPress={onToggleHabitRadius}
                    accessibilityRole="checkbox"
                    accessibilityState={{checked: showHabitRadius}}
                    accessibilityLabel="Show Habit Radius of 2.5 kilometers"
                    className="flex-row items-center justify-between border-t border-foreground/10 py-3"
                >
                    <AppText variant="body-base" className="text-text-primary">
                        Show Habit Radius (2.5 km)
                    </AppText>
                    <View
                        className={`h-6 w-6 items-center justify-center rounded-md ${
                            showHabitRadius ? 'bg-[#2D8A5B]' : 'bg-foreground/10'
                        }`}
                    >
                        {showHabitRadius && <Iconify icon="heroicons:check" size={16} color="#FFFFFF"/>}
                    </View>
                </Pressable>
            </View>
        </AppBottomSheet>
    );
}