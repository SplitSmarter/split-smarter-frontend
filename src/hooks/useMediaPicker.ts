import * as ImagePicker from 'expo-image-picker';
import {useUploadStore} from '@/src/store/uploadStore';
import {permissionStore} from '@/src/store/permissionStore';

export const useAssetPicker = () => {
    const addToQueue = useUploadStore((state) => state.addToQueue);
    const {camera, media, requestCamera, requestMedia} = permissionStore();

    const pickImage = async (useCamera: boolean, allowMultiple: boolean = false) => {
        const isGranted = useCamera
            ? (camera === 'granted' || await requestCamera())
            : (media === 'granted' || await requestMedia());

        if (!isGranted) return null;

        // Use array of strings to avoid deprecation and type issues
        const mediaConfig = {
            mediaTypes: ['images'] as ImagePicker.MediaType[], // Fixes the warning
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
            const assetId = await addToQueue(asset.uri);
            return {uri: asset.uri, assetId};
        });

        return await Promise.all(uploadPromises);
    };

    return {
        handleSingleCamera: () => pickImage(true, false),
        handleSingleGallery: () => pickImage(false, false),
        handleMultipleGallery: () => pickImage(false, true),
    };
};