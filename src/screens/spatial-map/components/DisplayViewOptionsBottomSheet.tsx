import React, {useCallback} from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {AppText} from '@/src/components/common/AppText';
import {DISPLAY_VIEW_OPTIONS} from '../constants/mapConstants';
import {DisplayView} from '../types/spatialMap.types';

interface DisplayViewOptionsBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    displayView: DisplayView;
    onSelectDisplayView: (view: DisplayView) => void;
}

function ViewOptionIcon({view, selected}: {view: DisplayView; selected: boolean}) {
    const color = selected ? '#FFFFFF' : '#2D8A5B';

    if (view === 'heatmap') {
        return <Iconify icon="heroicons:fire" size={20} color={color} />;
    }
    if (view === 'trail') {
        return <Iconify icon="heroicons:map" size={20} color={color} />;
    }
    return <Iconify icon="heroicons:map-pin" size={20} color={color} />;
}

export function DisplayViewOptionsBottomSheet({
    isVisible,
    onClose,
    displayView,
    onSelectDisplayView,
}: DisplayViewOptionsBottomSheetProps) {
    const handleSelect = useCallback(
        (view: DisplayView) => {
            onSelectDisplayView(view);
            onClose();
        },
        [onClose, onSelectDisplayView]
    );

    return (
        <AppBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={['34%']}>
            <View className="p-4">
                <AppText variant="h3" className="mb-1 font-bold text-text-primary">
                    Map View
                </AppText>
                <AppText variant="body-xs" className="mb-4 text-text-primary-lighter">
                    Choose how expenses appear on the map
                </AppText>

                <View className="gap-2">
                    {DISPLAY_VIEW_OPTIONS.map((option) => {
                        const isSelected = displayView === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                onPress={() => handleSelect(option.id)}
                                accessibilityRole="button"
                                accessibilityState={{selected: isSelected}}
                                accessibilityLabel={`Show ${option.label} view`}
                                className={`flex-row items-center rounded-xl border px-3 py-3 ${
                                    isSelected
                                        ? 'border-[#2D8A5B] bg-[#2D8A5B]'
                                        : 'border-foreground/15 bg-transparent'
                                }`}
                            >
                                <View
                                    className={`mr-3 h-9 w-9 items-center justify-center rounded-full ${
                                        isSelected ? 'bg-white/20' : 'bg-[#2D8A5B]/15'
                                    }`}
                                >
                                    <ViewOptionIcon view={option.id} selected={isSelected} />
                                </View>
                                <View className="flex-1">
                                    <AppText
                                        variant="body-base"
                                        className={
                                            isSelected
                                                ? 'font-semibold text-white'
                                                : 'font-semibold text-text-primary'
                                        }
                                    >
                                        {option.label}
                                    </AppText>
                                    <AppText
                                        variant="body-xs"
                                        className={
                                            isSelected ? 'text-white/80' : 'text-text-primary-lighter'
                                        }
                                    >
                                        {option.description}
                                    </AppText>
                                </View>
                                {isSelected && (
                                    <Iconify icon="heroicons:check" size={18} color="#FFFFFF" />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </AppBottomSheet>
    );
}
