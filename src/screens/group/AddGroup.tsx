import React, { useState } from 'react';
import { View, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Iconify } from 'react-native-iconify';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from "@/src/store/themeStore";
import { systemStore } from "@/src/store/systemStore";
import { CreateGroupApi } from "@/src/api/group/group";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { UserSearchResponse } from "@/src/api/dto/user/user";

// Subcomponents & Bottom Sheet integration
import { GroupForm } from '@/src/components/user/group/GroupForm';
import { SelectedUserEntity, SelectMultiPeopleBottomSheet } from '@/src/components/user/SelectMultiPeopleBottomSheet';
import { RelationWithUserType } from "@/src/api/dto/constants";
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

export default function AddGroupScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const { defaults } = systemStore();
    const router = useRouter();

    // Shared State Core
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const [selectedUsers, setSelectedUsers] = useState<SelectedUserEntity[]>([]);
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [globalUsers, setGlobalUsers] = useState<UserSearchResponse[]>([]);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<GroupCategoryDetails | null>(null);
    const [showCategorySheet, setShowCategorySheet] = useState(false);

    const handleBack = () => {
        if (isBottomSheetVisible) {
            setIsBottomSheetVisible(false);
            return true; // Handled
        }
        if (showCategorySheet) {
            setShowCategorySheet(false);
            return true; // Handled
        }

        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
        return true;
    };

    const toggleUser = (user: SelectedUserEntity) => {
        setSelectedUsers(prev => {
            const isMatch = prev.some(u => u.id === user.id && u.user_type === user.user_type);
            if (isMatch) {
                return prev.filter(u => !(u.id === user.id && u.user_type === user.user_type));
            }
            return [...prev, user];
        });
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

    const handleCreateGroup = async () => {
        if (!title.trim()) return Alert.alert("Required", "Please provide a group title.");

        setLoading(true);

        const usersPayload = selectedUsers.map(user => ({
            id: user.id,
            type: user.user_type as RelationWithUserType
        }));
        console.log(usersPayload);

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
                        <Iconify icon="heroicons:chevron-left" size={24} color={isDark ? "#FFF" : "#000"} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        Create Group
                    </AppText>
                    <View className="w-10" />
                </View>

                {/* Main Content Layout */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <GroupForm
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            selectedUsers={selectedUsers}
                            loading={loading}
                            onOpenSelect={() => setIsBottomSheetVisible(true)}
                            onRemoveUser={toggleUser}
                            onSubmit={handleCreateGroup}
                            onCancel={handleBack}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            showCategorySheet={showCategorySheet} // 👈 UPDATED: Controlled prop injection
                            setShowCategorySheet={setShowCategorySheet}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* FIXED: Moved component down outside the KeyboardAvoidingView block hierarchy.
                  This isolates gesture systems, restoring native scrolling inside the bottom sheet.
                */}
                <SelectMultiPeopleBottomSheet
                    visible={isBottomSheetVisible}
                    initialSelectedUsers={selectedUsers}
                    onClose={() => setIsBottomSheetVisible(false)}
                    onConfirmed={handleSelectionConfirmed}
                />
            </SafeAreaView>
        </BottomSheetModalProvider>
    );
}