import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Iconify } from "react-native-iconify";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { ScreenWrapper } from "@/src/components/common/ScreenWrapper";
import {COLORS} from "@/src/constants/colors";

const DashboardScreen = () => {

    return (
        <ScreenWrapper withPadding={false}>
            {/* 1. Main Background Gradient Wrapper */}
            <LinearGradient
                // Transitions from a deep forest green to the dark canvas color
                colors={['#1a4d35', '#111111']}
                locations={[0, 0.4]} // Adjusts where the green ends (40% down)
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
                >
                    {/* 2. Header Section */}
                    <View className="flex-row items-center justify-between px-6 mb-6">
                        <View className="flex-row items-center gap-x-3">
                            <AppImage
                                url="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                                size="md"
                                variant="circular"
                            />
                            <AppText variant="h3" className="text-white font-bold">Hi, Nilesh!</AppText>
                        </View>
                        <Pressable className="p-2 bg-white/10 rounded-full border border-white/5">
                            <Iconify icon="heroicons:bell" size={24} color={COLORS.golden} />
                        </Pressable>
                    </View>

                    {/* 3. Main Dashboard Card */}
                    <View className="px-4 mb-8">
                        <View className="bg-[#1A1A1A]/80 rounded-[40px] p-1 border border-white/10 shadow-2xl">
                            <View className="bg-[#121212]/90 rounded-[38px] p-5">

                                {/* Top Glass Section */}
                                <View className="rounded-[30px] overflow-hidden mb-8 border border-white/10 shadow-inner">
                                    <LinearGradient
                                        colors={['rgba(43, 135, 97, 0.6)', 'rgba(18, 18, 18, 0.4)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="p-8 items-center"
                                    >
                                        <AppText variant="caption-xs" className="text-white/60 uppercase tracking-widest">USD</AppText>
                                        <AppText variant="caption-xs" className="text-white/40 mb-4">23 April 2025</AppText>
                                        <AppText className="text-white text-5xl font-bold mb-2">$ 12,234.49</AppText>
                                        <AppText variant="body-xs" className="text-green-increase font-medium">
                                            + $123 from last week
                                        </AppText>
                                    </LinearGradient>
                                </View>

                                {/* Stats Grid */}
                                <View className="flex-row justify-between items-center px-2">
                                    <StatItem
                                        label="Paid"
                                        value="$50"
                                        icon={<Iconify icon="heroicons:hand-raised" size={28} color={COLORS.golden} />}
                                    />
                                    <View className="h-10 w-[1px] bg-white/10 border-dashed border-l" />
                                    <StatItem
                                        label="Received"
                                        value="$50"
                                        icon={<Iconify icon="heroicons:arrow-up-circle" size={28} color={COLORS.golden} />}
                                    />
                                    <View className="h-10 w-[1px] bg-white/10 border-dashed border-l" />
                                    <StatItem
                                        label="Unsettled"
                                        value="$50"
                                        icon={<Iconify icon="heroicons:banknotes" size={28} color={COLORS.golden} />}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 4. Latest Transaction Section */}
                    <View className="px-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <AppText variant="h4" className="text-white font-semibold">Latest Transaction</AppText>
                            <Pressable><AppText variant="body-small" className="text-white/40">See all</AppText></Pressable>
                        </View>

                        <View className="bg-[#1A1A1A] rounded-3xl p-4 flex-row items-center justify-between border border-white/5">
                            <View className="flex-row items-center gap-x-4">
                                <View className="bg-white/10 p-2 rounded-xl">
                                    <Iconify icon="twemoji:popcorn" size={24} />
                                </View>
                                <View>
                                    <AppText variant="body-base" className="text-white font-medium">Movie</AppText>
                                    <AppText variant="caption-xs" className="text-white/40">12/12/2012</AppText>
                                </View>
                            </View>
                            <AppText variant="body-base" className="text-red-decrease font-bold">-$423</AppText>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </ScreenWrapper>
    );
};

// ... (StatItem and Sparkline components remain the same as previous response)
// Internal Components
const StatItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
    <View className="items-center flex-1">
        <View className="mb-2">{icon}</View>
        <AppText variant="body-xs" className="text-white/40 mb-1">{label}</AppText>
        <AppText variant="body-large" className="text-white font-bold mb-1">{value}</AppText>
        <View className="flex-row items-center gap-x-1">
            <AppText variant="body-xs" className="text-green-increase">+2.1%</AppText>
            <Sparkline />
        </View>
    </View>
);

const Sparkline = () => (
    <Svg width="30" height="15" viewBox="0 0 30 15">
        <Path
            d="M0 12C5 12 7 2 12 5C17 8 22 15 30 2"
            fill="none"
            stroke="#289F32"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </Svg>
);

export default DashboardScreen;