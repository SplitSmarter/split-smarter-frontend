import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AppText } from '@/src/components/common/AppText';
import { COLORS } from '@/src/constants/colors';

interface ProcessingOverlayProps {
    visible: boolean;
    isProcessing: boolean;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ visible, isProcessing }) => {
    if (!visible) return null;

    return (
        <View className="absolute inset-0 bg-black/70 z-50 items-center justify-center space-y-4">
            <ActivityIndicator size="large" color={COLORS.light.bg.canvas} />
            <AppText className="text-white font-semibold">
                {isProcessing ? "Parsing receipt records..." : "Uploading transaction data..."}
            </AppText>
        </View>
    );
};