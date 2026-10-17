import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

function successBorderColor(hex: string, alpha: number) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PeersWellnessMonitorProps {
    score?: string;
    onPress?: () => void;
}

export const PeersWellnessMonitor: React.FC<PeersWellnessMonitorProps> = ({
    score = '8.5/10',
    onPress,
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="mb-6 px-5">
            <Pressable
                onPress={onPress}
                className="flex-row items-center justify-between rounded-2xl border p-4 active:opacity-80"
                style={{
                    backgroundColor: colors.bg.lighter,
                    borderColor: colors.status.border,
                    shadowColor: COLORS.light.brand.primary,
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 12,
                    shadowOffset: {width: 0, height: 4},
                    elevation: 3,
                }}
            >
                <View className="flex-row items-center gap-2">
                    <Iconify icon="heroicons:star" size={18} color={colors.status.warning} />
                    <AppText
                        variant="body-small"
                        className="font-semibold"
                        style={{color: colors.text.primary}}
                    >
                        Peers Wellness Monitor
                    </AppText>
                </View>

                <View
                    className="rounded-full border px-3 py-1"
                    style={{
                        backgroundColor: colors.brand.lighter,
                        borderColor: successBorderColor(colors.status.success, isDark ? 0.35 : 0.3),
                    }}
                >
                    <AppText
                        variant="caption-xs"
                        className="font-extrabold"
                        style={{color: colors.status.success}}
                    >
                        Group Health: {score}
                    </AppText>
                </View>
            </Pressable>
        </View>
    );
};
