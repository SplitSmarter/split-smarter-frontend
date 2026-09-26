import React from 'react';
import { View, Pressable } from 'react-native';
import { Iconify } from 'react-native-iconify';

interface RecenterButtonProps {
    insetsTop: number;
    onPress: () => void;
}

export function RecenterButton({ insetsTop, onPress }: RecenterButtonProps) {
    return (
        <View className="absolute right-3" style={{ top: insetsTop + 128 }}>
            <Pressable
                onPress={onPress}
                className="w-11 h-11 rounded-full bg-black/80 items-center justify-center border border-white/20 shadow-lg"
            >
                <Iconify icon="heroicons:map-pin" size={20} color="#2D8A5B" />
            </Pressable>
        </View>
    );
}