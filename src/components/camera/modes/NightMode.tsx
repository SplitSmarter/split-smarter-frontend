import React from "react";
import { CameraView, CameraType } from "expo-camera";
import CustomText from "@/src/components/common/CustomText";

type Props = { cameraRef: any; facing: CameraType };

export default function NightMode({ cameraRef, facing }: Props) {
    return (
        <CameraView ref={cameraRef} className="flex-1" facing={facing}>
            <CustomText className="absolute top-1/2 self-center text-yellow-400 text-2xl">
                🌙 Night Mode
            </CustomText>
        </CameraView>
    );
}
