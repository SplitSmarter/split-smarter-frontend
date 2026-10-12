import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

interface PeersWellnessMonitorProps {
    score?: string;
    onPress?: () => void;
}

export const PeersWellnessMonitor: React.FC<PeersWellnessMonitorProps> = ({
                                                                              score = '8.5/10',
                                                                              onPress,
                                                                          }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="px-5 mb-6">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                className="p-4 rounded-2xl border flex-row justify-between items-center shadow-xl"
                style={{
                    backgroundColor: colors.bg.overlay,
                    borderColor: colors.status.border,
                }}
            >
                <View className="flex-row items-center gap-2">
                    <AppText variant="body-base">⭐</AppText>
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{ color: colors.text.primary }}
                    >
                        Peers Wellness Monitor
                    </AppText>
                </View>

                <View className="bg-bg-secondary-lighter px-3 py-1 rounded-full border border-bg-secondary/20">
                    <AppText variant="caption-xs" className="text-green-increase font-extrabold">
                        Group Health: {score}
                    </AppText>
                </View>
            </TouchableOpacity>
        </View>
    );
};
