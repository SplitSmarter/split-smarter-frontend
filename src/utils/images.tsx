import * as ImagePicker from 'expo-image-picker';

export const pickImage = async () => {
    // Request permissions (if not already granted)
    const { status: cameraRollStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraRollStatus !== 'granted' || cameraStatus !== 'granted') {
        alert('Permission to access camera or camera roll is required!');
        return;
    }

    // Pick an image from the library
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    // Or take a photo with the camera
    // let result = await ImagePicker.launchCameraAsync({
    //   allowsEditing: true,
    //   aspect: [4, 3],
    //   quality: 1,
    // });

    if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        // Now you have the URI of the selected image, ready for upload
        console.log('Selected image URI:', selectedImageUri);
    }
};
