// /src/screens/OnBoarding.tsx
import React, {useState} from 'react';
import {View, Image, SafeAreaView, FlatList, NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {Iconify} from "react-native-iconify";
import {images} from "@/src/constants/images";
import {LanguageBottomSheet} from '@/src/screens/Onboarding/comps/LanguageBottomSheet';
import {useDeviceStore} from '@/src/store/deviceStore';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";
import {useRouter} from "expo-router";
import {useThemeStore} from "@/src/store/useThemeStore";
import {useAlert} from "@/src/context/alertContext";
import {GoogleLoginApi} from "@/src/api/auth/login";
import {ErrorCode} from "@/src/api/dto/defaults/gateway/ErrorCode";
import {COLORS} from "@/src/constants/colors";
import { googleSignIn } from "@/src/utils/googleAuth";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

const ONBOARDING_DATA = [
    {
        id: '1',
        image: images.Onboarding1,
        titleKey: 'onboarding.images.step1.title',
        descKey: 'onboarding.images.step1.description',
    },
    {
        id: '2',
        image: images.Onboarding2,
        titleKey: 'onboarding.images.step2.title',
        descKey: 'onboarding.images.step2.description',
    },
    {
        id: '3',
        image: images.Onboarding3,
        titleKey: 'onboarding.images.step3.title',
        descKey: 'onboarding.images.step3.description',
    },
];

const OnboardingScreen = () => {
    const [isLangVisible, setIsLangVisible] = useState(false);
    const {t} = useTranslation();
    const router = useRouter();
    const {showAlert} = useAlert();
    const [activeIndex, setActiveIndex] = useState(0);
    const {theme, toggleTheme} = useThemeStore();
    const isDark = theme === 'dark';
    const {screen, isTablet} = useDeviceStore();
    const {width, height} = screen;

    const isMounted = React.useRef(false);

    React.useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (!isMounted.current) return;

        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / width);

        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // 1. Trigger Google Native UI
            const googleRes = await googleSignIn();
            const idToken = googleRes.userInfo.idToken;

            if (!idToken) {
                showAlert("Google sign-in failed: No ID Token found", "error");
                return;
            }

            // 2. Call Backend API
            const apiRes = await GoogleLoginApi({idToken});

            showAlert(t('common.auth.loginSuccess'), "success");

            router.replace("/(authenticated)/(tabs)");

        } catch (error: any) {
            const errorTag = error?.tag;

            // 3. Handle specific New User case
            if (errorTag === ErrorCode.RESOURCE_USER_GOOGLE_UNLINKED) {
                const currentUser = await GoogleSignin.getCurrentUser();

                router.push({
                    pathname: "/(unauthenticated)/signup",
                    params: {
                        name: currentUser?.user.name || "",
                        email: currentUser?.user.email || "",
                        googleToken: currentUser?.idToken || "",
                        auth_type: "google"
                    }
                });
            } else {
                showAlert(error?.message || "Login Failed", "error");
            }
        }
    };

    const renderItem = ({item}: { item: typeof ONBOARDING_DATA[0] }) => (
        <View style={{width}} className="items-center px-6">
            <View className="items-center justify-center">
                <Image
                    source={item.image}
                    style={{
                        width: isTablet ? width * 0.6 : width * 0.8,
                        height: isTablet ? height * 0.4 : height * 0.35
                    }}
                    resizeMode="contain"
                />
            </View>

            <View className="items-center gap-y-2 mt-6">
                <AppText variant="h2" className="text-center">
                    {t(item.titleKey)}
                </AppText>
                <AppText variant="body-base" className="text-center opacity-60 px-4">
                    {t(item.descKey)}
                </AppText>
            </View>
        </View>
    );

    return (
        <ScreenWrapper withPadding={false}>
            {/* 1. Logo Section - Kept as requested */}
            <View className="flex-row items-center justify-center pt-8 mt-8 mb-2">
                <Image
                    source={images.Logo}
                    style={{width: 40, height: 40}}
                    resizeMode="contain"
                />
                <AppText variant="h2" className="ml-2">
                    Split <AppText variant="h2" className="text-bg-secondary">Smarter</AppText>
                </AppText>
            </View>

            {/* 2. Combined Content & Dots Container */}
            <View className="flex-1 justify-center py-0">
                <View>
                    <FlatList
                        data={ONBOARDING_DATA}
                        renderItem={renderItem}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{alignItems: 'center'}}
                    />

                    <View className="flex-row gap-x-1.5 self-center mt-10">
                        {ONBOARDING_DATA.map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 rounded-full transition-all ${
                                    activeIndex === index ? 'w-6 bg-foreground' : 'w-2 bg-foreground/30'
                                }`}
                            />
                        ))}
                    </View>
                </View>
            </View>

            {/* 3. Buttons Section */}
            <View className="w-full px-6 gap-y-4 pb-10">
                <View className="flex-row gap-x-4 w-full">
                    <AppButton
                        onPress={() => router.push('/(unauthenticated)/sendOtp')}
                        variant="secondary"
                        size="md"
                        hasBorder={true}
                        className="border-foreground/70"
                        style={{flex: 1}}
                    >
                        {t('common.auth.signup')}
                    </AppButton>

                    <AppButton
                        onPress={() => router.push('/(unauthenticated)/login')}
                        variant="primary"
                        size="md"
                        hasShadow={true}
                        vibrate={true}
                        style={{flex: 1}}
                    >
                        {t('common.auth.login')}
                    </AppButton>
                </View>

                <AppButton
                    onPress={handleGoogleLogin}
                    variant="secondary"
                    size="md"
                    hasBorder={true}
                    className="border-foreground/10"
                    renderIcon={(color, size) => (
                        <Iconify icon="logos:google-icon" size={size}/>
                    )}
                >
                    {t('common.auth.loginGoogle')}
                </AppButton>

                <AppButton
                    onPress={() => setIsLangVisible(true)}
                    variant="secondary"
                    size="md"
                    hasBorder={true}
                    className="border-foreground/10"
                    renderIcon={(color, size) => (
                        <Iconify icon="heroicons:language" size={size} color={color}/>
                    )}
                >
                    {t('language.name.self')}
                </AppButton>

                <AppButton
                    onPress={toggleTheme}
                    variant="secondary"
                    size="md"
                    hasBorder={true}
                    className="border-foreground/10"
                    renderIcon={() => (
                        <Iconify
                            icon={"heroicons:sun"}
                            size={20}
                            color={'green'}
                        />
                    )}
                >
                    {isDark ? t('common.theme.light') : t('common.theme.dark')}
                </AppButton>

                <LanguageBottomSheet
                    isVisible={isLangVisible}
                    onClose={() => setIsLangVisible(false)}
                />
            </View>
        </ScreenWrapper>
    );
};

export default OnboardingScreen;