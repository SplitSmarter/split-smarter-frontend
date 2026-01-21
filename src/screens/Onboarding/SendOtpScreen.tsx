// /src/screens/SendOtp.tsx
import React, { useState } from 'react';
import { View, Pressable, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Iconify } from "react-native-iconify";
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { AppInput } from "@/src/components/common/AppInput";
import { i18n as i18nInstance } from "@/src/i18n/index";
import { useThemeStore } from "@/src/store/useThemeStore";
import { COLORS } from "@/src/constants/colors";
import { OtpSendApi } from "@/src/api/auth/otp";
import { useAlert } from "@/src/context/alertContext";
import {ErrorCode} from "@/src/api/dto/defaults/gateway/ErrorCode";
import {useDeviceStore} from "@/src/store/deviceStore";

const SendOtpScreen = () => {
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const { showAlert } = useAlert();
    const router = useRouter();
    const { theme } = useThemeStore();
    const platform = useDeviceStore((state) => state.platform);
    const isDark = theme === 'dark';

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleBack = () => router.back();

    const handleSendCode = async () => {
        if (!email.trim()) {
            showAlert(t('common.error.field.email.empty'), "error");
            return;
        }

        setLoading(true);
        try {
            const res = await OtpSendApi({ email: email.trim() });

            if (res) {
                showAlert(t(res.message), "success");
                router.push({
                    pathname: "/(unauthenticated)/verifyOtp",
                    params: { email: email.trim() },
                });
            }
        } catch (err: any) {
            const errorTag = err?.tag;
            const errorMessage = err?.message;
            console.info("error: ", errorTag);
            switch (errorTag) {
                case ErrorCode.RESOURCE_USER_CONFLICT:
                    // User already exists in DB
                    showAlert(t(errorMessage || "error"), "error");
                    router.push({ pathname: "/(unauthenticated)/login" });
                    break;
                case ErrorCode.FIELD_OTP_VERIFIED:
                    // OTP already verified, but profile not finished
                    router.push({
                        pathname: "/(unauthenticated)/signup",
                        params: {
                            email: email.trim(),
                            user_type: "USER",
                        }
                    });
                    break;
                case ErrorCode.FIELD_OTP_ALREADY_SENT:
                    // OTP already verified, but profile not finished
                    router.push({
                        pathname: "/(unauthenticated)/verifyOtp",
                        params: {
                            email: email.trim(),
                            user_type: "USER",
                        }
                    });
                    break;
                default:
                    // Fallback to the specific error from backend or a generic one
                    showAlert(
                        err?.message || t('common.error.unknown_error'),
                        "error",
                    );
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        router.push({
            pathname: "/(unauthenticated)/signup",
            params: {
                email: "",
                user_type: "GUEST",
            }
        });
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
                    <View className="pt-4">
                        <View className="flex-row items-center mb-2">
                            <Pressable onPress={handleBack} className="p-2 -ml-2">
                                <Iconify
                                    icon="heroicons:arrow-left"
                                    size={24}
                                    color={isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light}
                                />
                            </Pressable>
                            <View className="flex-1 flex-row justify-center mr-8">
                                <AppText variant="h3">{t('common.auth.signup')} to Split </AppText>
                                <AppText variant="h3" className="text-bg-secondary">Smarter</AppText>
                            </View>
                        </View>

                        <View className="items-center mb-8">
                            <AppText variant="body-base" className="opacity-60">
                                {t('common.auth.greeting', 'Hello Stranger 👋')}
                            </AppText>
                        </View>

                        {/* Input Section */}
                        <View className="gap-y-4">
                            <AppInput
                                label={t('common.auth.emailLabel', 'E-mail')}
                                required
                                placeholder={t('common.auth.emailPlaceholder', 'Enter your email')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View className="flex-1" />

                    {/* Actions Section */}
                    <View className="gap-y-6 pb-10">
                        <View className="gap-y-4">
                            <AppButton
                                onPress={handleSendCode}
                                variant="primary"
                                size="lg"
                                className="w-full"
                                hasShadow={true}
                                loading={loading}
                                loadingText={t('common.auth.sending', 'Sending Code...')}
                            >
                                {t('common.auth.verifyEmail', 'Verify Email')}
                            </AppButton>

                            <View className="flex-row gap-x-4">
                                <AppButton
                                    onPress={handleGuest}
                                    variant="secondary"
                                    size="md"
                                    hasBorder={true}
                                    className="flex-1 border-bg-primary-darker"
                                >
                                    {t('common.auth.continueGuest', 'Guest')}
                                </AppButton>

                                <AppButton
                                    onPress={() => console.log("Google Login triggered")}
                                    variant="secondary"
                                    size="md"
                                    hasBorder={true}
                                    className="flex-1 border-bg-primary-darker"
                                    renderIcon={(color) => (
                                        <Iconify icon="logos:google-icon" size={18} />
                                    )}
                                >
                                    Google
                                </AppButton>
                            </View>
                        </View>

                        {/* Footer Redirect */}
                        <View className="items-center">
                            <AppText variant="caption-xs" className="opacity-60 text-text-primary-lighter mb-4">
                                {t('common.auth.alreadyMember', 'if already a member login below')}
                            </AppText>

                            <AppButton
                                onPress={() => router.push('/login')}
                                variant="secondary"
                                size="lg"
                                hasBorder={true}
                                className={`w-full ${isDark ? 'border-white/20' : 'border-gray-900'}`}
                            >
                                {t('common.auth.login')}
                            </AppButton>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default SendOtpScreen;