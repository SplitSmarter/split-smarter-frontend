import {Modal, Platform, Pressable, View} from "react-native";
import {AppText} from "@/src/components/common/AppText";
import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {themeStore} from "@/src/store/themeStore";
import {COLORS} from "@/src/constants/colors";

export const TabButton = ({
    label,
    isActive,
    onPress,
    chrome = 'canvas',
}: {
    label: string;
    isActive: boolean;
    onPress: () => void;
    /** `platinum` = glass pill on metallic header; `canvas` = elevated chip on body. */
    chrome?: 'platinum' | 'canvas';
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const onPlatinum = chrome === 'platinum';

    const activeBg = onPlatinum ? '#FFFFFF' : colors.brand.primary;
    const activeText = onPlatinum ? PLATINUM_TAB_ACTIVE_TEXT : colors.text.contrast;
    const inactiveText = onPlatinum ? 'rgba(255,255,255,0.72)' : colors.text.lighter;

    return (
        <Pressable
            onPress={onPress}
            className="flex-1 items-center justify-center rounded-full px-1 py-2"
            style={isActive ? {backgroundColor: activeBg} : undefined}
        >
            <AppText
                variant="caption-xs"
                numberOfLines={1}
                className="font-bold"
                style={{color: isActive ? activeText : inactiveText}}
            >
                {label}
            </AppText>
        </Pressable>
    );
};

/** Slate text on white active tab sitting on platinum chrome. */
const PLATINUM_TAB_ACTIVE_TEXT = '#0F172A';

export const InlineDatePicker = ({visible, dateValue, isDark, brandColor, onClose, onChange}: any) => {
    if (!visible) return null;
    return Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 bg-black/40 justify-end">
                <Pressable className="flex-1" onPress={onClose}/>
                <View
                    className="rounded-t-[30px] p-6"
                    style={{
                        backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay,
                    }}
                >
                    <View className="mb-4 flex-row items-center justify-between">
                        <AppText
                            className="text-lg font-bold"
                            style={{color: isDark ? COLORS.dark.text.primary : COLORS.light.text.primary}}
                        >
                            Select Date
                        </AppText>
                        <Pressable onPress={onClose}>
                            <AppText className="font-bold" style={{color: brandColor}}>
                                Done
                            </AppText>
                        </Pressable>
                    </View>
                    <DateTimePicker
                        value={dateValue}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        onChange={onChange}
                    />
                </View>
            </View>
        </Modal>
    ) : (
        <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChange}
        />
    );
};
