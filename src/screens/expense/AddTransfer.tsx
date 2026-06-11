import React from 'react';
import { View, ScrollView } from 'react-native';
import { AppInput } from '@/src/components/common/AppInput';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { Iconify } from 'react-native-iconify';

const AddTransfer = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} className="gap-y-6 bg-bg-primary pb-10">
            {/* Source Account (From) */}
            <View className="gap-y-2">
                <AppText variant="caption-xs" className="text-text-primary-lighter uppercase font-bold px-1">
                    From
                </AppText>
                <View className="flex-row items-center border border-bg-secondary-lighter rounded-xl px-4 py-3 bg-bg-primary">
                    <View className="flex-row items-center flex-1">
                        <AppImage
                            id="test_id_2"
                            url="https://i.pravatar.cc/150?u=me"
                            size="sm"
                            variant="circular"
                        />
                        <AppText className="ml-3 text-text-primary font-bold">My Wallet</AppText>
                    </View>
                    <Iconify icon="heroicons:chevron-down" size={20} className="text-icon-primary-lighter" />
                </View>
            </View>

            {/* Recipient Account (To) */}
            <View className="gap-y-2">
                <AppText variant="caption-xs" className="text-text-primary-lighter uppercase font-bold px-1">
                    To
                </AppText>
                <View className="flex-row items-center border border-bg-secondary-lighter rounded-xl px-4 py-3 bg-bg-primary">
                    <View className="flex-row items-center flex-1">
                        <AppImage
                            id="test_id_3"
                            url="https://i.pravatar.cc/150?u=alisa"
                            size="sm"
                            variant="circular"
                        />
                        <AppText className="ml-3 text-text-primary font-bold">Alisa</AppText>
                    </View>
                    <Iconify icon="heroicons:chevron-down" size={20} className="text-icon-primary-lighter" />
                </View>
            </View>

            {/* Transfer Amount */}
            <View>
                <AppText variant="caption-xs" className="text-text-primary-lighter mb-2 uppercase font-bold px-1">
                    Amount
                </AppText>
                <View className="flex-row items-center border border-bg-secondary-lighter rounded-xl px-4 py-3 bg-bg-primary">
                    <AppText className="text-green-increase mr-2 text-lg">₹</AppText>
                    <AppInput
                        placeholder="0.00"
                        className="flex-1 border-0 h-auto p-0 text-green-increase font-bold"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            {/* Info Message */}
            <View className="bg-bg-secondary-lighter p-4 rounded-2xl flex-row items-start">
                <Iconify icon="heroicons:information-circle" size={20} className="text-icon-primary-lighter mt-0.5" />
                <AppText variant="body-small" className="text-text-primary-lighter ml-3 flex-1">
                    This transfer will record money moving from your wallet to Alisa. It won't affect the total group balance.
                </AppText>
            </View>

            {/* Date Selection */}
            <View className="flex-row justify-between items-center py-2 px-1">
                <View className="flex-row items-center">
                    <View className="p-2 bg-bg-secondary rounded-lg">
                        <Iconify icon="heroicons:calendar" size={20} className="text-icon-primary" />
                    </View>
                    <AppText className="ml-3 text-text-primary">Today, 24 May</AppText>
                </View>
                <Iconify icon="heroicons:chevron-right" size={20} className="text-icon-primary-lighter" />
            </View>
        </ScrollView>
    );
};

export default AddTransfer;