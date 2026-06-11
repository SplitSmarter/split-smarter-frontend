import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { Iconify } from 'react-native-iconify';

interface CalendarGridProps {
    selectedDays: number[];
    onToggleDay: (day: number) => void;
    showMonthHeader?: boolean;
    monthName?: string;
    intervalValue?: number;
    onIntervalChangeClick?: () => void;
}

export const CalendarGrid = ({
                                 selectedDays,
                                 onToggleDay,
                                 showMonthHeader = false,
                                 monthName = "August 2025",
                                 intervalValue,
                                 onIntervalChangeClick
                             }: CalendarGridProps) => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <View className="bg-emerald-700 rounded-[36px] p-5 shadow-xl mx-4 mb-4">
            {/* Calendar Sub-Header */}
            <View className="flex-row justify-between items-center mb-4 px-2">
                {onIntervalChangeClick ? (
                    <Pressable onPress={onIntervalChangeClick} className="flex-row items-center gap-x-1">
                        <AppText className="text-white font-bold text-base">{monthName}</AppText>
                        {intervalValue !== undefined && (
                            <View className="bg-white/20 px-2 py-0.5 rounded-md flex-row items-center">
                                <AppText className="text-white text-xs font-bold">{intervalValue} </AppText>
                                <Iconify icon="heroicons:chevron-down" size={12} color="white" />
                            </View>
                        )}
                    </Pressable>
                ) : (
                    <AppText className="text-white font-bold text-base">{monthName}</AppText>
                )}

                <View className="flex-row gap-x-4">
                    <Pressable className="p-1"><Iconify icon="heroicons:chevron-left" size={20} color="white" /></Pressable>
                    <Pressable className="p-1"><Iconify icon="heroicons:chevron-right" size={20} color="white" /></Pressable>
                </View>
            </View>

            {/* Weekday Titles Row */}
            <View className="flex-row justify-between mb-3 px-1">
                {weekdays.map((day, idx) => (
                    <View key={idx} className="w-9 items-center">
                        <AppText className="text-white/60 text-xs font-semibold">{day}</AppText>
                    </View>
                ))}
            </View>

            {/* Numbers Month Grid Layout Block */}
            <View className="flex-row flex-wrap justify-start">
                {/* Visual padding offset block mockup to start month on a Friday layout matrix */}
                {Array.from({ length: 4 }).map((_, idx) => (
                    <View key={`empty-${idx}`} className="w-[14.28%] aspect-square p-1" />
                ))}

                {daysInMonth.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                        <Pressable
                            key={day}
                            onPress={() => onToggleDay(day)}
                            className="w-[14.28%] aspect-square p-1 items-center justify-center"
                        >
                            <View className={`w-9 h-9 rounded-full items-center justify-center ${isSelected ? 'bg-white' : ''}`}>
                                <AppText className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                                    {day}
                                </AppText>
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};