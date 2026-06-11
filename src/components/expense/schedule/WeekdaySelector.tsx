import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';

interface WeekdaySelectorProps {
    selectedWeekdays: string[]; // ['M', 'W']
    onToggleWeekday: (day: string) => void;
}

const weekdayKeys = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WeekdaySelector = ({ selectedWeekdays, onToggleWeekday }: WeekdaySelectorProps) => (
    <View className="bg-emerald-700 rounded-[30px] p-6 mx-4 shadow-lg items-center">
        <AppText className="text-white/80 font-medium mb-4 text-base">Select Weekday</AppText>
        <View className="flex-row justify-between w-full px-1">
            {weekdayKeys.map((day, index) => {
                const isSelected = selectedWeekdays.includes(day);
                return (
                    <Pressable
                        key={index}
                        onPress={() => onToggleWeekday(day)}
                        className={`w-9 h-9 rounded-full items-center justify-center ${isSelected ? 'bg-white' : 'bg-white/10'}`}
                    >
                        <AppText className={`font-bold text-sm ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                            {day}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    </View>
);