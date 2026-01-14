import React from "react";
import { CameraView } from "expo-camera";
import CameraBase from "@/src/screens/camera/CameraBase";
import CustomText from "@/src/components/common/CustomText";

export default function NightScreen() {
    return (
        <CameraBase
            mode="NIGHT"
            onModeChange={(m) => console.log("Mode changed:", m)}
            renderMode={(cameraRef) => (
                <CameraView ref={cameraRef} className="flex-1">
                    <CustomText className="absolute top-1/2 self-center text-yellow-400 text-2xl">
                        🌙 Night Mode
                    </CustomText>
                </CameraView>
            )}
        />
    );
}
