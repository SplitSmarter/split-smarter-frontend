import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppInput } from "@/src/components/common/AppInput";
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { EntityFallbackIcon } from "@/src/components/common/EntityFallbackIcon";
import { AppButton } from "@/src/components/common/AppButton";
import { systemStore } from "@/src/store/systemStore";
import { themeStore } from '@/src/store/themeStore';
import { userStore } from '@/src/store/userStore';
import { COLORS } from '@/src/constants/colors';
import { RelationWithUserType } from '@/src/api/dto/constants';
import { SelectGroupCategoryBottomSheet } from "@/src/components/user/SelectGroupCategoryBottomsheet";
import {SelectedUserEntity} from "@/src/components/user/SelectMultiPeopleBottomSheet";
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";

interface GroupFormProps {
    title: string;
    setTitle: (title: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    selectedUsers: SelectedUserEntity[];
    loading: boolean;
    onOpenSelect: () => void;
    onSubmit: () => void;
    onCancel: () => void;
    onRemoveUser: (user: SelectedUserEntity) => void;
    selectedCategory: GroupCategoryDetails | null;
    setSelectedCategory: (category: GroupCategoryDetails | null) => void;
    showCategorySheet: boolean;
    setShowCategorySheet: (show: boolean) => void;
}

export const GroupForm = React.memo(({
                                         title,
                                         setTitle,
                                         description,
                                         setDescription,
                                         selectedUsers,
                                         loading,
                                         onOpenSelect,
                                         onSubmit,
                                         onCancel,
                                         onRemoveUser,
                                         selectedCategory,
                                         setSelectedCategory,
                                         showCategorySheet,
                                         setShowCategorySheet
                                     }: GroupFormProps) => {
    const { defaults } = systemStore();
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const currentUser = userStore((state) => state.user);
    const insets = useSafeAreaInsets();
    const [titleError, setTitleError] = useState<string | undefined>();

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (titleError && value.trim()) {
            setTitleError(undefined);
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setTitleError('Group title is required');
            return;
        }
        setTitleError(undefined);
        onSubmit();
    };

    return (
        <View style={styles.root}>
            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Identity Display Banner */}
                <View className="relative mb-6 rounded-3xl overflow-hidden h-32 bg-bg-primary-darker">
                    <AppImageV2
                        id={defaults.defaultGroupBackgroundImage.id || 'group-create-bg'}
                        url={defaults.defaultGroupBackgroundImage.url}
                        style={{width: '100%', height: '100%'}}
                        contentFit="cover"
                    />
                    <View className="absolute inset-0 bg-black/20 flex-row items-center px-4">
                        <View className="w-16 h-16 rounded-full border-2 border-white overflow-hidden shadow-sm">
                            <AppImageV2
                                id={defaults.defaultGroupIconImage.id || 'group-create-icon'}
                                url={defaults.defaultGroupIconImage.url}
                                style={{width: '100%', height: '100%', borderRadius: 9999}}
                                contentFit="cover"
                                fallbackComponent={
                                    <EntityFallbackIcon kind="group" size={32} color={colors.icon.lighter} />
                                }
                            />
                        </View>
                        <AppText variant="h4" className="text-white ml-3 font-bold">
                            {title.trim() || 'Untitled group'}
                        </AppText>
                    </View>
                </View>

                {/* Main Form Fields */}
                <View className="gap-y-3 mb-6">
                    <AppInput
                        label="Group name"
                        required
                        placeholder="e.g. Weekend trip, Flatmates, Office lunch"
                        value={title}
                        onChangeText={handleTitleChange}
                        error={titleError}
                        autoCapitalize="sentences"
                        returnKeyType="next"
                    />
                    <AppInput
                        label="Description"
                        placeholder="Optional — what is this group for?"
                        value={description}
                        onChangeText={setDescription}
                        autoCapitalize="sentences"
                    />

                    {/* Controlled Category Field */}
                    <View>
                        <AppText className="mb-2 text-text-primary">Category</AppText>
                        <Pressable
                            onPress={() => setShowCategorySheet(true)}
                            className="flex-row items-center justify-between py-3 px-4 bg-bg-canvas border border-border-input rounded-2xl"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl overflow-hidden mr-3 bg-bg-primary-darker">
                                    <AppImageV2
                                        id={
                                            selectedCategory?.icon?.id ||
                                            defaults.defaultGroupCategory.asset.id ||
                                            'group-create-category'
                                        }
                                        url={
                                            selectedCategory?.icon?.url ||
                                            defaults.defaultGroupCategory.asset.url
                                        }
                                        style={{width: '100%', height: '100%', borderRadius: 12}}
                                        contentFit="cover"
                                        fallbackComponent={
                                            <EntityFallbackIcon kind="groupCategory" size={22} color={colors.icon.lighter} />
                                        }
                                    />
                                </View>
                                <AppText className="font-medium text-text-primary">
                                    {selectedCategory?.title || "Select Category"}
                                </AppText>
                            </View>
                            <Iconify icon="heroicons:chevron-down" size={20} color={colors.icon.lighter} />
                        </Pressable>
                    </View>
                </View>

                {/* Members Section Carousel layout */}
                <View className="mb-4">
                    <AppText variant="h4" className="mb-4 text-text-primary">Members</AppText>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.membersScrollContent}
                    >
                        <View className="flex-row items-end">
                            <Pressable
                                onPress={onOpenSelect}
                                style={styles.memberItem}
                                className="items-center justify-center"
                            >
                                <View style={styles.memberAvatarWrap}>
                                    <View
                                        style={styles.memberAvatar}
                                        className="items-center justify-center rounded-full border border-dashed border-border-input"
                                    >
                                        <Iconify icon="heroicons:user-plus" size={24} color={colors.icon.lighter} />
                                    </View>
                                </View>
                                <AppText variant="caption-xs" className="mt-1 text-text-primary">Add</AppText>
                            </Pressable>

                            {selectedUsers.map((user) => {
                                const isSelf =
                                    !!currentUser &&
                                    String(user.id) === String(currentUser.id) &&
                                    user.user_type === RelationWithUserType.USER;

                                return (
                                    <View
                                        key={`${user.id}-${user.user_type}`}
                                        style={styles.memberItem}
                                        className="items-center"
                                    >
                                        <View style={styles.memberAvatarWrap}>
                                            <View style={styles.memberAvatar} className="overflow-hidden rounded-full">
                                                <AppImageV2
                                                    id={user.avatar?.id || `group-member-${user.user_type}-${user.id}`}
                                                    url={user.avatar?.url}
                                                    style={{width: '100%', height: '100%', borderRadius: 9999}}
                                                    contentFit="cover"
                                                    fallbackComponent={
                                                        <EntityFallbackIcon kind="user" size={22} color={colors.icon.lighter} />
                                                    }
                                                />
                                            </View>
                                            {!isSelf ? (
                                                <Pressable
                                                    onPress={() => onRemoveUser(user)}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                    style={styles.memberRemoveBadge}
                                                    className="items-center justify-center rounded-full border-2 border-white bg-bg-secondary"
                                                >
                                                    <Iconify icon="heroicons:x-mark" size={12} color={colors.text.contrast} />
                                                </Pressable>
                                            ) : null}
                                        </View>
                                        <AppText
                                            variant="caption-xs"
                                            className="mt-1 text-center text-text-primary"
                                            numberOfLines={1}
                                        >
                                            {isSelf ? 'You' : user.name?.split(' ')[0] || ''}
                                        </AppText>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Sticky bottom actions */}
            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: isDark ? COLORS.dark.bg.canvas : COLORS.light.bg.canvas,
                        paddingBottom: Math.max(insets.bottom, 16),
                    },
                ]}
                className="border-t border-border-input"
            >
                <View className="gap-y-3">
                    <AppButton variant="primary" className="h-14 rounded-2xl shadow-md" onPress={handleSubmit} loading={loading}>
                        Create group
                    </AppButton>
                    <AppButton variant="secondary" className="h-14 rounded-2xl" onPress={onCancel}>
                        Cancel
                    </AppButton>
                </View>
            </View>

            <SelectGroupCategoryBottomSheet
                visible={showCategorySheet}
                selectedId={selectedCategory?.id}
                onClose={() => setShowCategorySheet(false)}
                onSelect={(category: GroupCategoryDetails) => {
                    setSelectedCategory(category);
                    setShowCategorySheet(false);
                }}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    footer: {
        paddingTop: 12,
        paddingHorizontal: 0,
    },
    membersScrollContent: {
        paddingTop: 8,
        paddingLeft: 4,
        paddingRight: 8,
        paddingBottom: 2,
    },
    memberItem: {
        width: 64,
        marginRight: 12,
    },
    memberAvatarWrap: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    memberAvatar: {
        width: 48,
        height: 48,
    },
    memberRemoveBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 22,
        height: 22,
        zIndex: 2,
        elevation: 3,
    },
});

GroupForm.displayName = "GroupForm";
