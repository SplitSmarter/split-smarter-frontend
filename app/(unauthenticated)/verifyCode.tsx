import React, {useState} from "react";
import {View, Text, TextInput, TouchableOpacity} from "react-native";
import {useRouter, useLocalSearchParams} from "expo-router";
import {useAlert} from "@/src/context/alertContext";
import {OtpVerifyApi, OtpResendApi} from "@/src/api/auth/otp";
import {VerifyOtpForm, ResendOtpForm} from "@/src/types/auth";

const VerifyCodeScreen = () => {
    const router = useRouter();
    const {fullName, email} = useLocalSearchParams();
    const {showAlert} = useAlert();

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const handleVerifyCode = async () => {
        if (!otp.trim()) {
            showAlert("Please enter the verification code", "warning");
            return;
        }

        const payload: VerifyOtpForm = {
            email: email as string,
            otpCode: otp,
        };

        try {
            setLoading(true);
            await OtpVerifyApi(payload)
                .then((res) => {
                    if (res?.message) {
                        showAlert(res.message, "success");
                        router.push({
                            pathname: "/(unauthenticated)/userDetails",
                            params: { fullName: fullName, email: email, user_type: "USER" },
                        });
                    } else {
                        showAlert("An error occurred", "error");
                    }
                })
                .catch((err) => {
                    if (err?.message) {
                        showAlert(err.message, "error");
                        if (err?.tag === "UserExists") {
                            router.push({
                                pathname: "/(unauthenticated)/login",
                            })
                        }
                        else if (err?.tag === "OtpAlreadyVerified"){
                            router.push({
                                pathname: "/(unauthenticated)/userDetails",
                                params: {
                                    fullName: fullName,
                                    email: email,
                                    user_type: "USER"
                                }
                            })
                        }
                    } else {
                        showAlert("An error occurred. Please try again.", "error");
                    }
                });
        } catch (error) {
            console.error(error);
            showAlert("Verification failed. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        const payload: ResendOtpForm = {
            name: fullName as string,
            email: email as string,
        };

        try {
            setResendLoading(true);
            await OtpResendApi(payload).then((res) => {
                if (res?.message) {
                    showAlert(res.message, "success");
                    startCooldown();

                } else {
                    showAlert("An error occurred", "error");
                }
            })
                .catch((err) => {
                    if (err?.message) {
                        showAlert(err.message, "error");
                    } else {
                        showAlert("An error occurred. Please try again.", "error");
                    }
                });
        } catch (error) {
            console.error(error);
            showAlert("Failed to resend code.", "error");
        } finally {
            setResendLoading(false);
        }
    };

    const startCooldown = () => {
        setResendCooldown(30);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text className="text-2xl font-bold text-center text-black dark:text-white mb-4">
                Enter Verification Code
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-300 mb-6">
                Code sent to {email}
            </Text>

            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-center text-black dark:text-white text-xl"
                keyboardType="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                placeholderTextColor="#888"
                value={otp}
                onChangeText={setOtp}
            />

            <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={loading}
                className={`py-3 rounded-lg mb-4 ${loading ? "bg-gray-400" : "bg-green-700"}`}
            >
                <Text className="text-white text-center font-semibold">
                    {loading ? "Verifying..." : "Verify Code"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className={`py-3 rounded-lg ${
                    resendLoading || resendCooldown > 0 ? "bg-gray-400" : "bg-blue-600"
                }`}
            >
                <Text className="text-white text-center font-semibold">
                    {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : resendLoading
                            ? "Resending..."
                            : "Resend Code"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default VerifyCodeScreen;
