import React, { useState, useEffect } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { useUploadStore } from "@/src/store/uploadStore";
import { useAssetPicker } from "@/src/hooks/useMediaPicker";
import { MediaPickerBottomSheet } from "@/src/components/common/MediaPickerBottomSheet";

interface ExpenseAttachmentsProps {
    onAttachmentsChange?: (ids: string[]) => void;
}

export const ExpenseAttachments = ({ onAttachmentsChange }: ExpenseAttachmentsProps) => {
    const [localIds, setLocalIds] = useState<string[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);

    const queue = useUploadStore((state) => state.queue);
    const removeFromQueue = useUploadStore((state) => state.removeFromQueue);
    const { handleSingleCamera, handleSingleGallery } = useAssetPicker();

    // Notify parent of COMPLETED backend IDs
    useEffect(() => {
        const backendAssetIds = localIds
            .map(id => queue[id])
            .filter(task => task?.status === 'completed' && task.assetId)
            .map(task => task!.assetId!);

        onAttachmentsChange?.(backendAssetIds);
    }, [localIds, queue]);

    // This mapping matches your Test Screen's logic
    const attachments = localIds.map(id => queue[id]).filter(Boolean);

    const handleMediaSelection = async (fromCamera: boolean) => {
        setPickerVisible(false);

        const action = fromCamera ? handleSingleCamera : handleSingleGallery;
        const results = await action();

        if (results && results.length > 0) {
            // Since addToQueue now returns the local random ID (the key),
            // we store that key in localIds to look it up in the queue object.
            const newIds = results
                .map((r: any) => r.assetId)
                .filter((id: any): id is string => id !== null);

            if (newIds.length > 0) {
                setLocalIds(prev => [...prev, ...newIds]);
            }
        }
    };

    const handleRemove = (id: string) => {
        setLocalIds(prev => prev.filter(itemId => itemId !== id));
        removeFromQueue(id);
    };

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-3 px-1">
                <AppText variant="h4" className="font-bold text-text-primary">Attachments</AppText>
                <AppText variant="caption-xs" className="text-text-secondary">
                    {attachments.length} files
                </AppText>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-x-4 px-1">
                    {attachments.map((task) => (
                        <AttachmentThumbnail
                            key={task.id}
                            task={task}
                            onRemove={() => handleRemove(task.id)}
                        />
                    ))}

                    <Pressable
                        onPress={() => setPickerVisible(true)}
                        className="w-24 h-24 rounded-[32px] border-2 border-dashed border-green-increase/30 items-center justify-center bg-green-increase/5"
                    >
                        <Iconify icon="heroicons:plus" size={28} color="#2D6A4F" />
                        <AppText variant="caption-xs" className="text-green-increase mt-1 font-bold">Add</AppText>
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

const AttachmentThumbnail = ({ task, onRemove }: { task: any, onRemove: () => void }) => {
    const isUploading = task.status === 'uploading';
    const isCompleted = task.status === 'completed';
    const isFailed = task.status === 'failed';

    return (
        <View className="w-24 h-24 relative">
            <View
                className={`w-full h-full rounded-[24px] overflow-hidden bg-bg-primary`}
            >
                <AppImage
                    id={task.id}
                    url={isCompleted ? task.remoteUrl : task.uri}
                    size="full"
                    className="w-full h-full"
                />

                {/* Status Overlays - Only show one at a time */}
                {isUploading && (
                    <View className="absolute inset-0 bg-black/30 items-center justify-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    </View>
                )}

                {isFailed && (
                    <View className="absolute inset-0 bg-red-500/10 items-center justify-center">
                        <Iconify icon="heroicons:exclamation-circle" size={24} color="#EF4444" />
                    </View>
                )}
            </View>

            {/* Remove Button - Top Right */}
            <Pressable
                onPress={onRemove}
                className="absolute -top-1 -right-1 bg-text-primary w-6 h-6 rounded-full items-center justify-center shadow-sm"
            >
                <Iconify icon="heroicons:x-mark" size={12} color="red" />
            </Pressable>

            {/* Success Indicator - Minimalist Checkmark */}
            {isCompleted && (
                <View className="absolute -bottom-1 -left-1 bg-green-increase rounded-full p-1 shadow-sm">
                    <Iconify icon="heroicons:check" size={10} color="white" />
                </View>
            )}
        </View>
    );
};