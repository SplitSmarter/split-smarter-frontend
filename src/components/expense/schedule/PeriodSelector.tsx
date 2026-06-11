import React from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import {RecurringPeriod} from "@/src/constants/expense/schedule";

interface PeriodSelectorProps {
    selectedPeriod: RecurringPeriod;
    onPeriodChange: (period: RecurringPeriod) => void;
}

const periods: { key: RecurringPeriod; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' }
];

export const PeriodSelector = ({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) => (
    <View className="items-center mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <View className="flex-row gap-x-3">
                {periods.map((item) => {
                    const isActive = selectedPeriod === item.key;
                    return (
                        <Pressable
                            key={item.key}
                            onPress={() => onPeriodChange(item.key)}
                            className={`px-6 py-2.5 rounded-2xl shadow-sm ${isActive ? 'bg-emerald-700' : 'bg-gray-100'}`}
                        >
                            <AppText className={`font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                            </AppText>
                        </Pressable>
                    );
                })}
            </View>
        </ScrollView>
    </View>
);