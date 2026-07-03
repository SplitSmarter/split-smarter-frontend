import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    FlatList,
    Pressable,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AppText } from '@/src/components/common/AppText';
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { ImageInfo } from "@/src/constants/user/asset";
import ParticipantRow from "@/src/components/expense/multi_user_select/ParticipantRow";
import SuggestionsSection from "@/src/components/expense/multi_user_select/SuggestionSection";

export interface SelectedUserPayload {
    id: string;
    user_type: RelationWithUserType;
    name: string;
    avatarUrl: string | null;
}

interface SingleUserSelectProps {
    selectedUser: SelectedUserPayload | null;
    onSelectUser: (user: SelectedUserPayload) => void;
    title?: string;
}

const SingleUserSelect = ({ selectedUser, onSelectUser, title }: SingleUserSelectProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = themeStore();
    const { user: currentUser } = userStore();
    const isDark = theme === 'dark';

    const [allRelations, setAllRelations] = useState<SelectedUserPayload[]>([]);
    const [loading, setLoading] = useState(true);

    const onAddNewUser = () => {
        router.push('/(authenticated)/user/add');
    };

    // 1. Fetch relations from API registry
    useEffect(() => {
        const fetchRelations = async () => {
            try {
                setLoading(true);
                const res = await GetRelationsApi({ limit: 50 });
                if (res?.data) {
                    const mapped: SelectedUserPayload[] = res.data.map((rel: any) => {
                        const isSelf = currentUser &&
                            String(rel.with_user.id) === String(currentUser.id) &&
                            rel.with_user.user_type === RelationWithUserType.USER;

                        return {
                            id: String(rel.with_user.id),
                            name: isSelf ? "You" : rel.with_user.name,
                            avatarUrl: rel.with_user.avatar?.url || null,
                            user_type: rel.with_user.user_type
                        };
                    });
                    setAllRelations(mapped);
                }
            } catch (e) {
                console.error("Error fetching single selection registry relations:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRelations();
    }, [currentUser]);

    // 2. Filter suggestion track lists
    const filteredSuggestions = useMemo<SelectedUserPayload[]>(() => {
        const list: SelectedUserPayload[] = [];

        if (currentUser) {
            const isSelfSelected = selectedUser &&
                selectedUser.id === String(currentUser.id) &&
                selectedUser.user_type === RelationWithUserType.USER;

            if (!isSelfSelected) {
                list.push({
                    id: String(currentUser.id),
                    name: "You",
                    avatarUrl: currentUser.avatar?.url || null,
                    user_type: RelationWithUserType.USER
                });
            }
        }

        allRelations.forEach(relUser => {
            const isAlreadySelected = selectedUser &&
                selectedUser.id === relUser.id &&
                selectedUser.user_type === relUser.user_type;

            if (!isAlreadySelected) {
                list.push(relUser);
            }
        });

        return list;
    }, [allRelations, selectedUser, currentUser]);

    // 3. Adapter parsing to display selection using the generic ParticipantRow item styling
    const serializedSelectedData = useMemo(() => {
        if (!selectedUser) return [];
        return [{
            id: selectedUser.id,
            name: selectedUser.name,
            avatarUrl: selectedUser.avatarUrl,
            amount: 0, // Flat transaction mapping parameters
            isLocked: false,
            user_type: selectedUser.user_type
        }];
    }, [selectedUser]);

    const handleSelectAction = (user: SelectedUserPayload) => {
        onSelectUser(user);
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#121212" : "#F8F9FA" }}>
            <View className="flex-1">

                {/* Profile Suggestion Section Grid */}
                <SuggestionsSection
                    loading={loading}
                    allUsers={filteredSuggestions}
                    selectedUsers={serializedSelectedData as any}
                    onToggleUser={(u) => handleSelectAction({
                        id: u.id,
                        user_type: u.user_type,
                        name: u.name || '',
                        avatarUrl: u.avatarUrl || null
                    })}
                    onAddNewUser={onAddNewUser}
                />

                {/* Subtitle Header Separator */}
                <View className="px-4 pt-4 flex-row items-center justify-between">
                    <AppText variant="caption-xs" className="font-semibold tracking-wider text-text-secondary uppercase">
                        {title || t('transfer.active_selection', 'ACTIVE SELECTION')}
                    </AppText>
                    {selectedUser && (
                        <View className="flex-row items-center gap-x-1">
                            <Iconify icon="heroicons:check-circle-20-solid" size={14} color="#10B981" />
                            <AppText variant="caption-xs" className="text-emerald-500 font-medium">Ready</AppText>
                        </View>
                    )}
                </View>

                {/* Active Choice Item Container */}
                <View className="flex-1 px-4 mt-3">
                    {loading ? (
                        <View className="flex-1 items-center justify-center pt-8">
                            <ActivityIndicator size="small" color="#10B981" />
                        </View>
                    ) : selectedUser ? (
                        <FlatList
                            data={serializedSelectedData}
                            keyExtractor={item => `${item.id}-${item.user_type}`}
                            renderItem={({ item }) => (
                                <ParticipantRow
                                    item={item as any}
                                    splitMode="equal" // Passed to trigger simple checklist layouts internally
                                    totalExpense={0}
                                    isTotalLocked={true}
                                    isDark={isDark}
                                    disableSwipe={true}
                                    onToggleUser={() => {}}
                                    onToggleLock={() => {}}
                                    onAdjustShares={() => {}}
                                    onUpdateAmount={() => false}
                                />
                            )}
                        />
                    ) : (
                        <View className={`items-center justify-center p-8 rounded-2xl border border-dashed border-bg-secondary-lighter/20 ${
                            isDark ? 'bg-gray-900/30' : 'bg-gray-50/50'
                        }`}>
                            <Iconify icon="heroicons:user" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} className="opacity-60 mb-2" />
                            <AppText variant="body-small" className="text-text-secondary text-center opacity-60">
                                {t('transfer.no_recipient_selected', 'Tap a suggestion above to designate this participant field.')}
                            </AppText>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SingleUserSelect;