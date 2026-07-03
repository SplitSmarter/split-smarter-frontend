import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { FilterTab } from '../ExpenseChatGroupListScreen';

interface FilterTabsProps {
    activeTab: FilterTab;
    onTabSelect: (tab: FilterTab) => void;
}

const TABS: FilterTab[] = ['All', 'Chat', 'Groups', 'Expenses'];

export const FilterTabs = ({ activeTab, onTabSelect }: FilterTabsProps) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <Pressable
                        key={tab}
                        onPress={() => onTabSelect(tab)}
                        className={`px-8 py-2 rounded-full mr-3 ${
                            isActive ? 'bg-[#409167]' : 'bg-transparent'
                        } border border-white/20`}
                    >
                        <AppText className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>
                            {tab}
                        </AppText>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
};