import React from 'react';
import { View, Text, Image, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Iconify } from 'react-native-iconify';

// Mock Data for the list
const PAYEES = [
    { id: '1', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'locked' },
    { id: '2', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'unlocked-left' },
    { id: '3', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'unlocked-inner' },
    { id: '4', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'none' },
    { id: '5', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'delete-gray' },
    { id: '6', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'delete-red' },
    { id: '7', name: 'Alex', amount: '40.00', percentage: '33.33%', status: 'none' },
];

const SUGGESTIONS = [
    { id: 'b1', name: 'Benjamin' },
    { id: 'b2', name: 'Benjamin' },
    { id: 'b3', name: 'Benjamin' },
];

const Avatar = ({ size = 48 }) => (
    <Image
        source={{ uri: 'https://i.pravatar.cc/150?u=alex' }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="bg-gray-200"
    />
);

export default function ExpenseScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#6BA693]">
            <View className="flex-1 bg-white rounded-t-[32px] mt-4 p-6">

                {/* Header */}
                <View className="flex-row items-center mb-8">
                    <Pressable className="p-2">
                        <Iconify icon="material-symbols:chevron-left" size={28} color="#000" />
                    </Pressable>
                    <Text className="flex-1 text-center text-xl font-semibold mr-8">
                        People who paid for expense
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Suggestions Section */}
                    <Text className="text-xl font-medium text-gray-800 mb-4">Suggestions</Text>
                    <View className="flex-row justify-between px-2 mb-10">
                        {SUGGESTIONS.map((item) => (
                            <View key={item.id} className="items-center">
                                <Avatar size={56} />
                                <Text className="mt-2 text-gray-700 font-medium">{item.name}</Text>
                            </View>
                        ))}
                        <View className="items-center">
                            <View className="w-[56px] h-[56px] rounded-full border border-gray-300 items-center justify-center">
                                <Iconify icon="ph:user-plus" size={24} color="#666" />
                            </View>
                            <Text className="mt-2 text-gray-700 font-medium">More</Text>
                        </View>
                    </View>

                    {/* Table Container */}
                    <View className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-10">
                        <View className="flex-row justify-between mb-4 px-2">
                            <Text className="text-gray-500 font-bold tracking-widest">PERSON</Text>
                            <View className="flex-row items-center">
                                <Text className="text-gray-500 font-bold tracking-widest">Amount</Text>
                                <Iconify icon="tabler:chevron-down" size={14} color="#666" className="ml-1" />
                            </View>
                        </View>

                        {PAYEES.map((person, index) => (
                            <View key={person.id} className={`flex-row items-center py-3 ${index !== PAYEES.length - 1 ? 'border-b border-gray-50' : ''}`}>

                                {/* Status Icons based on UI reference */}
                                <View className="w-8 items-center">
                                    {person.status === 'unlocked-left' && <Iconify icon="material-symbols:lock-open-outline" size={20} color="#666" />}
                                </View>

                                <View className="relative">
                                    <Avatar size={44} />
                                    {person.status === 'locked' && (
                                        <View className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                                            <Iconify icon="material-symbols:lock" size={12} color="#FFA500" />
                                        </View>
                                    )}
                                </View>

                                <View className="flex-1 ml-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-lg font-medium text-gray-800">{person.name}</Text>
                                        {person.status === 'unlocked-inner' && (
                                            <Iconify icon="material-symbols:lock-open-outline" size={14} color="#FFA500" className="ml-1" />
                                        )}
                                    </View>
                                    <Text className="text-xs text-gray-400 font-bold">{person.percentage}</Text>
                                </View>

                                <View className="flex-row items-center">
                                    <Text className="text-base font-semibold mr-3">₹ {person.amount}</Text>

                                    {person.status === 'delete-gray' && (
                                        <Iconify icon="material-symbols:delete-rounded" size={24} color="#444" />
                                    )}
                                    {person.status === 'delete-red' && (
                                        <Iconify icon="material-symbols:delete-rounded" size={24} color="#FF5252" />
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Total Row */}
                        <View className="flex-row justify-end items-center mt-4 pt-4 border-t border-gray-100">
                            <Text className="text-xl text-gray-800 mr-4">Total</Text>
                            <Text className="text-xl font-bold text-gray-900">₹ 120.00</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}