import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { AppText } from "@/src/components/common/AppText";

interface PeersWellnessMonitorProps {
    score?: string;
    onPress?: () => void;
}

export const PeersWellnessMonitor: React.FC<PeersWellnessMonitorProps> = ({
                                                                              score = '8.5/10',
                                                                              onPress,
                                                                          }) => {
    return (
        <View className="px-5 mb-6">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                className="bg-zinc-900/80 p-4 rounded-2xl border border-white/10 flex-row justify-between items-center shadow-xl"
            >
                <View className="flex-row items-center space-x-2">
                    <AppText variant="body-base">⭐</AppText>
                    <AppText variant="body-small" className="text-white/80 font-semibold">
                        Peers Wellness Monitor
                    </AppText>
                </View>

                <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <AppText variant="caption-xs" className="text-emerald-400 font-extrabold">
                        Group Health: {score}
                    </AppText>
                </View>
            </TouchableOpacity>
        </View>
    );
};