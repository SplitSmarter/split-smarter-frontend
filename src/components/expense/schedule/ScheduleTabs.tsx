import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import {SchedulingTab} from "@/src/constants/expense/schedule";

interface ScheduleTabsProps {
    activeTab: SchedulingTab;
    onTabChange: (tab: SchedulingTab) => void;
}

export const ScheduleTabs = ({ activeTab, onTabChange }: ScheduleTabsProps) => (
    <View className="flex-row bg-bg-primary-darker p-1 rounded-full shadow-inner mb-6 mx-2">
        <Pressable
            onPress={() => onTabChange('one_time')}
            className={`flex-1 py-3 rounded-full items-center justify-center ${activeTab === 'one_time' ? 'bg-bg-primary-lighter shadow-sm' : ''}`}
        >
            <AppText variant="body-base" className={`font-bold ${activeTab === 'one_time' ? 'text-text-primary' : 'text-text-primary-lighter'}`}>
                One Time
            </AppText>
        </Pressable>
        <Pressable
            onPress={() => onTabChange('recurring')}
            className={`flex-1 py-3 rounded-full items-center justify-center ${activeTab === 'recurring' ? 'bg-bg-primary-lighter shadow-sm' : ''}`}
        >
            <AppText variant="body-base" className={`font-bold ${activeTab === 'recurring' ? 'text-text-primary' : 'text-text-primary-lighter'}`}>
                Recurring
            </AppText>
        </Pressable>
    </View>
);