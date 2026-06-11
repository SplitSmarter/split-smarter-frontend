import React from 'react';
import { View, FlatList, Pressable, SafeAreaView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';

// Static Data based on your screenshots
const GROUPS = [
    {
        id: '1',
        name: 'Himalaya',
        lastMessage: 'Ben (BB): Okay, I\'ll pay for the Airbnb! $860...',
        time: '3:35 PM',
        status: 'receiving',
        amount: 450.00,
        unreadCount: 3,
        avatar: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200'
    },
    {
        id: '2',
        name: '5th Street Flatmates',
        lastMessage: 'Nilesh updated the Home Rent expense',
        time: '8:15 AM',
        status: 'paying',
        amount: 1200.00,
        unreadCount: 0,
        avatar: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200'
    },
    {
        id: '3',
        name: 'Trip to Mahabs',
        lastMessage: 'You: Added "Seafood Dinner"',
        time: 'Yesterday',
        status: 'settled',
        amount: 0,
        unreadCount: 0,
        avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'
    }
];

const GroupListItem = ({ item }: { item: typeof GROUPS[0] }) => {
    const isReceiving = item.status === 'receiving';
    const isSettled = item.status === 'settled';

    return (
        <Pressable
            className="flex-row items-center px-4 py-3 bg-bg-primary border-b border-bg-secondary-lighter/20"
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
        >
            {/* Avatar Section */}
            <View className="relative">
                <AppImage
                    url={item.avatar}
                    size="xl"
                    variant="circular"
                    className="border border-bg-secondary-lighter/30"
                />
                {item.unreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-green-primary w-5 h-5 rounded-full items-center justify-center border-2 border-bg-primary">
                        <AppText className="text-[10px] text-white font-bold">{item.unreadCount}</AppText>
                    </View>
                )}
            </View>

            {/* Content Section */}
            <View className="flex-1 ml-4 justify-center">
                <View className="flex-row justify-between items-center mb-1">
                    <AppText variant="body-large" className="font-bold text-text-primary" numberOfLines={1}>
                        {item.name}
                    </AppText>
                    <AppText variant="caption-xs" className="text-text-primary opacity-50">
                        {item.time}
                    </AppText>
                </View>

                <View className="flex-row justify-between items-center">
                    <AppText
                        variant="body-small"
                        className="text-text-primary opacity-60 flex-1 mr-2"
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </AppText>

                    {/* Expense Status */}
                    {!isSettled && (
                        <View className="items-end">
                            <AppText
                                className={`text-[12px] font-bold ${isReceiving ? 'text-green-primary' : 'text-red-decrease'}`}
                            >
                                {isReceiving ? 'you receive' : 'you pay'}
                            </AppText>
                            <AppText
                                className={`text-[14px] font-bold ${isReceiving ? 'text-green-primary' : 'text-red-decrease'}`}
                            >
                                ₹{item.amount}
                            </AppText>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

export const GroupScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-bg-primary">
            {/* WhatsApp Style Header */}
            <View className="px-4 py-4 flex-row justify-between items-center bg-bg-primary border-b border-bg-secondary-lighter/10">
                <AppText variant="h2" className="font-bold text-text-primary">Groups</AppText>
                <View className="flex-row gap-x-4">
                    <Iconify icon="heroicons:magnifying-glass" size={24} color="rgb(var(--color-text-primary))" />
                    <Iconify icon="heroicons:ellipsis-vertical" size={24} color="rgb(var(--color-text-primary))" />
                </View>
            </View>

            {/* Group List */}
            <FlatList
                data={GROUPS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <GroupListItem item={item} />}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            {/* Floating Action Button */}
            <Pressable
                className="absolute bottom-6 right-6 w-14 h-14 bg-green-primary rounded-full items-center justify-center shadow-lg shadow-green-primary/40"
            >
                <Iconify icon="heroicons:plus" size={28} color="white" />
            </Pressable>
        </SafeAreaView>
    );
};