import React, {useRef, useState} from 'react';
import {View, Pressable, KeyboardAvoidingView, ScrollView, TextInput} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {Iconify} from "react-native-iconify";
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";
import {i18n as i18nInstance} from "@/src/i18n/index";
import {AppInput} from "@/src/components/common/AppInput";
import {COLORS} from "@/src/constants/colors";
import {themeStore} from "@/src/store/themeStore";
import {deviceStore} from "@/src/store/deviceStore";
import {authStore} from "@/src/store/authStore";
import {useAlert} from "@/src/context/alertContext";
import {CredentialLoginApi} from "@/src/api/auth/login";
import {validateIdentifier, validatePassword} from "@/src/utils/validation";
import {userStore} from "@/src/store/userStore";

const LoginScreen = () => {
    // Pass instance explicitly to fix the warning you had
    const {t} = useTranslation('translation', {i18n: i18nInstance});
    const {theme} = themeStore();
    const platform = deviceStore((state) => state.platform);
    const isDark = theme === 'dark';
    const router = useRouter();
    const {redirect} = useLocalSearchParams<{ redirect?: string }>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const passwordRef = useRef<TextInput>(null);
    const {login: authLogin} = authStore();
    const {showAlert} = useAlert();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleLogin = async () => {
        if (loading) return;
        const emailValidation = validateIdentifier(email);
        const passwordValidation = validatePassword(password);


        setErrors({
            email: emailValidation.isValid ? undefined : t(emailValidation.error!),
            password: passwordValidation.isValid ? undefined : t(passwordValidation.error!),
        });

        if (!emailValidation.isValid || !passwordValidation.isValid) {
            return; // Stop if client-side validation fails
        }

        setLoading(true);
        try {
            const res = await CredentialLoginApi({
                emailOrUsername: email.trim(),
                password: password,
            });

            // Check if the response contains the expected meta-data (token)
            if (res && res.meta?.access_token) {
                const {profile, access_token, username} = res.meta;

                // 1. Log in to AuthStore (Persists the token)
                await authLogin({
                    access_token: access_token,
                    username: username,
                    email: profile.email
                });
                userStore.getState().setUser({
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    phone_number: profile.phone_number,
                    city: profile.city,
                    region: profile.region,
                    country: profile.country,
                    currency: profile.currency as any,
                    avatar: {
                        id: profile.avatar?.asset_id || "",
                        url: profile.avatar?.asset_url || "",
                        extension: "png", // TODO: Fix
                        name: profile.name,
                    },
                    language: profile.language,
                    registered_on: profile.registered_on,
                    // subscription details
                    subscription_tier: 'premium',
                    max_saved_places: Infinity,
                    can_use_premium_map: true,
                    has_cloud_sync: true,
                });

                showAlert(res?.message || t('common.auth.loginSuccess'), "success");

                if (redirect) {
                    router.replace(redirect as any);
                } else {
                    router.replace("/(authenticated)/(tabs)");
                }
            } else {
                showAlert(res?.message || t('common.error.unknown_error'), "error");
            }
        } catch (error: any) {
            showAlert(error?.message || t('common.error.loginFailed'), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/(unauthenticated)");
        }
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={platform === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center pt-4 mb-8">
                        <Pressable onPress={handleBack} className="p-2 -ml-2">
                            <Iconify icon="heroicons:arrow-left" size={24}
                                     color={isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light}/>
                        </Pressable>
                        <View className="flex-1 flex-row justify-center mr-8">
                            <AppText variant="h3">{t('common.auth.login')} to Split </AppText>
                            <AppText variant="h3" className="text-bg-secondary">Smarter</AppText>
                        </View>
                    </View>

                    {/* 1. Form Inputs Section */}
                    <View className="gap-y-6">
                        <AppInput
                            label={t('common.auth.loginIdentifierLabel')}
                            placeholder={t('common.auth.loginIdentifierPlaceholder')}
                            keyboardType="email-address" // Suggests email keyboard
                            returnKeyType="next"
                            onSubmitEditing={() => passwordRef.current?.focus()}
                            blurOnSubmit={false}
                            value={email}
                            error={errors.email}
                            autoCapitalize="none"
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors(prev => ({...prev, email: undefined}));
                            }}
                            renderLeftIcon={(color) => <Iconify icon="heroicons:user" size={20} color={color}/>}
                        />

                        <View className="gap-y-2">
                            <AppInput
                                ref={passwordRef}
                                label={t('common.auth.passwordLabel')}
                                required
                                placeholder={t('common.auth.passwordPlaceholder')}
                                value={password}
                                returnKeyType="go"           // Shows "Go" (or "Done")
                                onSubmitEditing={handleLogin}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    if (errors.password) setErrors(prev => ({...prev, password: undefined}));
                                }}
                                error={errors.password}
                                secureTextEntry={!isPasswordVisible}
                                renderLeftIcon={(color) => <Iconify icon="heroicons:lock-closed" size={20}
                                                                    color={color}/>}
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
                            <Pressable className="items-end">
                                <AppText variant="caption-xs" className="text-bg-secondary font-medium">
                                    {t('common.auth.forgotPassword')}
                                </AppText>
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex-1"/>

                    <View className="gap-y-6 pb-8 w-full">
                        <AppButton
                            onPress={handleLogin}
                            variant="primary"
                            size="lg"
                            className="w-full"
                            hasShadow={true}
                            loading={loading}
                            loadingText={t('common.auth.loggingIn', 'Logging in...')}
                        >
                            {t('common.letsGo', 'Lets go!')}
                        </AppButton>

                        <View className="items-center w-full">
                            <AppText variant="caption-xs" className="opacity-60 text-text-primary-lighter mb-4">
                                {t('common.auth.newUserInfo')}
                            </AppText>
                            <AppButton
                                onPress={() => router.push('/(unauthenticated)/sendOtp')}
                                variant="secondary"
                                size="lg"
                                hasBorder={true}
                                className={`w-full ${isDark ? 'border-white/20' : 'border-gray-900'}`}
                            >
                                {t('common.auth.signup')}
                            </AppButton>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default LoginScreen;
