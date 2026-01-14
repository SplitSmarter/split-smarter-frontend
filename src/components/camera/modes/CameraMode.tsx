import React from "react";
import { CameraView, CameraType } from "expo-camera";
import { Image, View, TouchableOpacity } from "react-native";
import CustomText from "@/src/components/common/CustomText";

type Props = {
    cameraRef: any;
    facing: CameraType;
    selectedImage: string | null;
    onReset?: () => void; // for retake
};

export default function CameraMode({
                                       cameraRef,
                                       facing,
                                       selectedImage,
                                       onReset,
                                   }: Props) {
    return (
        <View className="flex-1">
            {/* Always show camera */}
            <CameraView ref={cameraRef} className="flex-1" facing={facing} onCameraReady={() => console.log("Camera ready!")} />

            {/* Overlay captured image if exists */}
            {selectedImage && (
                <View className="absolute top-0 left-0 right-0 bottom-0">
                    <Image
                        source={{ uri: selectedImage }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    {/* Retake button */}
                    <TouchableOpacity
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-500 px-4 py-2 rounded-lg"
                        onPress={onReset}
                    >
                        <CustomText className="text-white font-bold">Retake</CustomText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
