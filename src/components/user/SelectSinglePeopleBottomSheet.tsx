import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { AppImage } from "@/src/components/common/AppImage";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { SearchUsersApi } from "@/src/api/user/user";
import { UserSearchResponse } from "@/src/api/dto/user/user";

interface SelectSinglePeopleBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (userId: number, relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
}

export const SelectSinglePeopleBottomSheet = ({
                                                  visible,
                                                  selectedId,
                                                  onClose,
                                                  onSelect
                                              }: SelectSinglePeopleBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const [search, setSearch] = useState('');
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

    const snapPoints = useMemo(() => ['85%'], []);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
            fetchRelations();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    const fetchRelations = async () => {
        setLoadingRelations(true);
        const response = await GetRelationsApi({ limit: 50 });
        if (response.data) setRelations(response.data);
        setLoadingRelations(false);
    };

    useEffect(() => {
        if (!search.trim()) {
            setGlobalResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            const res = await SearchUsersApi({ q: search });
            if (res.data) setGlobalResults(res.data);
            setIsSearchingGlobal(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredRelations = useMemo(() => {
        if (!search.trim()) return relations;
        return relations.filter(r => r.with_user.name.toLowerCase().includes(search.toLowerCase()));
    }, [relations, search]);

    const handleSelectUser = (userId: number) => {
        onSelect(userId, relations, globalResults);
        bottomSheetModalRef.current?.dismiss();
    };

    const handleAddNewUser = () => {
        bottomSheetModalRef.current?.dismiss();
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
        ), []
    );

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={true}
            backgroundStyle={{ backgroundColor: isDark ? '#121212' : '#F8F8F8', borderRadius: 40 }}
            handleIndicatorStyle={{ backgroundColor: isDark ? '#333' : '#E5E5E5' }}
        >
            <BottomSheetView style={{ flex: 1 }} className="px-4">
                <View className="flex-row items-center justify-between py-2 px-2">
                    <Pressable onPress={onClose} className="p-2">
                        <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">Select Person</AppText>
                    <Pressable onPress={handleAddNewUser} className="p-2">
                        <Iconify icon="heroicons:user-plus" size={24} color={COLORS.icon_primary_darker_light} />
                    </Pressable>
                </View>

                <AppInput
                    placeholder="Search name, email, or phone..."
                    value={search}
                    onChangeText={setSearch}
                    renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                    renderRightIcon={() => isSearchingGlobal ? <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} /> : null}
                />

                <BottomSheetScrollView className="mt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {filteredRelations.map(item => (
                        <UserRowItem
                            key={`single-rel-${item.with_user.id}`}
                            user={item.with_user}
                            isSelected={selectedId === item.with_user.id}
                            onPress={() => handleSelectUser(item.with_user.id)}
                            subtext={item.with_user.user_type}
                        />
                    ))}

                    {search.trim().length > 0 && globalResults.map(user => {
                        if (relations.some(r => r.with_user.id === user.id)) return null;
                        return (
                            <UserRowItem
                                key={`single-gl-${user.id}`}
                                user={user}
                                isSelected={selectedId === user.id}
                                onPress={() => handleSelectUser(user.id)}
                                subtext="Not in your network"
                            />
                        );
                    })}
                </BottomSheetScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const UserRowItem = ({ user, isSelected, onPress, subtext }: any) => (
    <Pressable onPress={onPress} className={`flex-row items-center p-3 rounded-2xl mb-2 ${isSelected ? 'bg-bg-secondary/10 border border-bg-secondary/30' : 'bg-white dark:bg-zinc-900 border border-transparent'}`}>
        <AppImage url={user.avatar?.url} size="sm" variant="circular" />
        <View className="flex-1 ml-3">
            <AppText className="font-semibold text-text-primary">{user.name}</AppText>
            <AppText variant="caption-xs" className="text-text-secondary opacity-60">{subtext}</AppText>
        </View>
        <Iconify icon={isSelected ? "heroicons:check-circle-solid" : "heroicons:circle"} size={24} color={isSelected ? COLORS.icon_primary_darker_light : COLORS.icon_secondary_light} />
    </Pressable>
);