import React from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {Weekday} from '@/src/api/dto/expense/constant';

interface WeekdaySelectorProps {
    selectedWeekdays: Weekday[];
    onToggleWeekday: (day: Weekday) => void;
}

const WEEKDAYS: {id: Weekday; label: string}[] = [
    {id: 'sunday', label: 'S'},
    {id: 'monday', label: 'M'},
    {id: 'tuesday', label: 'T'},
    {id: 'wednesday', label: 'W'},
    {id: 'thursday', label: 'T'},
    {id: 'friday', label: 'F'},
    {id: 'saturday', label: 'S'},
];

export const WeekdaySelector = ({selectedWeekdays, onToggleWeekday}: WeekdaySelectorProps) => (
    <View className="bg-bg-secondary rounded-[30px] p-6 mx-4 shadow-lg items-center">
        <AppText className="text-text-secondary/80 font-medium mb-4 text-base">Select Weekday</AppText>
        <View className="flex-row justify-between w-full px-1">
            {WEEKDAYS.map((day) => {
                const isSelected = selectedWeekdays.includes(day.id);
                return (
                    <Pressable
                        key={day.id}
                        onPress={() => onToggleWeekday(day.id)}
                        className={`w-9 h-9 rounded-full items-center justify-center ${
                            isSelected ? 'bg-white' : 'bg-white/10'
                        }`}
                    >
                        <AppText
                            className={`font-bold text-sm ${
                                isSelected ? 'text-text-primary' : 'text-text-secondary'
                            }`}
                        >
                            {day.label}
                        </AppText>
                    </Pressable>
                );
            })}
        </View>
    </View>
);
