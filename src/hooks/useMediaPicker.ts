import * as ImagePicker from 'expo-image-picker';
import { useUploadStore } from '@/src/store/uploadStore';
import { permissionStore } from '@/src/store/permissionStore';

// Accept an optional configuration object to preserve backwards compatibility
export const useAssetPicker = (options?: { autoUpload?: boolean }) => {
    const autoUpload = options?.autoUpload ?? true;
    const addToQueue = useUploadStore((state) => state.addToQueue);
    const { camera, media, requestCamera, requestMedia } = permissionStore();

    const pickImage = async (useCamera: boolean, allowMultiple: boolean = false) => {
        const isGranted = useCamera
            ? (camera === 'granted' || await requestCamera())
            : (media === 'granted' || await requestMedia());

        if (!isGranted) return null;

        const mediaConfig = {
            mediaTypes: ['images'] as ImagePicker.MediaType[],
            quality: 0.6,
        };

        const result = await (useCamera
                ? ImagePicker.launchCameraAsync({
                    ...mediaConfig,
                    allowsEditing: !allowMultiple,
                    aspect: [1, 1],
                })
                : ImagePicker.launchImageLibraryAsync({
                    ...mediaConfig,
                    allowsMultipleSelection: allowMultiple,
                    selectionLimit: allowMultiple ? 10 : 1,
                })
        );

        if (result.canceled || !result.assets.length) return null;

        const uploadPromises = result.assets.map(async (asset) => {
            if (autoUpload) {
                const assetId = await addToQueue(asset.uri);
                return { uri: asset.uri, trackingId: assetId };
            } else {
                return { uri: asset.uri, trackingId: null };
            }
        });

        return await Promise.all(uploadPromises);
    };

    return {
        handleSingleCamera: () => pickImage(true, false),
        handleSingleGallery: () => pickImage(false, false),
        handleMultipleGallery: () => pickImage(false, true),
    };
};