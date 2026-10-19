import React, {useMemo, useState} from 'react';
import {
    View,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImage} from '@/src/components/common/AppImage';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {PlatinumFormHeader} from '@/src/components/common/PlatinumFormHeader';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {themeStore} from '@/src/store/themeStore';
import {systemStore} from '@/src/store/systemStore';
import {userStore} from '@/src/store/userStore';
import {AddExpenseItemApi} from '@/src/api/expense/item';
import {DEFAULT_EXPENSE_ITEM_CLASSIFICATION_REF} from '@/src/api/dto/expense/item';
import {Currency} from '@/src/api/dto/constants';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {
    ClassificationBottomSheet,
    SelectedClassification,
} from '@/src/screens/expense/add-item/components/ClassificationBottomSheet';

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value?: string | null): boolean {
    return !!value && UUID_RE.test(value.trim());
}

function resolveDefaultClassification(
    itemRef: string | null | undefined,
    title: string | null | undefined,
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
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {defaults} = systemStore();
    const {user} = userStore();
    const {showAlert} = useAlert();
    const router = useRouter();
    const {handleSingleCamera, handleSingleGallery} = useAssetPicker({
        autoUpload: false,
    });

    const defaultIcon = defaults.defaultExpenseItem?.asset;
    const initialClassification = useMemo(
        () =>
            resolveDefaultClassification(
                defaults.defaultExpenseItem?.item_ref,
                defaults.defaultExpenseItem?.title,
            ),
        [defaults.defaultExpenseItem?.item_ref, defaults.defaultExpenseItem?.title],
    );

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [costText, setCostText] = useState('');
    const [isQuantifiable, setIsQuantifiable] = useState(true);
    const [unitOfMeasure, setUnitOfMeasure] = useState('UNIT');
    const [classification, setClassification] =
        useState<SelectedClassification>(initialClassification);
    const [classificationSheetOpen, setClassificationSheetOpen] = useState(false);
    const [localIconUri, setLocalIconUri] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)/expense/add');
        }
    };

    const handleMediaSelection = (fromCamera: boolean) => {
        setPickerVisible(false);
        setTimeout(async () => {
            const action = fromCamera ? handleSingleCamera : handleSingleGallery;
            const results = await action();
            const uri = results?.[0]?.uri;
            if (uri) setLocalIconUri(uri);
        }, 100);
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
            let iconAssetId: string | undefined;
            if (localIconUri) {
                const uploaded = await processLocalAttachments([localIconUri]);
                if (!uploaded[0]) {
                    showAlert('Failed to upload item icon. Try again.', 'error');
                    return;
                }
                iconAssetId = uploaded[0];
            } else if (isUuid(defaultIcon?.id)) {
                iconAssetId = defaultIcon!.id.trim();
            }

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
                classification_ref: isDefaultRef
                    ? undefined
                    : classification.classification_ref,
                is_quantifiable: isQuantifiable,
                unit_of_measure: isQuantifiable
                    ? unitOfMeasure.trim() || 'UNIT'
                    : undefined,
                ...(iconAssetId ? {icon_asset_id: iconAssetId} : {}),
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
            showAlert(
                err?.message || 'An unexpected error occurred. Please try again.',
                'error',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const editChipBg = colors.brand.primary;
    const editChipIcon = colors.text.contrast;

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
                        title="New Item"
                        subtitle="Name · Cost · Icon · Class"
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
                                <View className="mb-8 items-center">
                                    <View className="relative">
                                        <View
                                            className="h-24 w-24 overflow-hidden rounded-3xl border-2"
                                            style={{
                                                borderColor: colors.status.border,
                                                backgroundColor: colors.bg.lighter,
                                            }}
                                        >
                                            {localIconUri ? (
                                                <Image
                                                    source={{uri: localIconUri}}
                                                    style={{width: '100%', height: '100%'}}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <AppImage
                                                    url={defaultIcon?.url}
                                                    id={defaultIcon?.id}
                                                    size="full"
                                                    variant="square"
                                                    contentFit="cover"
                                                    className="h-full w-full"
                                                />
                                            )}
                                        </View>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Change item icon"
                                            onPress={() => setPickerVisible(true)}
                                            disabled={isSaving}
                                            className="rounded-full border-2 border-white p-2 active:opacity-80"
                                            style={{
                                                position: 'absolute',
                                                bottom: -8,
                                                right: -8,
                                                backgroundColor: editChipBg,
                                            }}
                                        >
                                            <Iconify
                                                icon="heroicons:pencil-square"
                                                size={14}
                                                color={editChipIcon}
                                            />
                                        </Pressable>
                                    </View>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-3 text-text-primary-lighter"
                                    >
                                        {localIconUri
                                            ? 'Custom icon — uploads on save'
                                            : 'Default icon · tap pencil to change'}
                                    </AppText>
                                    {localIconUri ? (
                                        <Pressable
                                            onPress={() => setLocalIconUri(null)}
                                            disabled={isSaving}
                                            className="mt-2 active:opacity-70"
                                        >
                                            <AppText
                                                variant="caption-xs"
                                                className="font-semibold text-accent-sky"
                                            >
                                                Use default icon
                                            </AppText>
                                        </Pressable>
                                    ) : null}
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
                                            className="flex-row items-center justify-between rounded-2xl border border-border-input bg-bg-canvas px-4 py-3.5"
                                        >
                                            <View className="flex-1 pr-3">
                                                <AppText className="font-semibold text-text-primary">
                                                    {classification.title}
                                                </AppText>
                                                <AppText
                                                    variant="caption-xs"
                                                    className="mt-0.5 text-text-primary-lighter"
                                                >
                                                    {classification.taxonomy_type} ·{' '}
                                                    {classification.code}
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
                                        className="h-14 w-full rounded-2xl"
                                        onPress={handleSave}
                                        disabled={isSaving}
                                        loading={isSaving}
                                        loadingText={
                                            localIconUri ? 'Uploading…' : 'Saving…'
                                        }
                                    >
                                        Save Item
                                    </AppButton>
                                </View>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>

                <MediaPickerBottomSheet
                    visible={pickerVisible}
                    onClose={() => setPickerVisible(false)}
                    onSelect={handleMediaSelection}
                />

                <ClassificationBottomSheet
                    visible={classificationSheetOpen}
                    selectedRef={classification.classification_ref}
                    onClose={() => setClassificationSheetOpen(false)}
                    onSelect={setClassification}
                />
            </ScreenWrapper>
        </BottomSheetModalProvider>
    );
}
