import React, {useState} from 'react';
import {View, Pressable, Image} from 'react-native';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImage} from '@/src/components/common/AppImage';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {themeStore} from '@/src/store/themeStore';
import {systemStore} from '@/src/store/systemStore';
import {CreateExpenseCategoryApi} from '@/src/api/expense/categories';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {useAlert} from '@/src/context/alertContext';
import {ExpenseCategoryResponse} from '@/src/api/dto/expense/category';
import {COLORS} from '@/src/constants/colors';

interface AddCategoryFormProps {
    onBack: () => void;
    onSuccess?: (newCategory: ExpenseCategoryResponse) => void;
}

export const AddCategoryForm = ({onBack, onSuccess}: AddCategoryFormProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const {defaults} = systemStore();
    const {showAlert} = useAlert();
    const {handleSingleCamera, handleSingleGallery} = useAssetPicker({
        autoUpload: false,
    });

    const defaultIcon = defaults.defaultExpenseCategory?.asset;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [localIconUri, setLocalIconUri] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                onSuccess?.(response.data);
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

    return (
        <View className="flex-1">
            <View className="px-6 pb-4 pt-2">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={onBack} className="rounded-full p-2" disabled={isSaving}>
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">
                        New Category
                    </AppText>
                    <View className="w-10" />
                </View>
            </View>

            <BottomSheetScrollView
                contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 60}}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View className="mb-8 items-center">
                    <View className="relative">
                        <View className="h-24 w-24 overflow-hidden rounded-3xl border-2 border-border-input">
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
                            className="rounded-full border-2 border-white p-2 active:opacity-80"
                            style={{
                                position: 'absolute',
                                bottom: -8,
                                right: -8,
                                backgroundColor: colors.brand.primary,
                            }}
                            onPress={() => setPickerVisible(true)}
                            disabled={isSaving}
                        >
                            <Iconify
                                icon="heroicons:pencil-square"
                                size={14}
                                color={colors.text.contrast}
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
                        loadingText={localIconUri ? 'Uploading…' : 'Saving…'}
                    >
                        Save Category
                    </AppButton>
                </View>
            </BottomSheetScrollView>

            <MediaPickerBottomSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleMediaSelection}
            />
        </View>
    );
};
