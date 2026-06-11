import React, {useState, useEffect} from 'react';
import {View, Pressable, KeyboardAvoidingView, ScrollView, TextInput} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {Iconify} from "react-native-iconify";

import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {ScreenWrapper} from "@/src/components/common/ScreenWrapper";
import {i18n as i18nInstance} from "@/src/i18n/index";
import {themeStore} from "@/src/store/themeStore";
import {COLORS} from "@/src/constants/colors";
import {useAlert} from "@/src/context/alertContext";
import {OtpVerifyApi, OtpSendApi, OtpResendApi} from "@/src/api/auth/otp";
import {ErrorCode} from "@/src/api/dto/defaults/gateway/ErrorCode";
import {deviceStore} from "@/src/store/deviceStore";

const OTP_COUNT = 6;

const VerifyOtpScreen = () => {
    const {t} = useTranslation('translation', {i18n: i18nInstance});
    const {showAlert} = useAlert();
    const router = useRouter();
    const {email} = useLocalSearchParams<{ email: string }>();
    const platform = deviceStore((state) => state.platform);
    const {theme} = themeStore();
    const isDark = theme === 'dark';

    const [loading, setLoading] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [timer, setTimer] = useState(59);
    const [isResendDisabled, setIsResendDisabled] = useState(true);

    // Timer logic for Resend Button
    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setIsResendDisabled(false);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleBack = () => router.back();

    const handleVerify = async () => {
        if(loading) return;

        if (otpCode.length !== OTP_COUNT) {
            showAlert(t('common.auth.invalidOtp'), "error");
            return;
        }

        setLoading(true);
        try {
            await OtpVerifyApi({email: email!, otpCode});
            router.push({
                pathname: "/(unauthenticated)/signup",
                params: {email, user_type: "USER"}
            });
        } catch (err: any) {
            setOtpCode("");
            showAlert(t(err?.message || ErrorCode.UNKNOWN_ERROR), "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setOtpCode('');
        setLoading(true);
        try {
            await OtpResendApi({email: email as string});
            setTimer(59);
            setIsResendDisabled(true);
            showAlert(t('common.auth.otpResent'), "success");
        } catch (err: any) {
            showAlert(t(err?.tag || ErrorCode.UNKNOWN_ERROR), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper withPadding={true}>
            <KeyboardAvoidingView
                behavior={platform === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header Section */}
                <View className="pt-4">
                    <View className="flex-row items-center mb-2 pt-4">
                        <Pressable onPress={handleBack} className="p-2 -ml-2">
                            <Iconify
                                icon="heroicons:arrow-left"
                                size={24}
                                color={isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light}
                            />
                        </Pressable>
                        <View className="flex-1 flex-row justify-center mr-8">
                            <AppText variant="h3" className="mb-4">
                                {t('common.auth.verifyAccount')}
                            </AppText>
                        </View>
                    </View>
                </View>

                <ScrollView contentContainerStyle={{flexGrow: 1}} className="px-6" showsVerticalScrollIndicator={false}>
                    {/* Message Section */}
                    <View className="items-center mt-4 mb-8">
                        <AppText variant="body-small" className="text-center text-text-primary-lighter opacity-60">
                            {t('common.auth.otpSentMessage', {count: OTP_COUNT, email: email})}
                        </AppText>
                    </View>

                    {/* OTP Input Container */}
                    <View className="flex-row justify-center gap-x-2 mb-10">
                        {Array.from({length: OTP_COUNT}).map((_, index) => (
                            <View
                                key={index}
                                className="w-12 h-16 rounded-2xl items-center justify-center bg-bg-primary-darker"
                            >
                                <AppText variant="h3">
                                    {otpCode[index] || ""}
                                </AppText>
                            </View>
                        ))}
                        <TextInput
                            value={otpCode}
                            onChangeText={(val) => val.length <= OTP_COUNT && setOtpCode(val)}
                            keyboardType="number-pad"
                            maxLength={OTP_COUNT}
                            style={{position: 'absolute', opacity: 0, width: '100%', height: '100%'}}
                            autoFocus={true}
                        />
                    </View>

                    {/* Submit Button */}
                    <AppButton
                        onPress={handleVerify}
                        variant="primary"
                        size="lg"
                        className="w-full"
                        loading={loading}
                    >
                        {t('common.auth.verifyOtp')}
                    </AppButton>

                    {/* Footer / Resend Section */}
                    <View className="items-center mt-8 gap-y-2">
                        <View className="flex-row">
                            <AppText variant="body-small">
                                {t('common.auth.didNotReceiveCode')}{' '}
                            </AppText>
                            <Pressable onPress={handleResend} disabled={isResendDisabled}>
                                <AppText
                                    variant="body-small"
                                    className={`font-bold ${isResendDisabled ? 'opacity-40' : 'text-blue-500'}`}
                                >
                                    {t('common.auth.resendCode')}
                                </AppText>
                            </Pressable>
                        </View>

                        {isResendDisabled && (
                            <AppText variant="caption-xs" className="opacity-50">
                                {t('common.auth.resendTimer', {seconds: timer.toString().padStart(2, '0')})}
                            </AppText>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default VerifyOtpScreen;