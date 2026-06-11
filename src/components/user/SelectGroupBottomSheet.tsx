import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Pressable,
    ActivityIndicator,
    Dimensions,
    FlatList
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { themeStore } from '@/src/store/themeStore';
import { GetGroupsApi } from '@/src/api/group/group';
import { GroupDetails } from '@/src/api/dto/user/group';

// Imported Sub-Components
import { GroupListContent } from '@/src/components/user/GroupListContent';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelectGroupBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (group: GroupDetails) => void;
    selectedId?: number;
}

export const SelectGroupBottomSheet = ({ visible, onClose, onSelect, selectedId }: SelectGroupBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const [groups, setGroups] = useState<GroupDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch collections instantly when visibility shifts to active state bounds
    useEffect(() => {
        if (visible) {
            fetchGroups();
        } else {
            setSearchQuery('');
        }
    }, [visible]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await GetGroupsApi();
            if (response.data) {
                setGroups(response.data);
            }
        } catch (error) {
            console.error("Critical error while collecting group metadata lists:", error);
        } finally {
            setLoading(false);
        }
    };

    // Performance-optimized structural compute list items mapping rules
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groups;
        return groups.filter(g =>
            g.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [groups, searchQuery]);

    const handleAddNewGroupPress = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/group/add');
        }, 200);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                {/* Backdrop Hit dismiss zone area */}
                <Pressable className="absolute inset-0" onPress={onClose} />

                <View
                    style={{ height: SCREEN_HEIGHT * 0.85 }}
                    className={`rounded-t-[40px] overflow-hidden flex-col ${isDark ? 'bg-[#121212]' : 'bg-[#F8F8F8]'}`}
                >
                    {/* Synchronized Component Header Block */}
                    <View className="flex-row items-center justify-between py-4 px-6 border-b border-gray-500/10">
                        <Pressable onPress={onClose} className="p-2 rounded-full">
                            <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary text-center">
                            Select Group
                        </AppText>
                        <View className="w-10" />
                    </View>

                    {/* Content Frame viewport layout slots */}
                    <View className="flex-1 px-4 pt-4">
                        <View className="mb-2">
                            <AppInput
                                placeholder="Search group name..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                            />
                        </View>

                        {loading ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color="#2D6A4F" />
                            </View>
                        ) : (
                            <GroupListContent
                                loading={loading}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                filteredGroups={filteredGroups}
                                selectedId={selectedId}
                                onSelect={onSelect}
                                onAddNew={handleAddNewGroupPress}
                                isDark={isDark}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

SelectGroupBottomSheet.displayName = 'SelectGroupBottomSheet';