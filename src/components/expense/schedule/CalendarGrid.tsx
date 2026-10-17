import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { Iconify } from 'react-native-iconify';
import { PLATINUM_HEADER } from '@/src/constants/colors';

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
        <View
            className="mx-4 mb-4 rounded-[36px] p-5 shadow-xl"
            style={{backgroundColor: PLATINUM_HEADER.dark}}
        >
            {/* Calendar Sub-Header */}
            <View className="mb-4 flex-row items-center justify-between px-2">
                {onIntervalChangeClick ? (
                    <Pressable onPress={onIntervalChangeClick} className="flex-row items-center gap-x-1">
                        <AppText className="text-base font-bold text-white">{monthName}</AppText>
                        {intervalValue !== undefined && (
                            <View className="flex-row items-center rounded-md bg-white/20 px-2 py-0.5">
                                <AppText className="text-xs font-bold text-white">{intervalValue} </AppText>
                                <Iconify icon="heroicons:chevron-down" size={12} color="white" />
                            </View>
                        )}
                    </Pressable>
                ) : (
                    <AppText className="text-base font-bold text-white">{monthName}</AppText>
                )}

                <View className="flex-row gap-x-4">
                    <Pressable className="p-1"><Iconify icon="heroicons:chevron-left" size={20} color="white" /></Pressable>
                    <Pressable className="p-1"><Iconify icon="heroicons:chevron-right" size={20} color="white" /></Pressable>
                </View>
            </View>

            {/* Weekday Titles Row */}
            <View className="mb-3 flex-row justify-between px-1">
                {weekdays.map((day, idx) => (
                    <View key={idx} className="w-9 items-center">
                        <AppText className="text-xs font-semibold text-white/60">{day}</AppText>
                    </View>
                ))}
            </View>

            {/* Numbers Month Grid Layout Block */}
            <View className="flex-row flex-wrap justify-start">
                {/* Visual padding offset block mockup to start month on a Friday layout matrix */}
                {Array.from({ length: 4 }).map((_, idx) => (
                    <View key={`empty-${idx}`} className="aspect-square w-[14.28%] p-1" />
                ))}

                {daysInMonth.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                        <Pressable
                            key={day}
                            onPress={() => onToggleDay(day)}
                            className="aspect-square w-[14.28%] items-center justify-center p-1"
                        >
                            <View className={`h-9 w-9 items-center justify-center rounded-full ${isSelected ? 'bg-white' : ''}`}>
                                <AppText className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-white'}`}>
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
