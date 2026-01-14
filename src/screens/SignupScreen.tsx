import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {OtpSendApi} from "@/src/api/auth/otp";
import {SendOtpForm} from "@/src/types/auth";
import {useAlert} from "@/src/context/alertContext";
import {getUsernameApi} from "@/src/api/auth/user";

const SignupScreen = () => {
    const {showAlert} = useAlert();
    const router = useRouter();

    const [form, setForm] = useState<SendOtpForm>({
        email: "",
        fullName: "",
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleSendCode = async () => {
        if (!form.fullName.trim() || !form.email.trim()) {
            showAlert("Please enter both name and email");
            return;
        }
        try {
            await OtpSendApi(form)
                .then((res) => {
                    if (res?.message) {
                        showAlert(res.message, "success");
                        router.push({
                            pathname: "/(unauthenticated)/verifyCode",
                            params: {
                                fullName: form.fullName,
                                email: form.email,
                            },
                        });
                    } else {
                        showAlert("An error occurred", "error");
                    }
                })
                .catch((err) => {
                    if (err?.message) {
                        console.info("Signup identified error");
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
                                    email: form.email,
                                    fullName: form.fullName,
                                    user_type: "USER",
                                }
                            })
                        }
                    } else {
                        showAlert("An error occurred. Please try again.", "error");
                    }
                });
        } catch (error) {
            console.log(error);
            showAlert("An error occurred. Please try again.", "error");
        }
    };

    const handleGuest = async () => {
        if (!form.fullName.trim()) {
            showAlert("Please enter name");
            return;
        }
        router.push({
            pathname: "/(unauthenticated)/userDetails",
            params: {
                email: null,
                fullName: form.fullName,
                user_type: "GUEST",
            }
        });
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text className="text-3xl font-bold text-center text-black dark:text-white mb-8">
                Sign Up
            </Text>
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={form.fullName}
                onChangeText={(text) => handleChange("fullName", text)}
            />
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-6 text-black dark:text-white"
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#888"
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
            />

            <TouchableOpacity
                onPress={handleSendCode}
                className="bg-green-700 py-3 rounded-lg"
            >
                <Text className="text-white text-center font-semibold">
                    Send Code
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleGuest}
                className="bg-gray-400 py-3 rounded-lg mb-4"
            >
                <Text className="text-white text-center font-semibold">
                    Continue as Guest
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default SignupScreen;
