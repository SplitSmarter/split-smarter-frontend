import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImageV2 } from '@/src/components/common/AppImageV2';
import { useAssetPicker } from "@/src/hooks/useMediaPicker";
import { MediaPickerBottomSheet } from "@/src/components/common/MediaPickerBottomSheet";

interface AttachmentItem {
    id: string; // Resolves cleanly to trackingId or fallback uri
    uri: string;
}

interface ExpenseAttachmentsProps {
    onAttachmentsChange?: (localUris: string[]) => void;
}

export const ExpenseAttachments = ({ onAttachmentsChange }: ExpenseAttachmentsProps) => {
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);

    const { handleSingleCamera, handleSingleGallery } = useAssetPicker({ autoUpload: false });

    useEffect(() => {
        const uris = attachments.map(item => item.uri);
        onAttachmentsChange?.(uris);
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
    };

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3 px-1">
                <AppText variant="h4" className="font-bold text-text-primary">Attachments</AppText>
                <AppText variant="caption-xs" className="text-text-primary-lighter font-medium">
                    {attachments.length} files
                </AppText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-x-4 px-1">
                    {attachments.map((item) => (
                        <View key={item.uri} className="w-24 h-24 relative">
                            <View className="w-full h-full rounded-3xl overflow-hidden bg-bg-primary-darker border border-border-input">
                                <AppImageV2
                                    id={item.id}
                                    uri={item.uri} // Passes local path down safely
                                    className="w-full h-full"
                                    contentFit="cover"
                                />
                            </View>

                            <Pressable
                                onPress={() => handleRemove(item.uri)}
                                className="absolute -top-1 -right-1 bg-text-primary-darker w-6 h-6 rounded-full items-center justify-center shadow-sm border border-border-input"
                            >
                                <Iconify icon="heroicons:x-mark" size={12} color="#EF4444" />
                            </Pressable>
                        </View>
                    ))}

                    <Pressable
                        onPress={() => setPickerVisible(true)}
                        className="w-24 h-24 rounded-3xl border-2 border-dashed border-brand-primary/30 items-center justify-center bg-brand-primary/5"
                    >
                        <Iconify icon="heroicons:plus" size={24} color="rgb(var(--color-bg-secondary))" />
                        <AppText variant="caption-xs" className="text-text-link mt-1 font-bold">Add</AppText>
                    </Pressable>
                </View>
            </ScrollView>

            <MediaPickerBottomSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleMediaSelection}
            />
        </View>
    );
};