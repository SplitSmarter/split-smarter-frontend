import React from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {Weekday} from '@/src/api/dto/expense/constant';
import {PLATINUM_HEADER} from '@/src/constants/colors';

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
    <View
        className="mx-4 items-center rounded-[30px] p-6 shadow-lg"
        style={{backgroundColor: PLATINUM_HEADER.dark}}
    >
        <AppText className="mb-4 text-base font-medium text-white/80">Select Weekday</AppText>
        <View className="w-full flex-row justify-between px-1">
            {WEEKDAYS.map((day) => {
                const isSelected = selectedWeekdays.includes(day.id);
                return (
                    <Pressable
                        key={day.id}
                        onPress={() => onToggleWeekday(day.id)}
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                            isSelected ? 'bg-white' : 'bg-white/10'
                        }`}
                    >
                        <AppText
                            className={`text-sm font-bold ${
                                isSelected ? 'text-slate-900' : 'text-white/80'
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
