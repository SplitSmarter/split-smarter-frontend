import React, {useState} from 'react';
import {
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Image,
    Alert,
} from 'react-native';
import {useRouter} from 'expo-router';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppInput} from '@/src/components/common/AppInput';
import {AppButton} from '@/src/components/common/AppButton';
import {AppImage} from '@/src/components/common/AppImage';
import {ScreenWrapper} from '@/src/components/common/ScreenWrapper';
import {MediaPickerBottomSheet} from '@/src/components/common/MediaPickerBottomSheet';
import {COLORS, PLATINUM_HEADER} from '@/src/constants/colors';
import {systemStore} from '@/src/store/systemStore';
import {themeStore} from '@/src/store/themeStore';
import {createRelationshipApi} from '@/src/api/relations/relationship';
import {useAssetPicker} from '@/src/hooks/useMediaPicker';
import {processLocalAttachments} from '@/src/utils/expense/transactionHelpers';
import {AddRelationshipHeader} from '@/src/screens/relationship/add/components/AddRelationshipHeader';

export default function AddRelationshipScreen() {
    const router = useRouter();
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;
    const {defaults} = systemStore();
    const {handleSingleCamera, handleSingleGallery} = useAssetPicker({
        autoUpload: false,
    });

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [localIconUri, setLocalIconUri] = useState<string | null>(null);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const defaultIcon = defaults.defaultRelationshipImage;

    const editChipBg = colors.brand.primary;
    const editChipIcon = colors.text.contrast;

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.replace('/(authenticated)/(tabs)/' as any);
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

    const handleCreate = async () => {
        if (loading) return;

        if (!title.trim()) {
            Alert.alert('Required', 'Please enter a title for the relationship.');
            return;
        }

        setLoading(true);
        try {
            let iconAssetId = defaultIcon?.id;

            if (localIconUri) {
                const uploaded = await processLocalAttachments([localIconUri]);
                if (!uploaded[0]) {
                    Alert.alert('Error', 'Failed to upload relationship icon. Try again.');
                    return;
                }
                iconAssetId = uploaded[0];
            }

            if (!iconAssetId) {
                Alert.alert('Error', 'Default relationship icon not found.');
                return;
            }

            const result = await createRelationshipApi({
                title: title.trim(),
                description: description.trim(),
                icon_asset_id: iconAssetId,
            });

            if (result.data) {
                router.back();
            }
        } catch (error: any) {
            console.log('Error creating relationship', error);
            Alert.alert('Error', error.message || 'Failed to create relationship');
        } finally {
            setLoading(false);
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
                    <AddRelationshipHeader onBack={handleBack} disabled={loading} />

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
                                    paddingBottom: 28,
                                }}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <View className="mb-6 items-center">
                                    <View className="relative">
                                        <View
                                            className="h-20 w-20 overflow-hidden rounded-full border"
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
                                                    variant="circular"
                                                    contentFit="cover"
                                                    className="h-full w-full"
                                                />
                                            )}
                                        </View>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Change relationship icon"
                                            onPress={() => setPickerVisible(true)}
                                            disabled={loading}
                                            className="rounded-full border-2 border-white p-2 active:opacity-80"
                                            style={{
                                                position: 'absolute',
                                                top: -4,
                                                right: -4,
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
                                            disabled={loading}
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
                                        label="Title"
                                        placeholder="e.g. Roommate, Sibling, Partner"
                                        value={title}
                                        onChangeText={setTitle}
                                        required
                                        renderLeftIcon={(color) => (
                                            <Iconify icon="solar:tag-bold" size={20} color={color} />
                                        )}
                                    />

                                    <AppInput
                                        label="Description"
                                        placeholder="What defines this relationship?"
                                        value={description}
                                        onChangeText={setDescription}
                                        multiline
                                        numberOfLines={4}
                                        renderLeftIcon={(color) => (
                                            <Iconify icon="solar:notes-bold" size={20} color={color} />
                                        )}
                                    />
                                </View>
                            </ScrollView>

                            <View
                                className="border-t border-border-input px-5 py-4"
                                style={{backgroundColor: canvasBg}}
                            >
                                <AppButton
                                    variant="primary"
                                    size="lg"
                                    loading={loading}
                                    loadingText={
                                        localIconUri ? 'Uploading…' : 'Creating…'
                                    }
                                    onPress={handleCreate}
                                    renderIcon={(color) => (
                                        <Iconify
                                            icon="solar:check-read-bold"
                                            size={22}
                                            color={color}
                                        />
                                    )}
                                >
                                    Create Relationship
                                </AppButton>
                            </View>
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
