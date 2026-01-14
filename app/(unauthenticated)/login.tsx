import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { CredentialLoginApi } from "@/src/api/auth/login";
import { CredentialsLoginForm } from "@/src/types/auth";
import CustomText from "@/src/components/common/CustomText";
import {useAuthStore} from "@/src/store/authStore";

const LoginScreen = () => {
    const router = useRouter();
    const { showAlert } = useAlert();
    const {login} = useAuthStore()

    const [form, setForm] = useState<CredentialsLoginForm>({
        emailOrUsername: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (key: keyof CredentialsLoginForm, value: string) => {
        setForm({ ...form, [key]: value });
    };

    const handleLogin = async () => {
        if (!form.emailOrUsername.trim() || !form.password.trim()) {
            showAlert("Please enter username/email and password", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await CredentialLoginApi(form);
            console.info("Access Token:", res.access_token);
            await login({username: res.username, email: res.email, access_token: res.access_token});
            showAlert(res.message, "success");
            router.replace("/(authenticated)");
        } catch (err: any) {
            if (err?.message) {
                showAlert(err.message, "error");
                if (err?.tag === "UserDeleted") {
                    router.push("/(unauthenticated)/signup");
                }
            } else {
                showAlert("An error occurred. Please try again.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <CustomText className="text-3xl font-bold text-center text-black dark:text-white mb-8">
                Login
            </CustomText>

            {/* Email or Username */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Email or Username"
                placeholderTextColor="#888"
                value={form.emailOrUsername}
                onChangeText={(text) => handleChange("emailOrUsername", text)}
            />

            {/* Password */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-6 text-black dark:text-white"
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => handleChange("password", text)}
            />

            <TouchableOpacity
                onPress={handleLogin}
                className={`py-3 rounded-lg ${loading ? "bg-gray-400" : "bg-green-700"}`}
                disabled={loading}
            >
                <Text className="text-white text-center font-semibold">
                    {loading ? "Logging in..." : "Login"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/(unauthenticated)/signup")}
                className="mt-4"
            >
                <CustomText className="text-center text-gray-600 dark:text-gray-400">
                    Don&#39;t have an account? Sign up
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
