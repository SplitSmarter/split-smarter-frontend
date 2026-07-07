import {Modal, Platform, Pressable, View} from "react-native";
import {AppText} from "@/src/components/common/AppText";
import React from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {Iconify} from "react-native-iconify";

export const TabButton = ({label, isActive, onPress}: { label: string; isActive: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress}
               className={`flex-1 py-2 rounded-full items-center justify-center ${isActive ? 'bg-bg-secondary' : ''}`}>
        <AppText variant="body-base"
                 className={isActive ? 'text-white font-bold' : 'text-text-primary-lighter'}>{label}</AppText>
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
export const TransactionOptionsModal = ({
                                            visible,
                                            isDark,
                                            activeColors,
                                            onClose,
                                            onSaveDraft,
                                            onSchedule,
                                            onClear
                                        }: any) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View className="flex-1 bg-black/50 justify-end">
            <Pressable className="flex-1" onPress={onClose}/>
            <View
                className={`p-6 rounded-t-[40px] pb-12 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-white'}`}>
                <View className={`w-12 h-1.5 rounded-full self-center mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}/>
                <AppText variant="h3" className={`font-bold mb-4 px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Form
                    Options</AppText>

                <Pressable onPress={onSaveDraft}
                           className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                    <Iconify icon="heroicons:document-arrow-down" size={24} color={activeColors.icon.primary}/>
                    <AppText variant="body-base"
                             className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Save
                        as Draft</AppText>
                </Pressable>

                <Pressable onPress={onSchedule}
                           className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                    <Iconify icon="heroicons:clock" size={24} color={activeColors.icon.primary}/>
                    <AppText variant="body-base"
                             className={`ml-4 font-semibold text-[16px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Schedule
                        Transaction</AppText>
                </Pressable>

                <View className={`h-[1px] my-2 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}/>

                <Pressable onPress={onClear} className="flex-row items-center p-4 rounded-xl active:scale-[0.98] mb-1">
                    <Iconify icon="heroicons:trash" size={24} color={activeColors.status.error}/>
                    <AppText variant="body-base" className="ml-4 font-semibold text-[16px]"
                             style={{color: activeColors.status.error}}>Clear Form</AppText>
                </Pressable>
            </View>
        </View>
    </Modal>
);