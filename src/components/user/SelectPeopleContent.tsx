import React, {useState, useEffect, useMemo} from 'react';
import {View, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from "@/src/components/common/AppText";
import {AppImage} from "@/src/components/common/AppImage";
import {AppInput} from "@/src/components/common/AppInput";
import {COLORS} from "@/src/constants/colors";
import {RelationDetails} from "@/src/api/dto/user/relation";
import {SearchUsersApi} from "@/src/api/user/user";
import {UserSearchResponse} from "@/src/api/dto/user/user";

interface SelectPeopleProps {
    selectedUserIds: number[];
    onToggleUser: (userId: number, userType: any) => void;
    relations: RelationDetails[]; // Passed from parent to avoid double fetching
}

export const SelectPeopleContent = ({selectedUserIds, onToggleUser, relations}: SelectPeopleProps) => {
    const [search, setSearch] = useState('');
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced Global Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (search.trim().length > 1) {
                setIsSearching(true);
                const res = await SearchUsersApi({q: search});
                if (res.data) setGlobalResults(res.data);
                setIsSearching(false);
            } else {
                setGlobalResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Local filter for "People you know"
    const filteredRelations = useMemo(() =>
            relations.filter(r => r.with_user.name.toLowerCase().includes(search.toLowerCase())),
        [relations, search]);

    return (
        <View className="flex-1">
            {/* 1. Selected Users Ribbon */}
            {selectedUserIds.length > 0 && (
                <View className="mb-4">
                    <AppText variant="body-base" className="font-bold mb-3 text-text-primary px-1">Selected</AppText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedUserIds.map(id => {
                            // Find user in either relations or global search results
                            const user = relations.find(r => r.with_user.id === id)?.with_user ||
                                globalResults.find(u => u.id === id);
                            if (!user) return null;

                            return (
                                <View key={id} className="mr-4 items-center">
                                    <View className="relative">
                                        <AppImage url={user.avatar?.url} size="md" variant="circular"/>
                                        <Pressable
                                            onPress={() => onToggleUser(id, user.user_type)}
                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full border-2 border-white"
                                        >
                                            <Iconify icon="heroicons:x-mark" size={12} color="white"/>
                                        </Pressable>
                                    </View>
                                    <AppText variant="caption-xs"
                                             className="mt-1 font-medium">{user.name.split(' ')[0]}</AppText>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* 2. Search Input */}
            <AppInput
                placeholder="Search name, email, or phone..."
                value={search}
                onChangeText={setSearch}
                renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c}/>}
                renderRightIcon={() => isSearching ?
                    <ActivityIndicator size="small" color={COLORS.icon_secondary_darker_light}/> : null}
            />

            <BottomSheetScrollView contentContainerStyle={{paddingBottom: 60}} className="mt-4">
                {/* 3. Section: People you know (Relations) */}
                {filteredRelations.length > 0 && (
                    <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 mb-4">
                        <AppText className="font-bold mb-3 text-text-primary">People you know</AppText>
                        {filteredRelations.map(item => {
                            const isSelected = selectedUserIds.includes(item.with_user.id);
                            return (
                                <Pressable
                                    key={`rel-${item.id}`}
                                    onPress={() => onToggleUser(item.with_user.id, item.with_user.user_type)}
                                    className={`flex-row items-center p-3 rounded-2xl mb-1 ${isSelected ? 'bg-bg-secondary/10' : ''}`}
                                >
                                    <AppImage url={item.with_user.avatar?.url} size="sm" variant="circular"/>
                                    <View className="flex-1 ml-3">
                                        <AppText
                                            className="font-semibold text-text-primary">{item.with_user.name}</AppText>
                                        <AppText variant="caption-xs"
                                                 className="opacity-60">{item.with_user.user_type}</AppText>
                                    </View>
                                    {isSelected ?
                                        <Iconify icon="heroicons:check-circle-solid" size={24}
                                                 color={COLORS.icon_secondary_lighter_light}/> :
                                        <Iconify icon="heroicons:circle" size={24} color="#CCC"/>
                                    }
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {/* 4. Section: Global Search Results */}
                {globalResults.length > 0 && (
                    <View className="bg-white dark:bg-zinc-900 rounded-[32px] p-4">
                        <AppText className="font-bold mb-3 text-text-primary">Global Search</AppText>
                        {globalResults.map(user => {
                            const isSelected = selectedUserIds.includes(user.id);
                            // Avoid showing someone already in "People you know"
                            if (relations.some(r => r.with_user.id === user.id)) return null;

                            return (
                                <Pressable
                                    key={`global-${user.id}`}
                                    onPress={() => onToggleUser(user.id, user.user_type)}
                                    className={`flex-row items-center p-3 rounded-2xl mb-1 ${isSelected ? 'bg-bg-secondary/10' : ''}`}
                                >
                                    <AppImage url={user.avatar?.url} size="sm" variant="circular"/>
                                    <View className="flex-1 ml-3">
                                        <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                                        <AppText variant="caption-xs" className="opacity-40">Not in your
                                            network</AppText>
                                    </View>
                                    {isSelected ?
                                        <Iconify icon="heroicons:check-circle-solid" size={24}
                                                 color={COLORS.icon_secondary_lighter_light}/> :
                                        <Iconify icon="heroicons:circle" size={24} color="#CCC"/>
                                    }
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </BottomSheetScrollView>
        </View>
    );
};