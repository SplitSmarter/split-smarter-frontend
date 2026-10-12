import {Modal, Platform, Pressable, View} from "react-native";
import {AppText} from "@/src/components/common/AppText";
import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

export const TabButton = ({label, isActive, onPress}: { label: string; isActive: boolean; onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className={`flex-1 py-2 px-1 rounded-full items-center justify-center ${isActive ? 'bg-accent-sky-bg' : ''}`}
    >
        <AppText
            variant="caption-xs"
            numberOfLines={1}
            className={isActive ? 'text-accent-sky font-bold' : 'text-text-primary-lighter font-medium'}
        >
            {label}
        </AppText>
    </Pressable>
);
export const InlineDatePicker = ({visible, dateValue, isDark, brandColor, onClose, onChange}: any) => {
    if (!visible) return null;
    return Platform.OS === 'ios' ? (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 bg-black/40 justify-end">
                <Pressable className="flex-1" onPress={onClose}/>
                <View className={`p-6 rounded-t-[30px] ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <View className="flex-row justify-between items-center mb-4">
                        <AppText className="font-bold text-lg">Select Date</AppText>
                        <Pressable onPress={onClose}><AppText className="font-bold"
                                                              style={{color: brandColor}}>Done</AppText></Pressable>
                    </View>
                    <DateTimePicker value={dateValue} mode="date" display="spinner" maximumDate={new Date()}
                                    onChange={onChange}/>
                </View>
            </View>
        </Modal>
    ) : (
        <DateTimePicker value={dateValue} mode="date" display="default" maximumDate={new Date()} onChange={onChange}/>
    );
};