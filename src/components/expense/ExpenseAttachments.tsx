import React, { useState, useEffect } from 'react';
import {
    View,
    Pressable,
    ScrollView,
    StyleSheet,
    Modal,
    Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { EntityFallbackIcon } from '@/src/components/common/EntityFallbackIcon';
import { useAssetPicker } from "@/src/hooks/useMediaPicker";
import { useRegisterOverlayDismiss } from '@/src/hooks/useBackDismissStack';
import { MediaPickerBottomSheet } from "@/src/components/common/MediaPickerBottomSheet";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

const THUMB_SIZE = 96;
const THUMB_RADIUS = 16;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_SIZE = Math.min(SCREEN_WIDTH - 48, 340);

interface AttachmentItem {
    id: string;
    uri: string;
}

interface ExpenseAttachmentsProps {
    onAttachmentsChange?: (localUris: string[]) => void;
}

function isLocalMediaUri(uri: string) {
    return (
        uri.startsWith('file://') ||
        uri.startsWith('content://') ||
        uri.startsWith('ph://') ||
        uri.startsWith('data:')
    );
}

function ZoomablePreviewImage({
    item,
    isDark,
}: {
    item: AttachmentItem;
    isDark: boolean;
}) {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const local = isLocalMediaUri(item.uri);

    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            const next = savedScale.value * e.scale;
            scale.value = Math.min(Math.max(next, 1), 4);
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value <= 1) {
                scale.value = withTiming(1);
                savedScale.value = 1;
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            }
        });

    const pan = Gesture.Pan()
        .averageTouches(true)
        .onUpdate((e) => {
            if (scale.value <= 1) return;
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            if (scale.value > 1) {
                scale.value = withTiming(1);
                savedScale.value = 1;
                translateX.value = withTiming(0);
                translateY.value = withTiming(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else {
                scale.value = withTiming(2);
                savedScale.value = 2;
            }
        });

    const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.previewImageClip, animatedStyle]}>
                <AppImageV2
                    id={`preview-${item.id}`}
                    url={local ? item.uri : undefined}
                    uri={item.uri}
                    style={styles.previewImage}
                    contentFit="contain"
                    fallbackComponent={
                        <EntityFallbackIcon
                            kind="attachment"
                            size={40}
                            color={colors.icon.lighter}
                        />
                    }
                />
            </Animated.View>
        </GestureDetector>
    );
}

export const ExpenseAttachments = ({ onAttachmentsChange }: ExpenseAttachmentsProps) => {
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [previewItem, setPreviewItem] = useState<AttachmentItem | null>(null);
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    useRegisterOverlayDismiss(pickerVisible, () => setPickerVisible(false));
    useRegisterOverlayDismiss(!!previewItem, () => setPreviewItem(null));

    const { handleSingleCamera, handleSingleGallery } = useAssetPicker({ autoUpload: false });

    useEffect(() => {
        const uris = attachments.map(item => item.uri);
        onAttachmentsChange?.(uris);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attachments]);

    const handleMediaSelection = (fromCamera: boolean) => {
        setPickerVisible(false);

        setTimeout(async () => {
            const action = fromCamera ? handleSingleCamera : handleSingleGallery;
            const results = await action();

            if (results && results.length > 0) {
                const selectedItems: AttachmentItem[] = results.map(r => {
                    const cleanCacheId = r.uri.split('/').pop()?.split('.')[0] || 'local_asset';
                    return {
                        id: r.trackingId ?? cleanCacheId,
                        uri: r.uri
                    };
                });
                setAttachments(prev => [...prev, ...selectedItems]);
            }
        }, 100);
    };

    const handleRemove = (uri: string) => {
        setAttachments(prev => prev.filter(item => item.uri !== uri));
        setPreviewItem((current) => (current?.uri === uri ? null : current));
    };

    const closePreview = () => setPreviewItem(null);

    return (
        <View className="mb-4">
            <View className="mb-3 flex-row items-center justify-between px-1">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Attachments
                </AppText>
                <AppText
                    variant="caption-xs"
                    className="font-medium"
                    style={{color: colors.text.lighter}}
                >
                    {attachments.length} files
                </AppText>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View className="flex-row items-end">
                    {attachments.map((item) => {
                        const local = isLocalMediaUri(item.uri);
                        return (
                            <View key={item.uri} style={styles.thumbItem}>
                                <View style={styles.thumbWrap}>
                                    <Pressable
                                        onPress={() => setPreviewItem(item)}
                                        accessibilityLabel="Preview attachment"
                                        style={[
                                            styles.thumbFrame,
                                            {
                                                backgroundColor: colors.bg.darker,
                                                borderColor: colors.status.border,
                                            },
                                        ]}
                                    >
                                        <AppImageV2
                                            id={item.id}
                                            url={local ? item.uri : undefined}
                                            uri={item.uri}
                                            style={styles.thumbImage}
                                            contentFit="cover"
                                            recyclingKey={item.id}
                                            fallbackComponent={
                                                <EntityFallbackIcon
                                                    kind="attachment"
                                                    size={28}
                                                    color={colors.icon.lighter}
                                                />
                                            }
                                        />
                                    </Pressable>

                                    <Pressable
                                        onPress={() => handleRemove(item.uri)}
                                        accessibilityLabel="Remove attachment"
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        style={[
                                            styles.removeBadge,
                                            {
                                                backgroundColor: colors.bg.lighter,
                                                borderColor: colors.status.border,
                                            },
                                        ]}
                                    >
                                        <Iconify
                                            icon="heroicons:x-mark"
                                            size={12}
                                            color={colors.status.error}
                                        />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}

                    <Pressable
                        onPress={() => setPickerVisible(true)}
                        accessibilityLabel="Add attachment"
                        style={[
                            styles.addTile,
                            {
                                backgroundColor: isDark ? colors.bg.darker : colors.bg.lighter,
                                borderColor: colors.status.border,
                            },
                        ]}
                    >
                        <Iconify
                            icon="heroicons:plus"
                            size={24}
                            color={colors.icon.primary}
                        />
                        <AppText
                            variant="caption-xs"
                            className="mt-1 font-bold"
                            style={{color: colors.text.lighter}}
                        >
                            Add
                        </AppText>
                    </Pressable>
                </View>
            </ScrollView>

            <MediaPickerBottomSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleMediaSelection}
            />

            <Modal
                visible={!!previewItem}
                transparent
                animationType="fade"
                onRequestClose={closePreview}
            >
                <View style={styles.previewOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={closePreview} />

                    <View
                        style={[
                            styles.previewCard,
                            {
                                backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay,
                                borderColor: colors.status.border,
                            },
                        ]}
                    >
                        <View className="flex-row items-center justify-between mb-3 px-1">
                            <AppText variant="body-base" className="font-bold text-text-primary">
                                Preview
                            </AppText>
                            <Pressable
                                onPress={closePreview}
                                hitSlop={8}
                                className="p-1.5 rounded-full"
                                style={{ backgroundColor: colors.bg.darker }}
                            >
                                <Iconify
                                    icon="heroicons:x-mark"
                                    size={18}
                                    color={colors.icon.primary}
                                />
                            </Pressable>
                        </View>

                        <AppText variant="caption-xs" className="text-text-primary-lighter mb-3 px-1">
                            Pinch to zoom · double-tap to toggle
                        </AppText>

                        <View
                            style={[
                                styles.previewStage,
                                { backgroundColor: colors.bg.darker },
                            ]}
                        >
                            {previewItem ? (
                                <ZoomablePreviewImage item={previewItem} isDark={isDark} />
                            ) : null}
                        </View>

                        <View className="mt-4 gap-y-2">
                            <AppButton
                                variant="primary"
                                className="h-12 rounded-2xl"
                                onPress={() => {
                                    if (previewItem) handleRemove(previewItem.uri);
                                }}
                                renderIcon={(c) => (
                                    <Iconify icon="heroicons:trash" size={18} color={c} />
                                )}
                            >
                                Remove
                            </AppButton>
                            <AppButton
                                variant="secondary"
                                className="h-12 rounded-2xl"
                                onPress={closePreview}
                            >
                                Close
                            </AppButton>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: 8,
        paddingLeft: 4,
        paddingRight: 8,
        paddingBottom: 4,
    },
    thumbItem: {
        marginRight: 16,
    },
    thumbWrap: {
        width: THUMB_SIZE + 8,
        height: THUMB_SIZE + 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbFrame: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_RADIUS,
        overflow: 'hidden',
        borderWidth: 1,
    },
    thumbImage: {
        width: '100%',
        height: '100%',
        borderRadius: THUMB_RADIUS,
    },
    removeBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        elevation: 3,
    },
    addTile: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        marginBottom: 4,
        borderRadius: THUMB_RADIUS,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    previewCard: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        borderWidth: 1,
        padding: 16,
    },
    previewStage: {
        width: '100%',
        height: PREVIEW_SIZE,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImageClip: {
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewImage: {
        width: PREVIEW_SIZE,
        height: PREVIEW_SIZE,
    },
});
