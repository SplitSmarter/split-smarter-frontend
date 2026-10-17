import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { AppText } from "@/src/components/common/AppText";
import { EntityFallbackIcon } from "@/src/components/common/EntityFallbackIcon";
import { COLORS } from "@/src/constants/colors";
import React from "react";
import { Pressable, View } from "react-native";
import { Iconify } from "react-native-iconify";
import { UserProfile } from "../types/dashboard";

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
            fallbackComponent={
              <EntityFallbackIcon
                kind="user"
                size={20}
                color={COLORS.light.icon.lighter}
              />
            }
          />
        </View>
        <AppText variant="body-base" className="font-bold text-white">
          Hi {profile.name} 👋
        </AppText>
      </View>

      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel="Select date range"
          className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
        >
          <Iconify
            icon="heroicons:calendar"
            size={18}
            color={COLORS.light.text.contrast}
          />
        </Pressable>

        <Pressable
          onPress={onNotificationPress}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/20 active:opacity-70"
        >
          <Iconify
            icon="heroicons:bell"
            size={20}
            color={COLORS.light.text.contrast}
          />
        </Pressable>
      </View>
    </View>
  );
};
