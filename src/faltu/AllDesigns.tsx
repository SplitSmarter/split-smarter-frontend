// /src/screens/OnBoarding.tsx
import React, { useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as i18nInstance } from "@/src/i18n/index";
import { useThemeStore } from '@/src/store/useThemeStore';
import { useI18nStore } from '@/src/store/useI18nStore';
import { useAlert } from '@/src/context/alertContext';
import { AppText } from '@/src/components/common/AppText';
import {AppButton} from "@/src/components/common/AppButton";
import {Iconify} from "react-native-iconify";

const OnboardingScreen = () => {
    const { t, ready } = useTranslation('translation', { i18n: i18nInstance, useSuspense: false });
    const theme = useThemeStore((state) => state.theme);
    const toggleTheme = useThemeStore((state) => state.toggleTheme);
    const language = useI18nStore((state) => state.language);
    const changeLanguage = useI18nStore((state) => state.changeLanguage);
    const { showAlert } = useAlert();

    const handleAlertTest = useCallback(() => {
        if (ready) showAlert(t('Design system is functional!'));
    }, [t, showAlert, ready]);

    const colorSwatches = [
        { name: 'Canvas', className: 'bg-bg-canvas', text: 'text-text-primary' },
        { name: 'Primary', className: 'bg-bg-primary', text: 'text-text-primary' },
        { name: 'Secondary (Brand)', className: 'bg-bg-secondary', text: 'text-text-secondary' },
        { name: 'Success', className: 'bg-green-increase', text: 'text-white' },
        { name: 'Danger', className: 'bg-red-decrease', text: 'text-white' },
    ];

    return (
        <ScrollView className="flex-1 bg-background p-6">
            {!ready ? (
                <View className="flex-1 justify-center items-center mt-20">
                    <ActivityIndicator size="large" color="rgb(var(--color-bg-secondary))" />
                </View>
            ) : (
                <View className="mt-10 gap-y-8 pb-20">
                    <View className="gap-y-2">
                        <AppText variant="h1">Heading H1</AppText>
                        <AppText variant="h2">Heading H2</AppText>
                        <AppText variant="h3">Heading H3</AppText>
                        <AppText variant="h4">Heading H4</AppText>
                        <AppText variant="body-large" className="opacity-80">Body Large: Design system typography test.</AppText>
                        <AppText variant="body-base" className="opacity-80">Body Base: Design system typography test.</AppText>
                        <AppText variant="body-small" className="opacity-80">Body Small: Design system typography test.</AppText>
                        <AppText variant="body-xs" className="opacity-80">Body XS: Design system typography test.</AppText>
                        <AppText variant="caption-xs" className="opacity-80">Caption XS: Design system typography test.</AppText>
                    </View>

                    <View className="gap-y-2">
                        <AppText variant="h4" className="mb-2">Color Palette ({theme})</AppText>
                        <AppText variant="h4" className="mb-2">{t('welcome')}</AppText>
                        {colorSwatches.map((swatch) => (
                            <View key={swatch.name} className={`p-4 rounded-xl border border-foreground/5 ${swatch.className}`}>
                                <AppText variant="body-small" className={`${swatch.text} font-bold`}>{swatch.name}</AppText>
                            </View>
                        ))}
                    </View>

                    <View className="p-5 rounded-3xl bg-bg-canvas border border-foreground/10 gap-y-4">
                        <AppText variant="h4">System Controls</AppText>
                        <AppButton onPress={toggleTheme} variant="secondary">Toggle Theme</AppButton>
                        <View className="flex-row gap-x-2">
                            {['en', 'fr', 'hi'].map((lang) => (
                                <Pressable
                                    key={lang}
                                    onPress={() => changeLanguage(lang as any)}
                                    className={`flex-1 p-3 rounded-xl border ${
                                        language === lang ? 'border-bg-secondary bg-bg-secondary/10' : 'border-foreground/10'
                                    }`}
                                >
                                    <AppText className={`text-center font-bold ${language === lang ? 'text-bg-secondary' : ''}`}>
                                        {lang.toUpperCase()}
                                    </AppText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="gap-y-4">
                        <AppButton onPress={() => {}} variant="primary" size={"sm"}>Primary Action</AppButton>
                        <AppButton onPress={() => {}} hasShadow={true} variant="primary" size={"sm"}>Primary Action</AppButton>
                        <AppButton
                            onPress={handleAlertTest}
                            className="bg-red-decrease"
                            size="md"
                            renderIcon={(color, size) => (
                                <Iconify icon="heroicons:rocket-launch-solid" size={size} color={color} />
                            )}
                        >
                            Test Global Alert
                        </AppButton>
                        <AppButton
                            onPress={handleAlertTest}
                            variant={"secondary"}
                            size="md"
                            hasBorder={true}
                            renderIcon={(color, size) => (
                                <Iconify icon="heroicons:rocket-launch-solid" size={size} color={color} />
                            )}
                        >
                            Test Global Alert
                        </AppButton>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

export default OnboardingScreen;