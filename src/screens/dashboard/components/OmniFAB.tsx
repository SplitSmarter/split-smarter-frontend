import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

export const OmniFAB: React.FC = () => {
    const router = useRouter();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="absolute bottom-24 right-6 z-50 items-end">
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add expense"
                onPress={() => router.push('/expense/add')}
                className="h-14 w-14 items-center justify-center rounded-full shadow-2xl active:opacity-90"
                style={{
                    backgroundColor: colors.brand.primary,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(15, 23, 42, 0.15)' : 'rgba(255, 255, 255, 0.35)',
                }}
            >
                <Iconify icon="heroicons:plus" size={26} color={colors.text.contrast} />
            </Pressable>
        </View>
    );
};
