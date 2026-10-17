import React from 'react';
import {View} from 'react-native';

interface SurfaceCardProps {
    children: React.ReactNode;
    className?: string;
}

export function SurfaceCard({children, className = ''}: SurfaceCardProps) {
    return (
        <View
            className={`overflow-hidden rounded-[28px] border border-border-input bg-bg-canvas ${className}`}
        >
            {children}
        </View>
    );
}
