import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {TAB_BAR_CLEARANCE} from '../constants/mapConstants';
import {DisplayView} from '../types/spatialMap.types';

interface DisplayViewFabProps {
    insetsBottom: number;
    elevated?: boolean;
    displayView: DisplayView;
    onPress: () => void;
}

function DisplayViewIcon({view}: {view: DisplayView}) {
    if (view === 'heatmap') {
        return <Iconify icon="heroicons:fire" size={22} color="#FFFFFF" />;
    }
    if (view === 'trail') {
        return <Iconify icon="heroicons:map" size={22} color="#FFFFFF" />;
    }
    return <Iconify icon="heroicons:map-pin" size={22} color="#FFFFFF" />;
}

export function DisplayViewFab({
    insetsBottom,
    elevated = false,
    displayView,
    onPress,
}: DisplayViewFabProps) {
    // Always reserve tab-bar clearance so overlays stay put when tabs show/hide.
    const bottomOffset = insetsBottom + 20 + TAB_BAR_CLEARANCE + (elevated ? 76 : 0);

    return (
        <View
            className="absolute right-3 z-20"
            style={{bottom: bottomOffset}}
            pointerEvents="box-none"
        >
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Change map display view"
                className="h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#2D8A5B] shadow-lg active:opacity-85"
            >
                <DisplayViewIcon view={displayView} />
            </Pressable>
        </View>
    );
}
