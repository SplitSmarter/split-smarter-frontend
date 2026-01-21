// /src/screens/Login.tsx
import React, { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { i18n as i18nInstance } from "@/src/i18n/index";
import {AppInput} from "@/src/components/common/AppInput";
import {COLORS} from "@/src/constants/colors";
import {useThemeStore} from "@/src/store/useThemeStore";
import {useDeviceStore} from "@/src/store/deviceStore";

const LoginScreen = () => {
    // Pass instance explicitly to fix the warning you had
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const { theme } = useThemeStore();
    const platform = useDeviceStore((state) => state.platform);
    const isDark = theme === 'dark';
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = () => {
        console.log("Logging in with:", email);
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={platform === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View className="flex-row items-center pt-4 mb-8">
                        <Pressable onPress={handleBack} className="p-2 -ml-2">
                            <Iconify icon="heroicons:arrow-left" size={24} color={isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light} />
                        </Pressable>
                        <View className="flex-1 flex-row justify-center mr-8">
                            <AppText variant="h3">{t('common.auth.login')} to Split </AppText>
                            <AppText variant="h3" className="text-bg-secondary">Smarter</AppText>
                        </View>
                    </View>

                    {/* 1. Form Inputs Section */}
                    <View className="gap-y-6">
                        <AppInput
                            label={t('common.auth.emailLabel')}
                            placeholder={t('common.auth.emailPlaceholder')}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />

                        <View className="gap-y-2">
                            <AppInput
                                label={t('common.auth.passwordLabel')}
                                required
                                placeholder={t('common.auth.passwordPlaceholder')}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordVisible}
                                renderRightIcon={(color) => (
                                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                        {isPasswordVisible ? (
                                            <Iconify icon="heroicons:eye-slash" size={20} color={color} />
                                        ) : (
                                            <Iconify icon="heroicons:eye" size={20} color={color} />
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

                    <View className="flex-1" />

                    <View className="gap-y-6 pb-8 w-full">
                        <AppButton
                            onPress={handleLogin}
                            variant="primary"
                            size="lg"
                            className="w-full"
                            hasShadow={true}
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
