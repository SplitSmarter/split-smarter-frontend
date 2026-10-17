import React, { useState } from 'react';
import { View, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { COLORS } from '@/src/constants/colors';
import { systemStore } from "@/src/store/systemStore";
import { CreateGroupApi } from "@/src/api/group/group";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { UserSearchResponse } from "@/src/api/dto/user/user";

// Subcomponents & Bottom Sheet integration
import { GroupForm } from './components/GroupForm';
import { SelectedUserEntity, SelectMultiPeopleBottomSheet } from '@/src/components/user/SelectMultiPeopleBottomSheet';
import { RelationWithUserType } from "@/src/api/dto/constants";
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

const MIN_GROUP_MEMBERS = 2;
const GROUP_MEMBER_USER_TYPES = [RelationWithUserType.USER];

export default function AddGroupScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const currentUser = userStore((state) => state.user);
    const { defaults } = systemStore();
    const router = useRouter();

    // Shared State Core
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [selectedUsers, setSelectedUsers] = useState<SelectedUserEntity[]>([]);
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalUsers, setGlobalUsers] = useState<UserSearchResponse[]>([]);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<GroupCategoryDetails | null>(null);
    const [showCategorySheet, setShowCategorySheet] = useState(false);

    const handleBack = () => {
        if (isBottomSheetVisible) {
            if (selectedUsers.length < MIN_GROUP_MEMBERS) {
                Alert.alert(
                    'Select people',
                    `Select at least ${MIN_GROUP_MEMBERS} people to continue.`,
                );
                return true;
            }
            setIsBottomSheetVisible(false);
            return true;
        }
        if (showCategorySheet) {
            setShowCategorySheet(false);
            return true;
        }

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
        return true;
    };

    const handleRemoveUser = (user: SelectedUserEntity) => {
        const isSelf =
            !!currentUser &&
            String(user.id) === String(currentUser.id) &&
            user.user_type === RelationWithUserType.USER;

        // You always stay in the group — reopen picker instead of removing self.
        if (isSelf) {
            setIsBottomSheetVisible(true);
            return;
        }

        // At the minimum size, removal would break the rule — reopen picker to adjust.
        if (selectedUsers.length <= MIN_GROUP_MEMBERS) {
            setIsBottomSheetVisible(true);
            return;
        }

        setSelectedUsers((prev) =>
            prev.filter((u) => !(u.id === user.id && u.user_type === user.user_type)),
        );
    };

    const handleSelectionConfirmed = (
        confirmedUsers: SelectedUserEntity[],
        allRelations: RelationDetails[],
        searchedUsers: UserSearchResponse[]
    ) => {
        setSelectedUsers(confirmedUsers);
        setRelations(allRelations);
        setGlobalUsers(searchedUsers);
        setIsBottomSheetVisible(false);
    };

    const handlePeopleSheetClose = () => {
        // Sheet already enforces minSelectionToClose before calling onClose.
        setIsBottomSheetVisible(false);
    };

    const handleCreateGroup = async () => {
        if (!title.trim()) {
            return Alert.alert("Group title required", "Enter a name for your group before saving.");
        }
        if (selectedUsers.length < MIN_GROUP_MEMBERS) {
            setIsBottomSheetVisible(true);
            return Alert.alert(
                "Required",
                `Select at least ${MIN_GROUP_MEMBERS} people for the group.`,
            );
        }

        setLoading(true);

        // Creator is already a group member server-side — never send self in users.
        const usersPayload = selectedUsers
            .filter((user) => {
                if (!currentUser) return true;
                return !(
                    String(user.id) === String(currentUser.id) &&
                    user.user_type === RelationWithUserType.USER
                );
            })
            .map((user) => ({
                id: user.id,
                type: user.user_type as RelationWithUserType,
            }));

        try {
            const response = await CreateGroupApi({
                title: title.trim(),
                description: description.trim(),
                icon_asset_id: defaults.defaultGroupIconImage.id,
                background_asset_id: defaults.defaultGroupBackgroundImage.id,
                category_id: selectedCategory?.id || defaults.defaultGroupCategory.id,
                users: usersPayload
            });

            if (response.data) {
                router.navigate({
                    pathname: '/(authenticated)/expense/add',
                    params: { newlyCreatedGroup: JSON.stringify(response.data) }
                });
            } else {
                Alert.alert("Error", response.message || "Could not create group.");
            }
        } catch (error) {
            console.error("Critical error while creating group:", error);
            Alert.alert("Error", "An unexpected failure occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BottomSheetModalProvider>
            <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
                {/* Navigation Header */}
                <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
                    <Pressable onPress={handleBack} className="p-2 rounded-full" disabled={loading}>
                        <Iconify icon="heroicons:chevron-left" size={24} color={colors.icon.primary} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        Create Group
                    </AppText>
                    <View className="w-10" />
                </View>

                {/* Main Content Layout — form scrolls; Create/Cancel stay pinned in GroupForm */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 px-4"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                    <GroupForm
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        selectedUsers={selectedUsers}
                        loading={loading}
                        onOpenSelect={() => setIsBottomSheetVisible(true)}
                        onRemoveUser={handleRemoveUser}
                        onSubmit={handleCreateGroup}
                        onCancel={handleBack}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        showCategorySheet={showCategorySheet}
                        setShowCategorySheet={setShowCategorySheet}
                    />
                </KeyboardAvoidingView>

                <SelectMultiPeopleBottomSheet
                    visible={isBottomSheetVisible}
                    initialSelectedUsers={selectedUsers}
                    allowedUserTypes={GROUP_MEMBER_USER_TYPES}
                    minSelectionToClose={MIN_GROUP_MEMBERS}
                    onClose={handlePeopleSheetClose}
                    onConfirmed={handleSelectionConfirmed}
                />
            </SafeAreaView>
        </BottomSheetModalProvider>
    );
}
