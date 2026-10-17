import React, {useState} from 'react';
import {View, Pressable, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {ExpenseAttachments} from '@/src/components/expense/ExpenseAttachments';
import {SelectDateBottomSheet} from '@/src/components/common/SelectDateBottomSheet';
import {DateSelectionResult} from '@/src/components/common/types/selectDateBottomSheet.types';
import {themeStore} from '@/src/store/themeStore';
import {systemStore} from '@/src/store/systemStore';
import {CreateMemoryApi} from '@/src/api/user/memory';
import {MemoryScope} from '@/src/api/dto/user/memory';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {COLORS} from '@/src/constants/colors';

function toIsoStartOfDay(ymd: string): string {
    return new Date(`${ymd}T00:00:00.000Z`).toISOString();
}

function toIsoEndOfDay(ymd: string): string {
    return new Date(`${ymd}T23:59:59.999Z`).toISOString();
}

function formatDisplayDate(ymd: string | null): string {
    if (!ymd) return 'Optional';
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default function AddMemoryScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const {defaults} = systemStore();
    const {showAlert} = useAlert();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [scope, setScope] = useState<MemoryScope>(MemoryScope.PERSONAL);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [dateField, setDateField] = useState<'start' | 'end' | null>(null);
    const [localAttachmentUris, setLocalAttachmentUris] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!title.trim()) {
            showAlert('Memory title is required', 'error');
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            showAlert('End date must be on or after start date', 'error');
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
                start_at: startDate ? toIsoStartOfDay(startDate) : undefined,
                end_at: endDate ? toIsoEndOfDay(endDate) : undefined,
                asset_ids: assetIds.length ? assetIds : undefined,
                icon_asset_id: iconAssetId || undefined,
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
            <SafeAreaView className="flex-1 bg-bg-canvas" edges={['top']}>
                <View className="px-6 pt-2 pb-4 flex-row items-center justify-between">
                    <Pressable onPress={handleBack} className="p-2 rounded-full" disabled={isSaving}>
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        New Memory
                    </AppText>
                    <View className="w-10" />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 60}}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="gap-y-6 mt-2">
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
                                <View className="flex-row rounded-xl border border-border-input bg-bg-canvas p-1">
                                    <Pressable
                                        onPress={() => setScope(MemoryScope.PERSONAL)}
                                        className={`flex-1 items-center rounded-lg py-2.5 ${
                                            scope === MemoryScope.PERSONAL
                                                ? 'bg-accent-sky-bg'
                                                : ''
                                        }`}
                                    >
                                        <AppText
                                            className={`font-semibold ${
                                                scope === MemoryScope.PERSONAL
                                                    ? 'text-accent-sky'
                                                    : 'text-text-primary-lighter'
                                            }`}
                                        >
                                            Personal
                                        </AppText>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setScope(MemoryScope.GROUP)}
                                        className={`flex-1 items-center rounded-lg py-2.5 ${
                                            scope === MemoryScope.GROUP
                                                ? 'bg-accent-sky-bg'
                                                : ''
                                        }`}
                                    >
                                        <AppText
                                            className={`font-semibold ${
                                                scope === MemoryScope.GROUP
                                                    ? 'text-accent-sky'
                                                    : 'text-text-primary-lighter'
                                            }`}
                                        >
                                            Group
                                        </AppText>
                                    </Pressable>
                                </View>
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
                </KeyboardAvoidingView>

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
            </SafeAreaView>
        </BottomSheetModalProvider>
    );
}
