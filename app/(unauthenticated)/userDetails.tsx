import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { CredentialSignupForm } from "@/src/types/auth";
import { CredentialSignupApi } from "@/src/api/auth/signup";
import { getUsernameApi } from "@/src/api/auth/user";
import CustomText from "@/src/components/common/CustomText";
import {supportedLanguages} from "@/src/constants/languages";
import {useAuthStore} from "@/src/store/authStore";

const UserDetailsScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true); // page-level loading
    const [submitting, setSubmitting] = useState(false); // button submission
    const { fullName, email, user_type } = useLocalSearchParams();
    const { showAlert } = useAlert();
    const { login } = useAuthStore();

    const [credentialsForm, setCredentialsForm] = useState<CredentialSignupForm>({
        name: (fullName as string) || "",
        username: "",
        email: (email as string) || "",
        password: "",
        country: "India",
        currency: "INR",
        language: "en",
        user_type: (user_type as string) || "USER",
    });

    const fetchLocationInfo = async () => {
        try {
            const res = await fetch("https://ipapi.co/json");
            const data = await res.json();
            console.info(data);
            const { country_name, currency, languages } = data;

            let preferredLanguage = "en";
            if (languages) {
                const primaryLang = languages.split(",")[0];
                const langPrefix = primaryLang.split("-")[0];
                if (supportedLanguages.includes(langPrefix)) {
                    preferredLanguage = langPrefix;
                }
            }

            setCredentialsForm((prev) => ({
                ...prev,
                country: country_name || prev.country,
                currency: currency || prev.currency,
                language: preferredLanguage,
            }));
        } catch (err) {
            console.error("Failed to fetch location info:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                await fetchLocationInfo();
                if (user_type === "GUEST") {
                    const res = await getUsernameApi();
                    setCredentialsForm((prev) => ({
                        ...prev,
                        username: res.username,
                    }));
                }
            } catch (error: any) {
                showAlert(error.message || "Failed to fetch user data", "error");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [user_type]);


    const handleChange = (key: keyof CredentialSignupForm, value: string) => {
        setCredentialsForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const { username, email, password } = credentialsForm;

        if (!username || !password) {
            showAlert("Please fill out username and password", "warning");
            return;
        }

        try {
            setSubmitting(true);

            await CredentialSignupApi(credentialsForm)
                .then(async (res) => {
                    if (res?.message) {
                        showAlert(res.message, "success");
                        await login({
                            username: username,
                            email: email,
                            access_token: res.access_token,
                        });
                        router.replace("/(authenticated)");
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
            showAlert("Signup failed. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white dark:bg-black">
                <CustomText className="text-black dark:text-white">Loading...</CustomText>
            </View>
        );
    }

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <CustomText className="text-2xl font-bold text-center text-black dark:text-white mb-6">
                Complete Your Profile
            </CustomText>
            <CustomText className="text-center text-gray-600 dark:text-gray-300 mb-4">
                Welcome {fullName}, please complete your details.
            </CustomText>

            {/* Username */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Username"
                placeholderTextColor="#888"
                value={credentialsForm.username}
                onChangeText={(text) => handleChange("username", text)}
            />

            {/* Password */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={credentialsForm.password}
                onChangeText={(text) => handleChange("password", text)}
            />

            {/* Country */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Country"
                placeholderTextColor="#888"
                value={credentialsForm.country}
                onChangeText={(text) => handleChange("country", text)}
            />

            {/* Currency */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Currency"
                placeholderTextColor="#888"
                value={credentialsForm.currency}
                onChangeText={(text) => handleChange("currency", text)}
            />

            {/* Language */}
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-6 text-black dark:text-white"
                placeholder="Language (e.g., en)"
                placeholderTextColor="#888"
                value={credentialsForm.language}
                onChangeText={(text) => handleChange("language", text)}
            />

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                className={`py-3 rounded-lg ${submitting ? "bg-gray-400" : "bg-green-700"}`}
            >
                <CustomText className="text-white text-center font-semibold">
                    {submitting ? "Submitting..." : "Save & Continue"}
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default UserDetailsScreen;
