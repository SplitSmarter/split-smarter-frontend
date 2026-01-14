import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { CircularCarousel } from "@/src/components/camera/circularCarousel";
import { useIsFocused } from "@react-navigation/native";

export default function CameraScreen() {
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);

    const [mode, setMode] = useState("CAMERA");
    const captureButtonSize = 72;
    const isFocused = useIsFocused(); // 👈 track tab focus

    if (!permission) return <View className="flex-1 bg-black" />;

    if (!permission.granted) {
        return (
            <View className="flex-1 items-center justify-center bg-black">
                <Text className="text-white text-center mb-4">
                    We need your permission to show the camera
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-black/60 px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Pick from gallery
    const openImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            Alert.alert("📂 Selected", result.assets[0].uri);
        }
    };

    // Capture photo
    const capturePhoto = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            Alert.alert("📸 Captured", photo.uri);
        }
    };

    return (
        <View className="flex-1 bg-black">
            {/* Render camera only when focused */}
            {isFocused && (
                <CameraView ref={cameraRef} className="flex-1" facing={facing} />
            )}

            {/* Top Bar */}
            <View className="absolute top-10 left-0 right-0 flex-row justify-between px-6 z-10">
                {/* Flip camera */}
                <TouchableOpacity onPress={() => setFacing(f => (f === "back" ? "front" : "back"))}>
                    <View className="bg-green-500 w-9 h-9 rounded-full items-center justify-center">
                        <Text className="text-black text-base">↔️</Text>
                    </View>
                </TouchableOpacity>

                {/* Extra button */}
                <TouchableOpacity onPress={() => Alert.alert("⚙️ Extra action")}>
                    <View className="bg-red-400 w-9 h-9 rounded-full items-center justify-center">
                        <Text className="text-black text-base">⚙️</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View className="bg-black pt-2 pb-12">
                <View className="flex-row justify-between items-center px-8 mb-3">
                    {/* Gallery picker */}
                    <TouchableOpacity onPress={openImagePicker}>
                        <View className="bg-yellow-400 w-10 h-10 rounded-md items-center justify-center">
                            <Text className="text-black text-base">📁</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Capture button */}
                    <TouchableOpacity onPress={capturePhoto}>
                        <View
                            className="bg-white rounded-full border-4 border-gray-400"
                            style={{ width: captureButtonSize, height: captureButtonSize }}
                        />
                    </TouchableOpacity>

                    <View style={{ width: 40 }} />
                </View>

                <CircularCarousel data={["CAMERA", "QR", "NIGHT"]} onSelect={setMode} />
            </View>
        </View>
    );
}
