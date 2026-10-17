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
}: {
    label: string;
    isActive: boolean;
    onPress: () => void;
}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <Pressable
            onPress={onPress}
            className="flex-1 items-center justify-center rounded-full px-1 py-2"
            style={
                isActive
                    ? {backgroundColor: colors.brand.primary}
                    : undefined
            }
        >
            <AppText
                variant="caption-xs"
                numberOfLines={1}
                className="font-bold"
                style={{
                    color: isActive ? colors.text.contrast : colors.text.lighter,
                }}
            >
                {label}
            </AppText>
        </Pressable>
    );
};

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
