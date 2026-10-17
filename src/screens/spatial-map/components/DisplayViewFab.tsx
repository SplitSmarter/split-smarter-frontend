import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {DISPLAY_VIEW_OPTIONS} from '../constants/mapConstants';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {DisplayView} from '../types/spatialMap.types';

interface DisplayViewFabProps {
    displayView: DisplayView;
    onSelectDisplayView: (view: DisplayView) => void;
    onOpenMemories: () => void;
    /** Optional left-side content on the same row as the view segment (e.g. trail legend). */
    leading?: React.ReactNode;
}

const onAccentContrast = COLORS.light.text.contrast;

function ViewIcon({
    view,
    selected,
    accentSky,
}: {
    view: DisplayView;
    selected: boolean;
    accentSky: string;
}) {
    const color = selected ? onAccentContrast : accentSky;
    if (view === 'heatmap') {
        return <Iconify icon="heroicons:fire" size={18} color={color} />;
    }
    if (view === 'trail') {
        return <Iconify icon="heroicons:map" size={18} color={color} />;
    }
    return <Iconify icon="heroicons:map-pin" size={18} color={color} />;
}

/** Spots / heatmap / trail segment + memories — sits under the map header sheet. */
export function DisplayViewFab({
    displayView,
    onSelectDisplayView,
    onOpenMemories,
    leading,
}: DisplayViewFabProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="gap-2" pointerEvents="box-none">
            <View className="flex-row items-center">
                {/* flex-1 keeps the segment pinned right whether leading is present or not */}
                <View className="min-w-0 flex-1 flex-row items-center pr-2">
                    {leading}
                </View>

                <View className="h-10 flex-row items-center overflow-hidden rounded-full border border-border-input bg-bg-primary shadow-sm dark:bg-bg-overlay">
                    {DISPLAY_VIEW_OPTIONS.map((option) => {
                        const isSelected = displayView === option.id;
                        return (
                            <Pressable
                                key={option.id}
                                onPress={() => onSelectDisplayView(option.id)}
                                accessibilityRole="button"
                                accessibilityState={{selected: isSelected}}
                                accessibilityLabel={`${option.label} view`}
                                className={`h-10 w-10 items-center justify-center ${
                                    isSelected ? 'bg-accent-sky' : 'active:opacity-70'
                                }`}
                            >
                                <ViewIcon
                                    view={option.id}
                                    selected={isSelected}
                                    accentSky={colors.accent.sky}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <View className="items-end">
                <Pressable
                    onPress={onOpenMemories}
                    accessibilityRole="button"
                    accessibilityLabel="Map memories"
                    className="h-10 w-10 items-center justify-center rounded-full border border-border-input bg-bg-primary shadow-sm active:opacity-85 dark:bg-bg-overlay"
                >
                    <Iconify
                        icon="heroicons:photo"
                        size={18}
                        color={colors.icon.primary}
                    />
                </Pressable>
            </View>
        </View>
    );
}
