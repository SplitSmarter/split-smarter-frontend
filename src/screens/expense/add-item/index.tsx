import React, {useMemo, useState} from 'react';
import {View, Pressable, ScrollView} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImage} from '@/src/components/common/AppImage';
import {themeStore} from '@/src/store/themeStore';
import {systemStore} from '@/src/store/systemStore';
import {userStore} from '@/src/store/userStore';
import {AddExpenseItemApi} from '@/src/api/expense/item';
import {
    DEFAULT_EXPENSE_ITEM_CLASSIFICATION_REF,
} from '@/src/api/dto/expense/item';
import {Currency} from '@/src/api/dto/constants';
import {useAlert} from '@/src/context/alertContext';
import {COLORS} from '@/src/constants/colors';
import {
    ClassificationBottomSheet,
    SelectedClassification,
} from './components/ClassificationBottomSheet';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value?: string | null): boolean {
    return !!value && UUID_RE.test(value.trim());
}

function resolveDefaultClassification(
    itemRef: string | null | undefined,
    title: string | null | undefined
): SelectedClassification {
    const ref = itemRef?.trim() || DEFAULT_EXPENSE_ITEM_CLASSIFICATION_REF;
    const taxonomy_type = ref.startsWith('CPC_') ? 'CPC' : 'COICOP';
    const prefix = taxonomy_type === 'CPC' ? 'CPC_' : 'COICOP_';
    return {
        classification_ref: ref,
        title: title?.trim() || 'Other (default)',
        code: ref.startsWith(prefix) ? ref.slice(prefix.length) : ref,
        taxonomy_type,
    };
}

export default function AddExpenseItemScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const {defaults} = systemStore();
    const {user} = userStore();
    const {showAlert} = useAlert();
    const router = useRouter();

    const defaultIcon = defaults.defaultExpenseItem?.asset;
    const initialClassification = useMemo(
        () =>
            resolveDefaultClassification(
                defaults.defaultExpenseItem?.item_ref,
                defaults.defaultExpenseItem?.title
            ),
        [defaults.defaultExpenseItem?.item_ref, defaults.defaultExpenseItem?.title]
    );

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [costText, setCostText] = useState('');
    const [isQuantifiable, setIsQuantifiable] = useState(true);
    const [unitOfMeasure, setUnitOfMeasure] = useState('UNIT');
    const [classification, setClassification] =
        useState<SelectedClassification>(initialClassification);
    const [classificationSheetOpen, setClassificationSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)/expense/add');
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!name.trim()) {
            showAlert('Item name is required', 'error');
            return;
        }

        const cost = parseFloat(costText);
        if (isNaN(cost) || cost < 0) {
            showAlert('Enter a valid cost (0 or greater)', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const currency = (user?.currency || 'INR') as Currency;
            const isDefaultRef =
                classification.classification_ref ===
                    DEFAULT_EXPENSE_ITEM_CLASSIFICATION_REF ||
                classification.classification_ref ===
                    defaults.defaultExpenseItem?.item_ref;

            const payload = {
                title: name.trim(),
                description: description.trim() || undefined,
                cost,
                currency,
                // Omit to let server apply default when still on default catch-all
                classification_ref: isDefaultRef
                    ? undefined
                    : classification.classification_ref,
                is_quantifiable: isQuantifiable,
                unit_of_measure: isQuantifiable
                    ? unitOfMeasure.trim() || 'UNIT'
                    : undefined,
                ...(isUuid(defaultIcon?.id)
                    ? {icon_asset_id: defaultIcon!.id.trim()}
                    : {}),
            };

            const response = await AddExpenseItemApi(payload);

            if (response.data) {
                showAlert(response.message || 'Item created successfully', 'success');
                router.navigate({
                    pathname: '/(authenticated)/expense/add',
                    params: {newlyCreatedItem: JSON.stringify(response.data)},
                });
            } else {
                showAlert(response.message || 'Failed to create item', 'error');
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
                        New Item
                    </AppText>
                    <View className="w-10" />
                </View>

                <ScrollView
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 60}}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="items-center mb-8 mt-4">
                        <View className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-border-input">
                            <AppImage
                                url={defaultIcon?.url}
                                id={defaultIcon?.id}
                                size="lg"
                                variant="square"
                            />
                        </View>
                        <AppText variant="caption-xs" className="mt-3 text-text-primary-lighter">
                            Default Icon Selected
                        </AppText>
                    </View>

                    <View className="gap-y-6">
                        <AppInput
                            label="Name"
                            placeholder="Enter item name"
                            value={name}
                            onChangeText={setName}
                            required
                        />
                        <AppInput
                            label="Default cost"
                            placeholder="0.00"
                            value={costText}
                            onChangeText={setCostText}
                            keyboardType="decimal-pad"
                            required
                        />
                        <AppInput
                            label="Description"
                            placeholder="Optional description"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View>
                            <AppText
                                variant="caption-xs"
                                className="mb-2 font-semibold text-text-primary-lighter"
                            >
                                Classification
                            </AppText>
                            <Pressable
                                onPress={() => setClassificationSheetOpen(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Change classification"
                                className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-primary-lighter px-4 py-3.5"
                            >
                                <View className="flex-1 pr-3">
                                    <AppText className="font-semibold text-text-primary">
                                        {classification.title}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5 text-text-primary-lighter"
                                    >
                                        {classification.taxonomy_type} · {classification.code}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-1 text-accent-sky"
                                    >
                                        Tap to change COICOP / CPC
                                    </AppText>
                                </View>
                                <Iconify
                                    icon="heroicons:chevron-right"
                                    size={18}
                                    color={colors.icon.primary}
                                />
                            </Pressable>
                        </View>

                        <View>
                            <AppText
                                variant="caption-xs"
                                className="mb-2 font-semibold text-text-primary-lighter"
                            >
                                Quantifiable
                            </AppText>
                            <View className="flex-row rounded-xl border border-border-input bg-bg-canvas p-1">
                                <Pressable
                                    onPress={() => setIsQuantifiable(true)}
                                    className={`flex-1 items-center rounded-lg py-2.5 ${
                                        isQuantifiable ? 'bg-accent-sky-bg' : ''
                                    }`}
                                >
                                    <AppText
                                        className={`font-semibold ${
                                            isQuantifiable
                                                ? 'text-accent-sky'
                                                : 'text-text-primary-lighter'
                                        }`}
                                    >
                                        Yes
                                    </AppText>
                                </Pressable>
                                <Pressable
                                    onPress={() => setIsQuantifiable(false)}
                                    className={`flex-1 items-center rounded-lg py-2.5 ${
                                        !isQuantifiable ? 'bg-accent-sky-bg' : ''
                                    }`}
                                >
                                    <AppText
                                        className={`font-semibold ${
                                            !isQuantifiable
                                                ? 'text-accent-sky'
                                                : 'text-text-primary-lighter'
                                        }`}
                                    >
                                        No
                                    </AppText>
                                </Pressable>
                            </View>
                        </View>

                        {isQuantifiable ? (
                            <AppInput
                                label="Unit of measure"
                                placeholder="UNIT"
                                value={unitOfMeasure}
                                onChangeText={setUnitOfMeasure}
                            />
                        ) : null}
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
                            Save Item
                        </AppButton>
                    </View>
                </ScrollView>

            </SafeAreaView>

            <ClassificationBottomSheet
                visible={classificationSheetOpen}
                selectedRef={classification.classification_ref}
                onClose={() => setClassificationSheetOpen(false)}
                onSelect={setClassification}
            />
        </BottomSheetModalProvider>
    );
}
