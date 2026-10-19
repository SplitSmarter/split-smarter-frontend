import React, {useState} from "react";
import {View, Alert} from "react-native";
import {useRouter} from "expo-router";
import * as Linking from "expo-linking";
import {Iconify} from "react-native-iconify";
import {AppButton} from "@/src/components/common/AppButton";
import ThemeToggle from "@/src/components/common/themeToggle";
import {SelectDateBottomSheet} from "@/src/components/common/SelectDateBottomSheet";
import {DurationSelectionBottomSheet} from "@/src/components/common/DurationSelectionBottomSheet";
import {ROUTES} from "@/src/constants/routes";
import {authStore} from "@/src/store/authStore";
import {COLORS} from "@/src/constants/colors";
import {themeStore} from "@/src/store/themeStore";
import {
    SAMPLE_PLACE_LINKS,
    buildPlaceDeepLinkUrl,
} from "@/src/screens/spatial-map/utils/placeDeepLink";

export default function CameraScreen() {
    const router = useRouter();
    const logout = authStore((s) => s.logout);
    const isDark = themeStore((s) => s.theme === "dark");
    const errorColor = isDark ? COLORS.dark.status.error : COLORS.light.status.error;

    const handleLogout = async () => {
        await logout();
        router.replace("/login");
    };

    // Sheet visibility state
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isDurationOpen, setIsDurationOpen] = useState(false);

    const openSamplePlaceViaRouter = () => {
        router.push(ROUTES.mapPlace(SAMPLE_PLACE_LINKS.google.provider, SAMPLE_PLACE_LINKS.google.id));
    };

    const openSamplePlaceViaDeepLink = async () => {
        const url = buildPlaceDeepLinkUrl(SAMPLE_PLACE_LINKS.custom);
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                Alert.alert("Cannot open link", url);
                return;
            }
            await Linking.openURL(url);
        } catch (e) {
            Alert.alert("Deep link failed", String(e));
        }
    };

    return (
        <View className="flex-1 p-4 gap-y-3">
            <AppButton
                onPress={() => router.push("/expense/add")}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
                loading={false}
            >
                Add Expense
            </AppButton>

            <AppButton
                onPress={() => router.push("/payment/account/add")}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
                loading={false}
            >
                Add Account
            </AppButton>

            {/* Schedule Bottom Sheet Trigger */}
            <AppButton
                onPress={() => setIsScheduleOpen(true)}
                variant="secondary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Select Schedule
            </AppButton>

            {/* Duration Bottom Sheet Trigger */}
            <AppButton
                onPress={() => setIsDurationOpen(true)}
                variant="secondary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Select Duration
            </AppButton>

            <AppButton
                onPress={openSamplePlaceViaRouter}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Open Google place on map
            </AppButton>

            <AppButton
                onPress={openSamplePlaceViaDeepLink}
                variant="secondary"
                size="sm"
                className="w-full"
                hasShadow={true}
            >
                Open custom place (deep link)
            </AppButton>

            <ThemeToggle/>

            <AppButton
                onPress={handleLogout}
                variant="secondary"
                size="sm"
                className="w-full border border-red-500/20"
                hasShadow={false}
                renderIcon={() => (
                    <Iconify
                        icon="heroicons:arrow-left-on-rectangle"
                        size={18}
                        color={errorColor}
                    />
                )}
            >
                Logout
            </AppButton>

            {/* Schedule Bottom Sheet Modal */}
            <SelectDateBottomSheet
                visible={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onConfirm={(result) => {
                    console.log("Schedule selected:", result);
                    setIsScheduleOpen(false);
                }}
            />

            {/* Duration Bottom Sheet Modal */}
            <DurationSelectionBottomSheet
                visible={isDurationOpen}
                onClose={() => setIsDurationOpen(false)}
                onSave={(data) => {
                    console.log("Duration selected:", data);
                    setIsDurationOpen(false);
                }}
            />
        </View>
    );
}