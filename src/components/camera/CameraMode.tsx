import React from "react";
import { CameraView, CameraType } from "expo-camera";
import { Image } from "react-native";

type Props = {
    cameraRef: any;
    facing: CameraType;
    selectedImage: string | null;
};

export default function CameraMode({ cameraRef, facing, selectedImage }: Props) {
    if (selectedImage) {
        return (
            <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="cover"
            />
        );
    }
    return <CameraView ref={cameraRef} className="flex-1" facing={facing} />;
}
