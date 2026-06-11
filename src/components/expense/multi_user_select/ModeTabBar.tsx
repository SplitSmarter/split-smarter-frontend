import React, { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Iconify } from "react-native-iconify";
import { SplitMode } from "@/src/components/expense/MultiUserSelect";

interface ModeTabBarProps {
    splitMode: SplitMode;
    isDark: boolean;
    onChangeMode: (mode: SplitMode) => void;
}

const ModeTabBar = memo(({ splitMode, isDark, onChangeMode }: ModeTabBarProps) => {
    const tabs: { mode: SplitMode }[] = [
        { mode: 'equal' },
        { mode: 'amount' },
        { mode: 'percentage' },
        { mode: 'shares' },
    ];

    return (
        <View
            className={`flex-row border-b justify-around items-center h-14 ${
                isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
            }`}
        >
            {tabs.map(tab => {
                const isActive = splitMode === tab.mode;
                const activeColor = isActive ? '#10B981' : '#9CA3AF';

                return (
                    <Pressable
                        key={tab.mode}
                        onPress={() => onChangeMode(tab.mode)}
                        className="flex-1 items-center justify-center h-full relative"
                    >
                        {tab.mode === 'equal' && (
                            <Iconify icon="heroicons:equals" size={22} color={activeColor} />
                        )}
                        {tab.mode === 'amount' && (
                            <Iconify icon="heroicons:currency-rupee" size={24} color={activeColor} />
                        )}
                        {tab.mode === 'percentage' && (
                            <Iconify icon="heroicons:variable" size={22} color={activeColor} />
                        )}
                        {tab.mode === 'shares' && (
                            <Iconify icon="heroicons:chart-pie" size={24} color={activeColor} />
                        )}

                        {isActive && (
                            <View className="absolute bottom-0 left-4 right-4 h-[3px] bg-emerald-500 rounded-t-full" />
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
});

export default ModeTabBar;

ModeTabBar.displayName = 'ModeTabBar';