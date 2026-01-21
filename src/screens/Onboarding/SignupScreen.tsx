import React, { useState } from 'react';
import {View, KeyboardAvoidingView, ScrollView, Pressable} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppImage } from '@/src/components/common/AppImage';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import { i18n as i18nInstance } from "@/src/i18n/index";
import { useThemeStore } from "@/src/store/useThemeStore";
import {Iconify} from "react-native-iconify";
import {useDeviceStore} from "@/src/store/deviceStore";

const SignupScreen = () => {
    const { t } = useTranslation('translation', { i18n: i18nInstance });
    const { theme } = useThemeStore();
    const platform = useDeviceStore((state) => state.platform);
    const isDark = theme === 'dark';

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleDiveIn = () => {
        // Handle logic for signup
    };

    return (
        <ScreenWrapper withPadding={true}>
            <KeyboardAvoidingView
                behavior={platform === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
                    className="px-6 pt-10"
                    showsVerticalScrollIndicator={false}
                >
                    <AppText variant="h2" className="mb-10 font-bold">
                        Welcome
                    </AppText>

                    {/* Profile Image Render */}
                    <View className="mb-12">
                        <AppImage
                            id="user_welcome_profile"
                            url="https://images.unsplash.com/photo-1494790108377-be9c29b29330" // Replace with actual user uri
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
                            onChangeText={setName}
                        />

                        <AppInput
                            label="Password"
                            required
                            secureTextEntry={!isPasswordVisible}
                            placeholder="Enter your password..."
                            value={password}
                            onChangeText={setPassword}
                            renderRightIcon={(color) => (
                                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                    {isPasswordVisible ? (
                                        <Iconify icon="heroicons:eye-slash" size={25} color={color} />
                                    ) : (
                                        <Iconify icon="heroicons:eye" size={25} color={color} />
                                    )}
                                </Pressable>
                            )}
                        />

                        <AppInput
                            label="Currency"
                            value="Rupee"
                            editable={false}
                            // Using AppImage for the square icon inside input
                            renderRightIcon={() => (
                                <View className="flex-row items-center gap-x-2">
                                    <Iconify icon="heroicons:chevron-down" size={20} color={isDark ? "#FFF" : "#000"} />
                                </View>
                            )}
                            renderLeftIcon={() => (
                                <View className="mr-2">
                                    <AppImage
                                        fallbackIcon={<Iconify icon="heroicons:user-circle" size={32} color="gray" />}
                                        size="sm"
                                        variant="rounded"
                                    />
                                </View>
                            )}
                        />
                    </View>

                    <View className="mt-auto mb-10 w-full">
                        <AppButton
                            onPress={handleDiveIn}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            Dive in
                        </AppButton>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default SignupScreen;