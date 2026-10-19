import React, {useState} from 'react';
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
import {CreateExpenseCategoryApi} from '@/src/api/expense/categories';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';

export default function AddExpenseCategoryScreen() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {defaults} = systemStore();
    const {showAlert} = useAlert();
    const router = useRouter();
    const {handleSingleCamera, handleSingleGallery} = useAssetPicker({
        autoUpload: false,
    });

    const defaultIcon = defaults.defaultExpenseCategory?.asset;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
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

    const handleClearCustomIcon = () => {
        setLocalIconUri(null);
    };

    const handleSave = async () => {
        if (isSaving) return;

        if (!name.trim()) {
            showAlert('Category name is required', 'error');
            return;
        }

        setIsSaving(true);
        try {
            let iconAssetId = defaultIcon?.id;

            if (localIconUri) {
                const uploaded = await processLocalAttachments([localIconUri]);
                if (!uploaded[0]) {
                    showAlert('Failed to upload category icon. Try again.', 'error');
                    return;
                }
                iconAssetId = uploaded[0];
            }

            if (!iconAssetId) {
                showAlert('Default icon not found', 'error');
                return;
            }

            const response = await CreateExpenseCategoryApi({
                title: name.trim(),
                description: description.trim() || undefined,
                icon_asset_id: iconAssetId,
            });

            if (response.data) {
                showAlert(response.message || 'Category created successfully', 'success');
                router.navigate({
                    pathname: '/(authenticated)/expense/add',
                    params: {newlyCreatedCategory: JSON.stringify(response.data)},
                });
            } else {
                showAlert(response.message || 'Failed to create category', 'error');
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
                        title="New Category"
                        subtitle="Name · Icon · Description"
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
                                            accessibilityLabel="Change category icon"
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
                                            onPress={handleClearCustomIcon}
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
                                        placeholder="e.g. Groceries, Travel"
                                        value={name}
                                        onChangeText={setName}
                                        required
                                    />
                                    <AppInput
                                        label="Description"
                                        placeholder="Optional note"
                                        value={description}
                                        onChangeText={setDescription}
                                    />
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
                                        Save Category
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
            </ScreenWrapper>
        </BottomSheetModalProvider>
    );
}
