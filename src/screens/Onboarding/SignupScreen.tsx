import React, {useRef, useState} from 'react';
import {View, KeyboardAvoidingView, ScrollView, Pressable, TextInput} from 'react-native';
import {useTranslation} from 'react-i18next';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {AppInput} from '@/src/components/common/AppInput';
import {AppImage} from '@/src/components/common/AppImage';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";
import {i18n as i18nInstance} from "@/src/i18n/index";
import {useThemeStore} from "@/src/store/useThemeStore";
import {Iconify} from "react-native-iconify";
import {useDeviceStore} from "@/src/store/deviceStore";
import {currencies} from '@/src/constants/currency';
import {CurrencyBottomSheet} from "@/src/screens/Onboarding/comps/CurrencyBottomSheet";
import {router, useLocalSearchParams} from "expo-router";
import {validateName, validatePassword} from "@/src/utils/validation";
import {useAlert} from "@/src/context/alertContext";
import {useAuthStore} from "@/src/store/authStore";
import {useConfigStore} from "@/src/store/useConfigStore";
import {CredentialSignupApi} from "@/src/api/auth/signup";
import {CredentialsSignupRequest} from "@/src/api/dto/auth/signup";
import {useUserStore} from "@/src/store/userStore";


const SignupScreen = () => {
    const {
        name: initialName,
        email,
        googleToken,
        auth_type = 'credentials',
    } = useLocalSearchParams<{
        name?: string;
        email?: string | undefined;
        googleToken?: string;
        auth_type?: 'google' | 'credentials';
    }>();

    const {t} = useTranslation('translation', {i18n: i18nInstance});
    const {theme} = useThemeStore();
    const platform = useDeviceStore((state) => state.platform);
    const {countryCode, cityName} = useConfigStore();
    const {login: authLogin} = useAuthStore();
    const setUser = useUserStore((state) => state.setUser);
    const isDark = theme === 'dark';
    const {showAlert} = useAlert();

    const [name, setName] = useState(initialName || "");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // 2. Refs for Keyboard Navigation
    const passwordRef = useRef<TextInput>(null);

    // 3. Error State
    const [errors, setErrors] = useState<{ name?: string; password?: string }>({});

    // Selection state
    const [currencyCode, setCurrencyCode] = useState("INR");
    const [isCurrencySheetVisible, setIsCurrencySheetVisible] = useState(false);

    const handleDiveIn = async () => {
        if (loading) return;
        // 4. Validation Logic
        const nameVal = validateName(name);
        const passVal = validatePassword(password);

        setErrors({
            name: nameVal.isValid ? undefined : t(nameVal.error!),
            password: passVal.isValid ? undefined : t(passVal.error!),
        });

        if (!nameVal.isValid || !passVal.isValid) return;

        setLoading(true);
        try {
            const signupData: CredentialsSignupRequest = {
                name: name.trim(),
                email: email || null,
                password: password,
                city: cityName || "Unknown",
                country: countryCode || "Unknown",
                currency: currencyCode,
                language: i18nInstance.language || 'en',
                user_type: email === undefined ? 'guest' : 'user',
            };
            const res = await CredentialSignupApi(signupData);
            if (res && res.meta?.access_token) {
                showAlert(t(res.message || 'common.auth.signupSuccess'), "success");

                // 1. Log into AuthStore (Tokens)
                await authLogin({
                    email: email ? email : undefined,
                    access_token: res.meta.access_token,
                    username: res.meta.username,
                });

                // 2. Update UserStore (Profile Info)
                // We construct a partial UserDetails object from the API response
                setUser({
                    name: name.trim(),
                    email: email,
                    country: countryCode || "Unknown",
                    currency: currencyCode as any,
                    avatar_id: res.meta.avatar_id || "default",
                    avatar_url: res.meta.avatar_url,
                    language: i18nInstance.language || 'en',
                    registered_on: new Date().toISOString(),
                    city: cityName || undefined,
                });

                // 3. Optional: Sync full details if your API provides more fields than meta
                // await useUserStore.getState().syncUserFromServer();

                router.replace("/(authenticated)/(tabs)");
            } else {
                showAlert(t(res?.message || 'common.error.unknown_error'), "error");
            }
        } catch (err: any) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const selectedCurrency = currencies[currencyCode as keyof typeof currencies];
    const flagUrl = `https://flagcdn.com/256x192/${selectedCurrency.countryTag.toLowerCase()}.png`;

    return (
        <ScreenWrapper withPadding={true}>
            <KeyboardAvoidingView behavior={platform === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{flexGrow: 1, alignItems: 'center'}} className="px-6 pt-10"
                            showsVerticalScrollIndicator={false}>
                    {/* Welcome Header & Profile Image... */}
                    <AppText variant="h2" className="mb-10 font-bold">
                        Welcome
                    </AppText>
                    <View className="mb-12">
                        <AppImage
                            id="user_welcome_profile"
                            url="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                            size="xxl"
                            variant="circular"
                            borderEnabled
                            borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                        />
                    </View>
                    <View className="w-full gap-y-6">
                        <AppInput
                            label="Name"
                            placeholder="Enter your name..."
                            value={name}
                            error={errors.name}
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()} // Move to password
                            blurOnSubmit={false}
                            onChangeText={(text) => {
                                setName(text);
                                if (errors.name) setErrors(prev => ({...prev, name: undefined}));
                            }}
                        />

                        <AppInput
                            ref={passwordRef} // 5. Attached Ref
                            label="Password"
                            required
                            secureTextEntry={!isPasswordVisible}
                            placeholder="Enter your password..."
                            value={password}
                            error={errors.password}
                            returnKeyType="done"
                            onSubmitEditing={handleDiveIn} // Submit on Done
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors(prev => ({...prev, password: undefined}));
                            }}
                            renderRightIcon={(color) => (
                                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    {isPasswordVisible ? (
                                        <Iconify icon="heroicons:eye-slash" size={20} color={color}/>
                                    ) : (
                                        <Iconify icon="heroicons:eye" size={20} color={color}/>
                                    )}
                                </Pressable>
                            )}
                        />

                        {/* Currency Selector (Tapping this doesn't use keyboard, so no ref needed) */}
                        <Pressable onPress={() => setIsCurrencySheetVisible(true)}>
                            <View pointerEvents="none">
                                <AppInput
                                    label="Currency"
                                    value={`${t(selectedCurrency.name)} (${selectedCurrency.symbol})`}
                                    editable={false}
                                    renderLeftIcon={() => <AppImage id={`flag_${selectedCurrency.countryTag}`}
                                                                    url={flagUrl} size="sm" variant="rounded"/>}
                                    renderRightIcon={() => <Iconify icon="heroicons:chevron-down" size={20}
                                                                    color={isDark ? "#FFF" : "#000"}/>}
                                />
                            </View>
                        </Pressable>
                    </View>

                    <View className="mt-auto mb-10 w-full">
                        <AppButton onPress={handleDiveIn} variant="primary" size="lg" className="w-full"
                                   loading={loading}>
                            Dive in
                        </AppButton>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <CurrencyBottomSheet
                isVisible={isCurrencySheetVisible}
                currentCurrency={currencyCode}
                onSelect={(code) => {
                    setCurrencyCode(code);
                    setIsCurrencySheetVisible(false);
                }}
                onClose={() => setIsCurrencySheetVisible(false)}
            />
        </ScreenWrapper>
    );
};

export default SignupScreen;