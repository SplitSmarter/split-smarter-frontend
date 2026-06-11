import React from 'react';
import { View } from 'react-native';
import { Iconify } from "react-native-iconify";

// GroupGalleryTab.tsx
export const GroupGalleryTab = () => (
    <View className="flex-row flex-wrap p-4">
        <View className="w-1/3 p-1 aspect-square">
            <View className="flex-1 bg-gray-100 rounded-2xl items-center justify-center">
                <Iconify icon="heroicons:photo" size={24} color="#CCC" />
            </View>
        </View>
    </View>
);