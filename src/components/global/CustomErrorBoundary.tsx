import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Pressable, SafeAreaView } from 'react-native';
import { AppText } from '../common/AppText';
import { Iconify } from 'react-native-iconify';
import { COLORS } from '@/src/constants/colors';
import { logStore } from '@/src/store/logStore';

interface Props {
    children?: ReactNode; // Explicitly defined
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    errorCount: number; // Used as a key to force re-mounting
}

export class CustomErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        errorCount: 0,
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true, errorCount: 0 };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to your Zustand store
        logStore.getState().addLog({
            level: 'ERROR',
            message: error.message,
            context: {
                componentStack: errorInfo.componentStack,
                deviceTime: new Date().toISOString()
            },
        });
    }

    private handleReset = () => {
        // Incrementing the count can be used to reset the internal state
        this.setState((prevState) => ({
            hasError: false,
            errorCount: prevState.errorCount + 1
        }));
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
                    <View className="bg-red-50 dark:bg-red-900/10 p-6 rounded-full mb-6">
                        <Iconify icon="heroicons:exclamation-triangle" size={48} color={COLORS.color_red_decrease} />
                    </View>

                    <AppText variant="h2" className="text-center mb-2">Oops! Something went wrong</AppText>
                    <AppText className="text-center opacity-60 mb-8">
                        The app encountered an unexpected error. Don&#39;t worry, our team has been notified.
                    </AppText>

                    <Pressable
                        onPress={this.handleReset}
                        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                        className="bg-bg-secondary px-8 py-4 rounded-2xl shadow-sm"
                    >
                        <AppText className="text-white font-bold">Try Again</AppText>
                    </Pressable>
                </SafeAreaView>
            );
        }

        // Use the errorCount as a key to ensure a clean re-mount when resetting
        return <View key={this.state.errorCount} style={{ flex: 1 }}>{this.props.children}</View>;
    }
}