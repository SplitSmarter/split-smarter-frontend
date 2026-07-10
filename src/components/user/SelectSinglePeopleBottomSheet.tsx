import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    ActivityIndicator,
    Pressable,
    StyleSheet
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetTextInput,
    BottomSheetView,
    BottomSheetFlatList
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { useRouter } from 'expo-router';
import { AppText } from "@/src/components/common/AppText";
import { AppImage } from "@/src/components/common/AppImage";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from "@/src/constants/colors";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { SearchUsersApi } from "@/src/api/user/user";
import { UserSearchResponse } from "@/src/api/dto/user/user";
import { RelationWithUserType } from "@/src/api/dto/constants";

export interface HiddenUserTarget {
    id: number;
    user_type: RelationWithUserType;
}

interface SelectSinglePeopleBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    selectedType?: RelationWithUserType;
    hideUsers?: HiddenUserTarget[];
    onClose: () => void;
    onSelect: (userId: number, userType: RelationWithUserType, relations: RelationDetails[], globalUsers: UserSearchResponse[]) => void;
}

export const SelectSinglePeopleBottomSheet = ({
                                                  visible,
                                                  selectedId,
                                                  selectedType,
                                                  hideUsers = [],
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
    const [isSheetReady, setIsSheetReady] = useState(false);

    useEffect(() => {
        if (visible) {
            bottomSheetModalRef.current?.present();
            setIsSheetReady(true);
            fetchRelations();
        } else {
            bottomSheetModalRef.current?.dismiss();
            setSearch('');
            setRelations([]);
            setGlobalResults([]);
            setIsSheetReady(false);
        }
    }, [visible]);

    const fetchRelations = async () => {
        setLoadingRelations(true);
        try {
            const response = await GetRelationsApi({ limit: 50 });
            if (response.data) setRelations(response.data);
        } catch (error) {
            console.error("Error fetching local relations:", error);
        } finally {
            setLoadingRelations(false);
        }
    };

    useEffect(() => {
        if (!search.trim()) {
            setGlobalResults([]);
            setIsSearchingGlobal(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const res = await SearchUsersApi({ q: search });
                if (res.data) setGlobalResults(res.data);
            } catch (error) {
                console.error("Global search error:", error);
            } finally {
                setIsSearchingGlobal(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredRelations = useMemo(() => {
        if (!search.trim()) return relations;
        const lowercaseSearch = search.toLowerCase();
        return relations.filter(r => r.with_user.name.toLowerCase().includes(lowercaseSearch));
    }, [relations, search]);

    const handleSelectUser = useCallback((userId: number, userType: RelationWithUserType) => {
        onSelect(userId, userType, relations, globalResults);
        onClose();
    }, [onSelect, relations, globalResults, onClose]);

    const handleAddNewUser = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    // Create an O(1) Lookup Map to eliminate repeated nested array traversal loops
    const hiddenUsersKeys = useMemo(() => {
        return new Set(hideUsers.map(hu => `${hu.user_type}-${hu.id}`));
    }, [hideUsers]);

    const combinedListData = useMemo(() => {
        if (!isSheetReady) return [];

        const list: Array<{ type: 'rel' | 'gl'; key: string; data: any }> = [];

        filteredRelations.forEach(item => {
            const compositeKey = `${item.with_user.user_type}-${item.with_user.id}`;
            if (!hiddenUsersKeys.has(compositeKey)) {
                list.push({
                    type: 'rel',
                    key: `rel-${compositeKey}`,
                    data: item.with_user
                });
            }
        });

        if (search.trim().length > 0) {
            globalResults.forEach(user => {
                const globalUserType = RelationWithUserType.USER;
                const compositeKey = `${globalUserType}-${user.id}`;

                const matchesLocal = relations.some(
                    r => r.with_user.id === user.id && r.with_user.user_type === globalUserType
                );

                if (!hiddenUsersKeys.has(compositeKey) && !matchesLocal) {
                    list.push({
                        type: 'gl',
                        key: `gl-${compositeKey}`,
                        data: { ...user, user_type: globalUserType }
                    });
                }
            });
        }
        return list;
    }, [isSheetReady, filteredRelations, globalResults, search, relations, hiddenUsersKeys]);

    const snapPoints = useMemo(() => ['85%'], []);

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        []
    );

    const renderItem = useCallback(({ item }: any) => {
        const user = item.data;
        const isSelected = selectedId === user.id && selectedType === user.user_type;
        const subtext = item.type === 'rel' ? user.user_type : "Not in your network";

        return (
            <UserRowItem
                user={user}
                isSelected={isSelected}
                subtext={subtext}
                onPress={handleSelectUser}
            />
        );
    }, [selectedId, selectedType, handleSelectUser]);

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{
                backgroundColor: isDark ? '#121212' : '#F8F8F8',
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? '#3F3F46' : '#D4D4D8',
                width: 48,
                height: 6,
            }}
        >
            <BottomSheetView className="flex-1 px-4">
                {/* Custom Header */}
                <View className="flex-row items-center justify-between pb-4 border-b border-gray-500/10">
                    <Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
                        <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select Person
                    </AppText>
                    <Pressable onPress={handleAddNewUser} className="p-2 rounded-full active:opacity-60">
                        <Iconify icon="heroicons:user-plus" size={24} color={!isDark ? COLORS.light.icon.darker : COLORS.light.text.contrast} />
                    </Pressable>
                </View>

                {/* Input with balanced 600ms debounce system */}
                <View className="my-4 flex-row items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12">
                    <Iconify icon="heroicons:magnifying-glass" size={20} color={isDark ? '#71717A' : '#A1A1AA'} />
                    <BottomSheetTextInput
                        style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
                        placeholder="Search name, email, or phone..."
                        placeholderTextColor={isDark ? '#71717A' : '#A1A1AA'}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {isSearchingGlobal && (
                        <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} />
                    )}
                </View>

                {loadingRelations && combinedListData.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#2D6A4F" />
                    </View>
                ) : (
                    <BottomSheetFlatList
                        data={combinedListData}
                        keyExtractor={(item) => item.key}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={renderItem}
                    />
                )}
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const UserRowItem = React.memo(({ user, isSelected, onPress, subtext }: any) => {
    return (
        <Pressable
            onPress={() => onPress(user.id, user.user_type)}
            className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                isSelected
                    ? 'bg-bg-secondary/10 border border-bg-secondary/30'
                    : 'bg-white dark:bg-zinc-900 border border-transparent'
            }`}
        >
            <AppImage url={user.avatar?.url} size="sm" variant="circular" />
            <View className="flex-1 ml-3">
                <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                <AppText variant="caption-xs" className="text-text-secondary opacity-60">{subtext}</AppText>
            </View>
            {isSelected ? (
                <Iconify icon="heroicons:check-circle-solid" size={24} color={COLORS.icon_primary_darker_light} />
            ) : (
                <Iconify icon="heroicons:check-circle" size={24} color={COLORS.icon_secondary_light} />
            )}
        </Pressable>
    );
}, (prevProps, nextProps) => {
    return prevProps.isSelected === nextProps.isSelected &&
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.name === nextProps.user.name &&
        prevProps.user.avatar?.url === nextProps.user.avatar?.url &&
        prevProps.subtext === nextProps.subtext;
});

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 12,
        height: '100%'
    }
});

UserRowItem.displayName = 'UserRowItem';
SelectSinglePeopleBottomSheet.displayName = 'SelectSinglePeopleBottomSheet';