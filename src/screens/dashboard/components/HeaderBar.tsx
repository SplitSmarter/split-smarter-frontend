import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Ionicons, Feather} from '@expo/vector-icons';
import {AppText} from "@/src/components/common/AppText";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {UserProfile} from '../types/dashboard';

interface HeaderBarProps {
    profile: UserProfile;
    onNotificationPress?: () => void;
    onFilterPress?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
                                                        profile,
                                                        onNotificationPress,
                                                        onFilterPress,
                                                    }) => {
    return (
        <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                    <AppImageV2
                        id={profile.avatar.url}
                        url={profile.avatar.url}
                        contentFit="cover"
                    />
                </View>
                <AppText variant="body-base" className="font-bold text-white">
                    Hi {profile.name} 👋
                </AppText>
            </View>

            <View className="flex-row items-center gap-2.5">
                <TouchableOpacity
                    onPress={onFilterPress}
                    accessibilityRole="button"
                    accessibilityLabel="Select date range"
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20"
                >
                    <Feather name="calendar" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNotificationPress}
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20"
                >
                    <Ionicons name="notifications-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};