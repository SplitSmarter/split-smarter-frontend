import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {ScopeMode} from '../types/spatialMap.types';
import {MemoryBasicDetails} from '@/src/api/dto/user/memory';

interface MapHeaderProps {
    insetsTop: number;
    scopeMode: ScopeMode;
    onSelectScopeMode: (scope: ScopeMode) => void;
    memories?: MemoryBasicDetails[] | Record<string, MemoryBasicDetails>;
    selectedMemoryId: string | null;
    onSelectMemory: (memoryId: string) => void;
    visibleTotal: number;
    onOpenLayerMenu: () => void;
    onInteraction?: () => void;
}

export function MapHeader({
    insetsTop,
    scopeMode,
    onSelectScopeMode,
    memories = [],
    selectedMemoryId,
    onSelectMemory,
    visibleTotal,
    onOpenLayerMenu,
    onInteraction,
}: MapHeaderProps) {
    const memoryList: MemoryBasicDetails[] = Array.isArray(memories)
        ? memories
        : Object.values(memories);

    return (
        <View
            style={{paddingTop: insetsTop + 8}}
            className="absolute top-0 left-0 right-0 z-10 px-4 bg-background/90 border-b border-border"
        >
            {/* SCOPE SELECTOR + SPENT + LAYERS */}
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row bg-muted p-1 rounded-xl">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            onInteraction?.();
                            onSelectScopeMode('general');
                        }}
                        className={`px-3 py-1.5 rounded-lg ${
                            scopeMode === 'general' ? 'bg-card' : 'bg-transparent'
                        }`}
                        style={scopeMode === 'general' ? styles.activeShadow : undefined}
                    >
                        <Text
                            className={`text-xs font-semibold ${
                                scopeMode === 'general' ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            General
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            onInteraction?.();
                            onSelectScopeMode('trip');
                        }}
                        className={`px-3 py-1.5 rounded-lg ${
                            scopeMode === 'trip' ? 'bg-card' : 'bg-transparent'
                        }`}
                        style={scopeMode === 'trip' ? styles.activeShadow : undefined}
                    >
                        <Text
                            className={`text-xs font-semibold ${
                                scopeMode === 'trip' ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            Memories
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center gap-2">
                    <View className="items-end">
                        <Text className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            Spent
                        </Text>
                        <Text className="text-sm font-bold text-foreground">
                            ₹{visibleTotal.toLocaleString()}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            onInteraction?.();
                            onOpenLayerMenu();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Open map preferences"
                        className="p-2 bg-secondary rounded-xl border border-border"
                    >
                        <Iconify icon="heroicons:cog-6-tooth" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* MEMORY SELECTION HORIZONTAL BAR */}
            {scopeMode === 'trip' && (
                <View className="mb-2.5 py-1">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {memoryList.map((memory) => {
                            const memoryIdStr = String(memory.id);
                            const isSelected = selectedMemoryId === memoryIdStr;
                            return (
                                <TouchableOpacity
                                    key={`memory-selector-${memory.id}`}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onInteraction?.();
                                        onSelectMemory(memoryIdStr);
                                    }}
                                    className={`mr-2 px-3 py-1.5 rounded-full border ${
                                        isSelected
                                            ? 'bg-primary border-primary'
                                            : 'bg-card border-border'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${
                                            isSelected ? 'text-primary-foreground' : 'text-foreground'
                                        }`}
                                    >
                                        {memory.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    activeShadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});
