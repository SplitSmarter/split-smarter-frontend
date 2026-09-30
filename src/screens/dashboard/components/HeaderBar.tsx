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
        <View className="flex-row justify-between items-center mb-5">
            {/* Left: Avatar & Greeting Text */}
            <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 mr-3">
                    <AppImageV2
                        id={profile.avatar.url}
                        url={profile.avatar.url}
                        contentFit="cover"
                    />
                </View>
                <View className="justify-center">
                    <AppText
                        variant="body-base"
                        className="text-white font-bold"
                    >
                        Hi {profile.name} 👋
                    </AppText>
                </View>
            </View>

            {/* Right: Filter & Notification Icons */}
            <View className="flex-row items-center space-x-2">
                {/* Filter Icon */}
                <TouchableOpacity
                    onPress={onFilterPress}
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/20"
                >
                    <Feather name="sliders" size={18} color="white"/>
                </TouchableOpacity>

                {/* Notification Icon */}
                <TouchableOpacity
                    onPress={onNotificationPress}
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/20"
                >
                    <Ionicons name="notifications-outline" size={20} color="white"/>
                </TouchableOpacity>
            </View>
        </View>
    );
};