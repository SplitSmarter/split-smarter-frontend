import React from 'react';
import { COLORS } from '@/src/constants/colors';
import {View, ScrollView, Pressable, ActivityIndicator, SafeAreaView, Dimensions} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppButton } from "@/src/components/common/AppButton";
import { AppImage } from "@/src/components/common/AppImage";
import { EntityFallbackIcon } from "@/src/components/common/EntityFallbackIcon";
import { themeStore } from '@/src/store/themeStore';
import { userStore } from '@/src/store/userStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const router = useRouter();

    const { user, isLoading, clearUser, syncUserFromServer } = userStore();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-bg-primary">
                <ActivityIndicator size="large" color={colors.icon.primary} />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center p-6 bg-bg-primary">
                <Iconify icon="heroicons:user-circle" size={80} color={colors.icon.lighter} />
                <AppText variant="h3" className="font-bold mt-4 text-text-primary text-center">Not Logged In</AppText>
                <AppText variant="body-base" className="text-text-primary-lighter text-center mt-2 mb-6 opacity-80">
                    Please log in to manage your expense tracking profiles and sync splits.
                </AppText>
                <AppButton variant="primary" className="w-full rounded-2xl" onPress={() => router.replace('/login')}>
                    Go to Login
                </AppButton>
            </View>
        );
    }

    const isPremium = user.subscription_tier === 'pro' || user.subscription_tier === 'premium';

    return (
        <SafeAreaView className="flex-1 bg-bg-primary">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Header Action Row */}
                <View className="flex-row justify-between items-center px-6 py-4">
                    <AppText variant="h3" className="font-bold text-text-primary">Profile</AppText>
                    <Pressable
                        onPress={syncUserFromServer}
                        className="p-2.5 rounded-xl bg-bg-canvas border border-border-input active:opacity-70"
                    >
                        <Iconify icon="heroicons:arrow-path" size={20} color={colors.icon.primary} />
                    </Pressable>
                </View>

                {/* Profile Hero Card */}
                <View className="items-center mt-4 px-6">
                    <View className="relative shadow-sm">
                        <AppImage
                            url={user.avatar?.url}
                            size="xl"
                            variant="circular"
                            fallbackIcon={
                                <EntityFallbackIcon kind="user" size={40} color={colors.icon.lighter} />
                            }
                        />
                        {/* FIXED: Conditionally rendering distinct string literals for the compiler */}
                        <View className="absolute bottom-0 right-0 bg-bg-secondary p-1.5 rounded-full border-4 border-bg-primary">
                            {isPremium ? (
                                <Iconify icon="heroicons:bolt-solid" size={14} color="white" />
                            ) : (
                                <Iconify icon="heroicons:sparkles" size={14} color="white" />
                            )}
                        </View>
                    </View>

                    <AppText variant="h4" className="font-bold text-text-primary mt-4">{user.name}</AppText>
                    <AppText variant="body-small" className="text-text-primary-lighter opacity-70 lowercase mt-0.5">{user.email || 'No email linked'}</AppText>

                    <View className="mt-3 px-3 py-1 bg-accent-sky-bg border border-accent-sky/30 rounded-full">
                        <AppText variant="caption-xs" className="font-bold text-accent-sky uppercase tracking-wider">
                            {user.subscription_tier} Account
                        </AppText>
                    </View>
                </View>

                {/* Account Specifications List */}
                <View className="mt-8 px-6">
                    <AppText variant="caption-xs" className="font-bold uppercase tracking-widest text-text-primary-lighter opacity-50 px-2 mb-2">
                        Account Information
                    </AppText>

                    {/* FIXED: Removed internal sub-component containing dynamic icon rendering layout structures */}
                    <View className="rounded-3xl border border-border-input overflow-hidden bg-bg-canvas">
                        <View className="flex-row items-center justify-between p-4 border-b border-border-input">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:currency-dollar" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Primary Currency</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>{user.currency}</AppText>
                        </View>

                        <View className="flex-row items-center justify-between p-4 border-b border-border-input">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:globe-alt" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Country / Region</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>
                                {`${user.city ? `${user.city}, ` : ''}${user.country}`}
                            </AppText>
                        </View>

                        <View className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:phone" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Phone Number</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>{user.phone_number || 'Not provided'}</AppText>
                        </View>
                    </View>
                </View>

                {/* Subscription Feature Limits Section */}
                <View className="mt-6 px-6">
                    <AppText variant="caption-xs" className="font-bold uppercase tracking-widest text-text-primary-lighter opacity-50 px-2 mb-2">
                        Plan Features & Limits
                    </AppText>

                    <View className="rounded-3xl border border-border-input overflow-hidden bg-bg-canvas">
                        <View className="flex-row items-center justify-between p-4 border-b border-border-input">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:map-pin" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Max Saved Places</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>{user.max_saved_places} locations</AppText>
                        </View>

                        <View className="flex-row items-center justify-between p-4 border-b border-border-input">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:map" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Premium Maps Access</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>{user.can_use_premium_map ? "Enabled" : "Disabled"}</AppText>
                        </View>

                        <View className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center flex-1 mr-4">
                                <Iconify icon="heroicons:cloud-arrow-up" size={22} color={colors.icon.lighter} />
                                <AppText className="font-medium text-text-primary ml-2">Cloud Core Syncing</AppText>
                            </View>
                            <AppText className="font-semibold text-text-primary-lighter text-right" numberOfLines={1}>{user.has_cloud_sync ? "Active" : "Unavailable"}</AppText>
                        </View>
                    </View>
                </View>

                {/* System Actions Area */}
                <View className="mt-8 px-6 pb-12">
                    <AppButton
                        variant="secondary"
                        className="rounded-2xl h-14 border border-border-input mb-3"
                        onPress={() => router.push('/(authenticated)/user/add')}
                        renderIcon={(c) => <Iconify icon="heroicons:pencil-square" size={20} color={c} />}
                    >
                        Edit Profile Fields
                    </AppButton>

                    <AppButton
                        variant="secondary"
                        className="rounded-2xl h-14 border border-red-500/10"
                        onPress={() => {
                            clearUser();
                            router.replace('/login');
                        }}
                        renderIcon={() => (
                            <Iconify icon="heroicons:arrow-left-on-rectangle" size={20} color={colors.status.error} />
                        )}
                    >
                        Sign Out Account
                    </AppButton>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}