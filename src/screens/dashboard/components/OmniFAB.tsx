import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {Feather} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {useRouter} from 'expo-router';

export const OmniFAB: React.FC = () => {
    const router = useRouter();

    return (
        <View className="absolute bottom-24 right-6 z-50 items-end">
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/expense/add')}
                accessibilityRole="button"
                accessibilityLabel="Add expense"
                className="overflow-hidden rounded-full shadow-2xl"
            >
                <LinearGradient
                    colors={['#E07A2F', '#CC5500']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    className="h-14 w-14 items-center justify-center"
                    style={{
                        width: 56,
                        height: 56,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 28,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.35)',
                    }}
                >
                    <Feather name="plus" size={26} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};
