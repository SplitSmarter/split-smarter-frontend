import React, {useCallback, useState} from 'react';
import {
    View,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {PlatinumFormHeader} from '@/src/components/common/PlatinumFormHeader';
import {ExpenseAttachments} from '@/src/components/expense/ExpenseAttachments';
import {SelectDateBottomSheet} from '@/src/components/common/SelectDateBottomSheet';
import {DateSelectionResult} from '@/src/components/common/types/selectDateBottomSheet.types';
import {SelectGroupBottomSheet} from '@/src/components/user/SelectGroupBottomSheet';
import {
    SelectMultiPeopleBottomSheet,
    SelectedUserEntity,
} from '@/src/components/user/SelectMultiPeopleBottomSheet';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {BaseGroupDetails} from '@/src/api/dto/user/group';
import {themeStore} from '@/src/store/themeStore';
import {systemStore} from '@/src/store/systemStore';
import {CreateMemoryApi} from '@/src/api/user/memory';
import {MemoryScope} from '@/src/api/dto/user/memory';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';

const SHARED_MEMBER_TYPES = [RelationWithUserType.USER];

const SCOPE_OPTIONS: {
    value: MemoryScope;
    label: string;
    description: string;
}[] = [
    {
        value: MemoryScope.PERSONAL,
        label: 'Personal',
        description: 'Only you',
    },
    {
        value: MemoryScope.SHARED,
        label: 'Shared',
        description: 'Pick people',
    },
    {
        value: MemoryScope.GROUP,
        label: 'Group',
        description: 'Whole group',
    },
];

function toIsoStartOfDay(ymd: string): string {
    return new Date(`${ymd}T00:00:00.000Z`).toISOString();
}

function toIsoEndOfDay(ymd: string): string {
    return new Date(`${ymd}T23:59:59.999Z`).toISOString();
}

function formatDisplayDate(ymd: string | null): string {
    if (!ymd) return 'Required';
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type SheetKind = 'group' | 'members' | null;

export default function AddMemoryScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {defaults} = systemStore();
    const {showAlert} = useAlert();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scope, setScope] = useState<MemoryScope>(MemoryScope.PERSONAL);
    const [group, setGroup] = useState<BaseGroupDetails | null>(null);
    const [sharedWith, setSharedWith] = useState<SelectedUserEntity[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [dateField, setDateField] = useState<'start' | 'end' | null>(null);
    const [sheet, setSheet] = useState<SheetKind>(null);
    const [localAttachmentUris, setLocalAttachmentUris] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
    };

    const handleScopeChange = (next: MemoryScope) => {
        setScope(next);
        if (next !== MemoryScope.GROUP) setGroup(null);
        if (next !== MemoryScope.SHARED) setSharedWith([]);
    };

    const removeSharedMember = useCallback((id: number) => {
        setSharedWith((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const handleSave = async () => {
        if (isSaving) return;

        if (!title.trim()) {
            showAlert('Memory title is required', 'error');
            return;
        }

        if (!startDate || !endDate) {
            showAlert('Start and end dates are required', 'error');
            return;
        }

        if (endDate <= startDate) {
            showAlert('End date must be after start date', 'error');
            return;
        }

        if (scope === MemoryScope.GROUP && !group?.id) {
            showAlert('Select a group for this memory', 'error');
            return;
        }

        if (scope === MemoryScope.SHARED && sharedWith.length === 0) {
            showAlert('Add at least one person to share with', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const assetIds = await processLocalAttachments(localAttachmentUris);
            const iconAssetId =
                defaults.defaultExpenseItem?.asset?.id ||
                defaults.placeholderImage?.id ||
                undefined;

            const response = await CreateMemoryApi({
                title: title.trim(),
                description: description.trim() || undefined,
                scope,
                start_at: toIsoStartOfDay(startDate),
                end_at: toIsoEndOfDay(endDate),
                asset_ids: assetIds.length ? assetIds : undefined,
                icon_asset_id: iconAssetId || undefined,
                ...(scope === MemoryScope.GROUP && group?.id
                    ? {group_id: group.id}
                    : {}),
                ...(scope === MemoryScope.SHARED
                    ? {shared_with_user_ids: sharedWith.map((m) => m.id)}
                    : {}),
            });

            if (response.data) {
                showAlert(response.message || 'Memory created successfully', 'success');
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace('/(authenticated)');
                }
            } else {
                showAlert(response.message || 'Failed to create memory', 'error');
            }
        } catch (err: any) {
            showAlert(err?.message || 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BottomSheetModalProvider>
            <ScreenWrapper
                backgroundColor={heroStatusBar}
                statusBarStyle="light-content"
                withPadding={false}
                className="relative flex-1"
            >
                <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                    <PlatinumFormHeader
                        title="New Memory"
                        subtitle="Title · Scope · Window"
                        onBack={handleBack}
                        disabled={isSaving}
                    />

                    <KeyboardAvoidingView
                        className="flex-1"
                        style={{backgroundColor: heroStatusBar}}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
                    >
                        <View
                            className="flex-1 overflow-hidden"
                            style={{
                                marginTop: -20,
                                borderTopLeftRadius: 28,
                                borderTopRightRadius: 28,
                                backgroundColor: canvasBg,
                            }}
                        >
                            <ScrollView
                                className="flex-1"
                                style={{backgroundColor: canvasBg}}
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingTop: 24,
                                    paddingBottom: 120,
                                }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="gap-y-6">
                                    <AppInput
                                        label="Title"
                                        placeholder="Trip, event, or period name"
                                        value={title}
                                        onChangeText={setTitle}
                                        required
                                    />
                                    <AppInput
                                        label="Description"
                                        placeholder="Optional notes"
                                        value={description}
                                        onChangeText={setDescription}
                                    />

                                    <View>
                                        <AppText
                                            variant="caption-xs"
                                            className="mb-2 font-semibold text-text-primary-lighter"
                                        >
                                            Scope
                                        </AppText>
                                        <View className="mb-3 flex-row gap-2">
                                            {SCOPE_OPTIONS.map((opt) => {
                                                const selected = scope === opt.value;
                                                return (
                                                    <Pressable
                                                        key={opt.value}
                                                        onPress={() => handleScopeChange(opt.value)}
                                                        className={`flex-1 rounded-2xl border p-3 ${
                                                            selected
                                                                ? 'border-accent-sky bg-accent-sky-bg'
                                                                : 'border-border-input bg-bg-canvas'
                                                        }`}
                                                    >
                                                        {opt.value === MemoryScope.PERSONAL ? (
                                                            <Iconify
                                                                icon="heroicons:user"
                                                                size={18}
                                                                color={
                                                                    selected
                                                                        ? colors.accent.sky
                                                                        : colors.icon.lighter
                                                                }
                                                            />
                                                        ) : opt.value === MemoryScope.SHARED ? (
                                                            <Iconify
                                                                icon="heroicons:users"
                                                                size={18}
                                                                color={
                                                                    selected
                                                                        ? colors.accent.sky
                                                                        : colors.icon.lighter
                                                                }
                                                            />
                                                        ) : (
                                                            <Iconify
                                                                icon="heroicons:user-group"
                                                                size={18}
                                                                color={
                                                                    selected
                                                                        ? colors.accent.sky
                                                                        : colors.icon.lighter
                                                                }
                                                            />
                                                        )}
                                                        <AppText
                                                            variant="caption-xs"
                                                            className={`mt-2 font-bold ${
                                                                selected
                                                                    ? 'text-accent-sky'
                                                                    : 'text-text-primary'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </AppText>
                                                        <AppText
                                                            variant="caption-xs"
                                                            className="mt-0.5 text-text-primary-lighter"
                                                            numberOfLines={1}
                                                        >
                                                            {opt.description}
                                                        </AppText>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>

                                        {scope === MemoryScope.SHARED && (
                                            <View className="rounded-2xl border border-border-input bg-bg-canvas p-4">
                                                <View className="mb-3 flex-row items-center justify-between">
                                                    <View className="flex-1 pr-2">
                                                        <AppText className="font-bold text-text-primary">
                                                            Shared with
                                                        </AppText>
                                                        <AppText
                                                            variant="caption-xs"
                                                            className="mt-0.5 text-text-primary-lighter"
                                                        >
                                                            {sharedWith.length > 0
                                                                ? `${sharedWith.length} person${
                                                                      sharedWith.length === 1
                                                                          ? ''
                                                                          : 's'
                                                                  }`
                                                                : 'Add people who can see this'}
                                                        </AppText>
                                                    </View>
                                                    <Pressable
                                                        onPress={() => setSheet('members')}
                                                        className="flex-row items-center gap-1 rounded-xl border border-accent-sky bg-accent-sky-bg px-3 py-1.5"
                                                    >
                                                        <Iconify
                                                            icon="heroicons:user-plus"
                                                            size={14}
                                                            color={colors.accent.sky}
                                                        />
                                                        <AppText
                                                            variant="caption-xs"
                                                            className="font-semibold text-accent-sky"
                                                        >
                                                            Add
                                                        </AppText>
                                                    </Pressable>
                                                </View>
                                                {sharedWith.length > 0 ? (
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {sharedWith.map((m) => (
                                                            <View
                                                                key={`shared-${m.id}`}
                                                                className="flex-row items-center gap-2 rounded-full border border-border-input bg-bg-primary px-2.5 py-1.5"
                                                            >
                                                                <View className="h-6 w-6 overflow-hidden rounded-full">
                                                                    <AppImageV2
                                                                        id={
                                                                            m.avatar?.id ??
                                                                            `memory-share-${m.id}`
                                                                        }
                                                                        url={m.avatar?.url}
                                                                        contentFit="cover"
                                                                        style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                        }}
                                                                        fallbackComponent={
                                                                            <EntityFallbackIcon
                                                                                kind="user"
                                                                                size={14}
                                                                                color={
                                                                                    colors.icon
                                                                                        .lighter
                                                                                }
                                                                            />
                                                                        }
                                                                    />
                                                                </View>
                                                                <AppText
                                                                    variant="caption-xs"
                                                                    className="max-w-[100px] font-semibold text-text-primary"
                                                                    numberOfLines={1}
                                                                >
                                                                    {m.name}
                                                                </AppText>
                                                                <Pressable
                                                                    onPress={() =>
                                                                        removeSharedMember(m.id)
                                                                    }
                                                                    hitSlop={8}
                                                                >
                                                                    <Iconify
                                                                        icon="heroicons:x-mark"
                                                                        size={14}
                                                                        color={colors.icon.lighter}
                                                                    />
                                                                </Pressable>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ) : null}
                                            </View>
                                        )}

                                        {scope === MemoryScope.GROUP && (
                                            <Pressable
                                                onPress={() => setSheet('group')}
                                                className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-canvas px-4 py-3.5"
                                            >
                                                <View className="flex-1 pr-3">
                                                    <AppText className="font-bold text-text-primary">
                                                        {group?.name || 'Select group'}
                                                    </AppText>
                                                    <AppText
                                                        variant="caption-xs"
                                                        className="mt-0.5 text-text-primary-lighter"
                                                    >
                                                        {group
                                                            ? 'Group members can view this'
                                                            : 'Required for group scope'}
                                                    </AppText>
                                                </View>
                                                <Iconify
                                                    icon="heroicons:chevron-right"
                                                    size={18}
                                                    color={colors.icon.lighter}
                                                />
                                            </Pressable>
                                        )}
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <AppText
                                                variant="caption-xs"
                                                className="mb-2 font-semibold text-text-primary-lighter"
                                            >
                                                Start date
                                            </AppText>
                                            <Pressable
                                                onPress={() => setDateField('start')}
                                                className="flex-row items-center justify-between rounded-2xl border border-border-input px-4 py-3.5"
                                            >
                                                <AppText
                                                    className={
                                                        startDate
                                                            ? 'text-text-primary'
                                                            : 'text-text-primary-lighter'
                                                    }
                                                >
                                                    {formatDisplayDate(startDate)}
                                                </AppText>
                                                <Iconify
                                                    icon="heroicons:calendar-days"
                                                    size={18}
                                                    color={colors.icon.primary}
                                                />
                                            </Pressable>
                                        </View>
                                        <View className="flex-1">
                                            <AppText
                                                variant="caption-xs"
                                                className="mb-2 font-semibold text-text-primary-lighter"
                                            >
                                                End date
                                            </AppText>
                                            <Pressable
                                                onPress={() => setDateField('end')}
                                                className="flex-row items-center justify-between rounded-2xl border border-border-input px-4 py-3.5"
                                            >
                                                <AppText
                                                    className={
                                                        endDate
                                                            ? 'text-text-primary'
                                                            : 'text-text-primary-lighter'
                                                    }
                                                >
                                                    {formatDisplayDate(endDate)}
                                                </AppText>
                                                <Iconify
                                                    icon="heroicons:calendar-days"
                                                    size={18}
                                                    color={colors.icon.primary}
                                                />
                                            </Pressable>
                                        </View>
                                    </View>

                                    <View>
                                        <AppText
                                            variant="caption-xs"
                                            className="mb-2 font-semibold text-text-primary-lighter"
                                        >
                                            Photos
                                        </AppText>
                                        <ExpenseAttachments
                                            onAttachmentsChange={setLocalAttachmentUris}
                                        />
                                    </View>
                                </View>

                                <View className="mt-10">
                                    <AppButton
                                        variant="primary"
                                        className="w-full h-14 rounded-2xl"
                                        onPress={handleSave}
                                        disabled={isSaving}
                                        loading={isSaving}
                                        loadingText="Saving..."
                                    >
                                        Save Memory
                                    </AppButton>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <SelectDateBottomSheet
                    visible={dateField !== null}
                    allowedModes="single"
                    allowFutureDates={dateField === 'end'}
                    initialDate={
                        (dateField === 'end' ? endDate : startDate) ||
                        new Date().toISOString().split('T')[0]
                    }
                    onClose={() => setDateField(null)}
                    onConfirm={(result: DateSelectionResult) => {
                        const ymd = result.isRecurring
                            ? result.startDate
                            : result.selectedDate;
                        if (dateField === 'start') {
                            setStartDate(ymd);
                        } else if (dateField === 'end') {
                            setEndDate(ymd);
                        }
                        setDateField(null);
                    }}
                />

                <SelectGroupBottomSheet
                    visible={sheet === 'group'}
                    selectedId={group?.id}
                    onClose={() => setSheet(null)}
                    onSelect={(g) => {
                        setGroup(g);
                        setSheet(null);
                    }}
                />

                <SelectMultiPeopleBottomSheet
                    visible={sheet === 'members'}
                    initialSelectedUsers={sharedWith}
                    allowedUserTypes={SHARED_MEMBER_TYPES}
                    minSelectionToClose={1}
                    onClose={() => setSheet(null)}
                    onConfirmed={(selected) => {
                        setSharedWith(selected);
                        setSheet(null);
                    }}
                />
            </ScreenWrapper>
        </BottomSheetModalProvider>
    );
}
