import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { COLORS } from '@/src/constants/colors';
import { View, Pressable, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Iconify } from 'react-native-iconify';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { EntityFallbackIcon } from "@/src/components/common/EntityFallbackIcon";
import { themeStore } from '@/src/store/themeStore';
import { GroupMemberDetails } from "@/src/api/dto/user/group";

interface GroupMemberDetailsBottomSheetProps {
    visible: boolean;
    member: GroupMemberDetails | null;
    onClose: () => void;
    onNavigateToProfile: (memberId: number, userType: string) => void;
    onRoleChanged?: () => void;
    onMemberRemoved?: () => void;
}

export const GroupMemberDetailsBottomSheet = ({
                                                  visible,
                                                  member,
                                                  onClose,
                                                  onNavigateToProfile,
                                                  onRoleChanged,
                                                  onMemberRemoved
                                              }: GroupMemberDetailsBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Modal Visibility States
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);

    // API Loading States
    const [isUpdatingRole, setIsUpdatingRole] = useState(false);
    const [isRemovingUser, setIsRemovingUser] = useState(false);

    useEffect(() => {
        if (visible && member) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, member]);

    const snapPoints = useMemo(() => ['65%'], []);

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

    if (!member) return null;

    const formattedJoinDate = new Date(member.joined_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Dummy Balance Verification Check (Modify matching actual balance parameters in your payload)
    // Assuming a member can only be removed if their pending nets are 0
    const isUserFullySettled = member.contribution_inr !== undefined;

    const handleChangeRoleSubmit = async (newRole: string) => {
        try {
            setIsUpdatingRole(true);
            // Replace with your real microservices update role API call
            // await UpdateMemberRoleApi(member.id, newRole);
            Alert.alert("Success", `Role changed to ${newRole} successfully.`);
            setIsRoleModalVisible(false);
            if (onRoleChanged) onRoleChanged();
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to update member role.");
        } finally {
            setIsUpdatingRole(false);
        }
    };

    const handleRemoveUserSubmit = async () => {
        try {
            setIsRemovingUser(true);
            // Replace with your real microservices remove user API call
            // await RemoveMemberFromGroupApi(member.id);
            Alert.alert("Success", "Member has been safely removed from the group.");
            setIsRemoveModalVisible(false);
            if (onMemberRemoved) onMemberRemoved();
            onClose();
        } catch (error) {
            Alert.alert("Error", "Failed to remove user from group.");
        } finally {
            setIsRemovingUser(false);
        }
    };

    return (
        <>
            <BottomSheetModal
                ref={bottomSheetModalRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                onDismiss={onClose}
                backdropComponent={renderBackdrop}
                backgroundStyle={{
                    backgroundColor: colors.bg.overlay,
                    borderRadius: 40,
                }}
                handleIndicatorStyle={{
                    backgroundColor: colors.icon.lighter,
                    width: 48,
                    height: 6,
                }}
            >
                <BottomSheetView className="flex-1 px-6">
                    {/* Custom Header Layout */}
                    <View className="flex-row items-center justify-between pb-4 border-b border-border-input">
                        <Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
                            <Iconify icon="heroicons:x-mark" size={24} color={colors.icon.primary} />
                        </Pressable>
                        <AppText variant="h4" className="font-bold text-text-primary text-center">
                            Member Options
                        </AppText>
                        <View className="w-10" />
                    </View>

                    {/* Main Hero Summary Card */}
                    <View className="items-center my-5">
                        <View
                            className="w-20 h-20 rounded-full overflow-hidden items-center justify-center mb-3 border-2 border-border-input"
                            style={{ backgroundColor: colors.bg.darker }}
                        >
                            <AppImageV2
                                id={`sheet_member_${member.id}`}
                                url={member.avatar?.url}
                                style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                contentFit="cover"
                                fallbackComponent={
                                    <EntityFallbackIcon kind="user" size={36} color={colors.icon.lighter} />
                                }
                            />
                        </View>
                        <AppText className="text-2xl font-extrabold text-text-primary tracking-tight text-center">
                            {member.name}
                        </AppText>
                        <View className="mt-1.5 px-3 py-0.5 rounded-full bg-accent-sky-bg border border-accent-sky/30">
                            <AppText className="text-xs font-semibold capitalize text-accent-sky">
                                {member.role?.toLowerCase() || 'member'}
                            </AppText>
                        </View>
                    </View>

                    {/* THREE SQUARED COMPACT ACTIONS GRID ROW */}
                    <View className="flex-row justify-between mb-5 w-full">
                        {/* 1. PROFILE DETAILS NAVIGATOR */}
                        <Pressable
                            onPress={() => {
                                onClose();
                                onNavigateToProfile(member.id, member.user_type);
                            }}
                            className="flex-1 items-center justify-center py-4 px-2 mx-1 rounded-2xl border border-border-input active:opacity-60"
                            style={{ backgroundColor: colors.bg.lighter }}
                        >
                            <Iconify icon="heroicons:user-circle" size={26} color={colors.icon.primary} />
                            <AppText className="text-xs font-bold text-text-primary mt-2 text-center">Profile</AppText>
                        </Pressable>

                        {/* 2. CHANGE ROLE TRIGGER */}
                        <Pressable
                            onPress={() => setIsRoleModalVisible(true)}
                            className="flex-1 items-center justify-center py-4 px-2 mx-1 rounded-2xl border border-border-input active:opacity-60"
                            style={{ backgroundColor: colors.bg.lighter }}
                        >
                            <Iconify icon="heroicons:shield-check" size={26} color={colors.icon.primary} />
                            <AppText className="text-xs font-bold text-text-primary mt-2 text-center">Role</AppText>
                        </Pressable>

                        {/* 3. REMOVE MEMBERSHIP ENGINE */}
                        <Pressable
                            onPress={() => setIsRemoveModalVisible(true)}
                            className="flex-1 items-center justify-center py-4 px-2 mx-1 rounded-2xl border border-border-input active:opacity-60"
                            style={{ backgroundColor: colors.bg.lighter }}
                        >
                            <Iconify icon="heroicons:user-minus" size={26} color={colors.status.error} />
                            <AppText className="text-xs font-bold mt-2 text-center" style={{ color: colors.status.error }}>
                                Remove
                            </AppText>
                        </Pressable>
                    </View>

                    {/* Detailed Metrics Substructure */}
                    <View
                        className="border border-border-input rounded-3xl p-4 space-y-4"
                        style={{ backgroundColor: colors.bg.lighter }}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <Iconify icon="heroicons:calendar" size={20} color={colors.icon.lighter} />
                                <AppText className="ml-2.5 font-medium text-text-primary-lighter">Joined Group</AppText>
                            </View>
                            <AppText className="font-medium text-text-primary-lighter text-sm">
                                {formattedJoinDate}
                            </AppText>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>

            {/* MODAL 1: CHANGE ROLE ROUTINE */}
            <Modal
                visible={isRoleModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsRoleModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-background w-full rounded-3xl p-6 border border-border-input">
                        <AppText variant="h3" className="font-black text-foreground mb-2 text-xl">
                            Change Group Role
                        </AppText>
                        <AppText className="text-text-primary-lighter text-sm mb-6">
                            Select a group responsibility level for {member.name}.
                        </AppText>

                        <Pressable
                            onPress={() => handleChangeRoleSubmit("ADMIN")}
                            className="flex-row items-center p-4 mb-3 rounded-xl bg-bg-primary border border-bg-primary-darker active:opacity-70"
                        >
                            <Iconify icon="heroicons:key" size={20} color={colors.icon.primary} />
                            <View className="ml-3">
                                <AppText className="font-bold text-foreground">Group Admin</AppText>
                                <AppText className="text-xs text-text-primary-lighter">Can modify parameters and add members</AppText>
                            </View>
                        </Pressable>

                        <Pressable
                            onPress={() => handleChangeRoleSubmit("MEMBER")}
                            className="flex-row items-center p-4 mb-6 rounded-xl bg-bg-primary border border-bg-primary-darker active:opacity-70"
                        >
                            <Iconify icon="heroicons:user" size={20} color={colors.icon.primary} />
                            <View className="ml-3">
                                <AppText className="font-bold text-foreground">Standard Member</AppText>
                                <AppText className="text-xs text-text-primary-lighter">Can read logs and log general splitting operations</AppText>
                            </View>
                        </Pressable>

                        <Pressable
                            onPress={() => setIsRoleModalVisible(false)}
                            className="w-full py-3 items-center justify-center rounded-xl"
                            style={{ backgroundColor: colors.bg.darker }}
                        >
                            <AppText className="font-bold text-foreground">Cancel</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* MODAL 2: SAFE REMOVE USER ROUTINE */}
            <Modal
                visible={isRemoveModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsRemoveModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <View className="bg-background w-full rounded-3xl p-6 border border-border-input">
                        <View className="items-center mb-4">
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                style={{ backgroundColor: `${colors.status.error}22` }}
                            >
                                <Iconify icon="heroicons:exclamation-triangle" size={28} color={colors.status.error} />
                            </View>
                            <AppText variant="h3" className="font-black text-foreground text-center text-xl">
                                Remove Group Member
                            </AppText>
                        </View>

                        {isUserFullySettled ? (
                            <>
                                <AppText className="text-center text-text-primary-lighter text-sm mb-6">
                                    {member.name} is fully settled up ($0 outstanding). Are you sure you want to completely evict them from the ledger?
                                </AppText>
                                <View className="flex-row space-x-3">
                                    <Pressable
                                        onPress={() => setIsRemoveModalVisible(false)}
                                        className="flex-1 py-3 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: colors.bg.darker }}
                                    >
                                        <AppText className="font-bold text-foreground">Cancel</AppText>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleRemoveUserSubmit}
                                        disabled={isRemovingUser}
                                        className="flex-1 py-3 items-center justify-center rounded-xl active:opacity-80"
                                        style={{ backgroundColor: colors.status.error }}
                                    >
                                        {isRemovingUser ? (
                                            <ActivityIndicator size="small" color={colors.text.contrast} />
                                        ) : (
                                            <AppText className="font-bold" style={{ color: colors.text.contrast }}>
                                                Confirm Remove
                                            </AppText>
                                        )}
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <>
                                <View
                                    className="p-4 rounded-xl border mb-6"
                                    style={{
                                        backgroundColor: `${colors.status.error}18`,
                                        borderColor: `${colors.status.error}44`,
                                    }}
                                >
                                    <AppText className="text-center font-semibold text-sm" style={{ color: colors.status.error }}>
                                        Action Blocked: This user has active open debt metrics or unsettled records inside this workspace ledger.
                                    </AppText>
                                </View>
                                <Pressable
                                    onPress={() => setIsRemoveModalVisible(false)}
                                    className="w-full py-3 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: colors.bg.darker }}
                                >
                                    <AppText className="font-bold text-foreground">Close</AppText>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

GroupMemberDetailsBottomSheet.displayName = 'GroupMemberDetailsBottomSheet';