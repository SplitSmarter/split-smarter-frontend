import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import PagerView from "react-native-pager-view";
import { images } from "@/src/constants/onboarding";
import { useI18n } from "@/src/context/i18nContext";
import { useTheme } from "@/src/context/themeContext";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { useRouter } from "expo-router";
import { getUsernameApi } from "@/src/api/auth/user";

const slides = [
    { id: 1, titleKey: "onboarding.dreamLives", image: images.Onboarding1 },
    { id: 2, titleKey: "onboarding.learnLanguages", image: images.Onboarding2 },
    { id: 3, titleKey: "onboarding.achieveGoals", image: images.Onboarding3 },
];

const OnboardingScreen = () => {
    const pagerRef = useRef<PagerView>(null);
    const [page, setPage] = useState(0);
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { isLoaded, font } = useI18n();
    const router = useRouter();

    const [guestUsername, setGuestUsername] = useState<string | null>(null);
    const [loadingUsername, setLoadingUsername] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleGetGuestUsername = async () => {
        setLoadingUsername(true);
        setErrorMessage(null);
        try {
            const res = await getUsernameApi();
            setGuestUsername(res.username);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to fetch username");
        } finally {
            setLoadingUsername(false);
        }
    };

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <CustomText className="text-black dark:text-white">Loading...</CustomText>
            </View>
        );
    }

    const isDark = theme === "dark";

    return (
        <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
            {/* Pager View */}
            <PagerView
                style={{ flex: 1 }}
                initialPage={0}
                ref={pagerRef}
                onPageSelected={(e) => setPage(e.nativeEvent.position)}
            >
                {slides.map((slide) => (
                    <View
                        key={slide.id}
                        className={`flex-1 items-center justify-center ${
                            isDark ? "bg-black" : "bg-white"
                        }`}
                    >
                        <Image
                            source={slide.image}
                            className="w-60 h-60 mb-5"
                            resizeMode="contain"
                        />
                        <CustomText
                            className={`text-2xl font-bold mt-5 ${
                                isDark ? "text-white" : "text-black"
                            }`}
                            style={{ fontFamily: font.primary }}
                        >
                            {t(slide.titleKey)}
                        </CustomText>
                    </View>
                ))}
            </PagerView>

            {/* Pagination Dots */}
            <View className="flex-row justify-center items-center mb-4">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className={`w-2 h-2 rounded-full mx-1 ${
                            page === index
                                ? isDark
                                    ? "bg-white"
                                    : "bg-black"
                                : "bg-gray-400"
                        }`}
                    />
                ))}
            </View>

            {/* Buttons Section */}
            <View className="p-5">
                {/* Get Started */}
                <TouchableOpacity
                    className="bg-green-700 py-4 rounded-lg items-center"
                    onPress={() => router.push("/(unauthenticated)/signup")}
                >
                    <CustomText
                        className="text-white text-base font-bold"
                        style={{ fontFamily: font.primary }}
                    >
                        {t("common.getStarted")}
                    </CustomText>
                </TouchableOpacity>

                {/* Already Have Account */}
                <TouchableOpacity onPress={() => router.push("/(unauthenticated)/login")}>
                    <CustomText
                        className={`text-center mt-3 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                        style={{ fontFamily: font.secondary }}
                    >
                        {t("common.alreadyHaveAccount")}
                    </CustomText>
                </TouchableOpacity>

                {/* Guest Username Button */}
                <TouchableOpacity
                    className={`mt-5 py-3 rounded-lg ${
                        loadingUsername ? "bg-gray-400" : "bg-blue-600"
                    }`}
                    onPress={handleGetGuestUsername}
                    disabled={loadingUsername}
                >
                    <CustomText
                        className="text-white text-center font-semibold"
                        style={{ fontFamily: font.primary }}
                    >
                        {loadingUsername ? "Loading..." : "Get Guest Username"}
                    </CustomText>
                </TouchableOpacity>

                {/* Show guest username if loaded */}
                {guestUsername && (
                    <CustomText
                        className={`text-center mt-2 ${
                            isDark ? "text-gray-200" : "text-gray-700"
                        }`}
                        style={{ fontFamily: font.secondary }}
                    >
                        👤 Guest username: {guestUsername}
                    </CustomText>
                )}

                {/* Error message */}
                {errorMessage && (
                    <CustomText className="text-center text-red-500 mt-2">
                        {errorMessage}
                    </CustomText>
                )}

                {/* Terms & Conditions */}
                <CustomText
                    className={`text-xs text-center mt-3 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                    style={{ fontFamily: font.secondary }}
                >
                    {t("common.agreeTerms")}{" "}
                    <CustomText className="underline">
                        {t("common.termsConditions")}
                    </CustomText>
                </CustomText>
            </View>
        </View>
    );
};

export default OnboardingScreen;
