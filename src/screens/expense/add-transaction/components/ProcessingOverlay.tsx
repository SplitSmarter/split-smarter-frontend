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

    // Overlay is always dark chrome — use light contrast tokens for spinner/label
    const contrast = COLORS.light.text.contrast;

    return (
        <View
            className="absolute inset-0 z-50 items-center justify-center"
            style={{backgroundColor: 'rgba(7, 9, 14, 0.82)'}}
        >
            <ActivityIndicator size="large" color={contrast} />
            <AppText className="mt-4 font-semibold" style={{color: contrast}}>
                {isProcessing ? "Parsing receipt records..." : "Uploading transaction data..."}
            </AppText>
        </View>
    );
};
