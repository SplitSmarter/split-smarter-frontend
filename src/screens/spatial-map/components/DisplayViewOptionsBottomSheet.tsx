import React, {useCallback, useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {MemoryBasicDetails} from '@/src/api/dto/user/memory';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {ScopeMode} from '../types/spatialMap.types';
import {SectionLabel} from './venue-details/SectionLabel';
import {VenueSheetHeader} from './venue-details/VenueSheetHeader';

const SNAP_POINTS = ['55%', '78%'] as const;

interface DisplayViewOptionsBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    memories: MemoryBasicDetails[];
    selectedMemoryId: string | null;
    scopeMode: ScopeMode;
    onSelectMemory: (memoryId: string) => void;
    onSelectAllSpend: () => void;
}

function formatMemoryMeta(memory: MemoryBasicDetails): string {
    const fmt = (iso?: string) => {
        if (!iso) return null;
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
    };
    const start = fmt(memory.start_at);
    const end = fmt(memory.end_at);
    if (start && end) return `${start} – ${end}`;
    if (start) return start;
    return memory.description?.trim() || 'Memory';
}

export function DisplayViewOptionsBottomSheet({
    isVisible,
    onClose,
    memories,
    selectedMemoryId,
    scopeMode,
    onSelectMemory,
    onSelectAllSpend,
}: DisplayViewOptionsBottomSheetProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const sheetRef = React.useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => [...SNAP_POINTS], []);

    React.useEffect(() => {
        if (isVisible) {
            sheetRef.current?.present();
        } else {
            sheetRef.current?.dismiss();
        }
    }, [isVisible]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.72 : 0.38}
            />
        ),
        [isDark]
    );

    const handleSelectMemory = useCallback(
        (id: string) => {
            onSelectMemory(id);
            onClose();
        },
        [onClose, onSelectMemory]
    );

    const handleAllSpend = useCallback(() => {
        onSelectAllSpend();
        onClose();
    }, [onClose, onSelectAllSpend]);

    const allSpendSelected = scopeMode === 'general';

    return (
        <BottomSheetModal
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            backgroundStyle={{
                backgroundColor: colors.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: colors.icon.lighter,
                width: 40,
                height: 5,
            }}
        >
            <View className="flex-1">
                <VenueSheetHeader
                    title="Memories"
                    subtitle="Filter the map to a trip"
                    showBack={false}
                    onBack={() => {}}
                    onClose={onClose}
                />
                <View className="mx-6 h-px bg-border-input" />

                <BottomSheetScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingTop: 20,
                        paddingBottom: 40,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <SectionLabel>Scope</SectionLabel>
                    <AppText
                        variant="body-xs"
                        className="mb-3 text-text-primary-lighter"
                    >
                        Filter the map to a trip, or show all non-memory spend
                    </AppText>

                    <View className="gap-2">
                        <Pressable
                            onPress={handleAllSpend}
                            accessibilityRole="button"
                            accessibilityState={{selected: allSpendSelected}}
                            accessibilityLabel="Show all spend"
                            className={`flex-row items-center rounded-2xl border px-3 py-3 ${
                                allSpendSelected
                                    ? 'border-accent-sky bg-accent-sky-bg'
                                    : 'border-border-input bg-bg-canvas'
                            }`}
                        >
                            <View
                                className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${
                                    allSpendSelected
                                        ? 'bg-accent-sky/20'
                                        : 'bg-bg-primary'
                                }`}
                            >
                                <Iconify
                                    icon="heroicons:globe-alt"
                                    size={20}
                                    color={colors.accent.sky}
                                />
                            </View>
                            <View className="min-w-0 flex-1">
                                <AppText
                                    variant="body-base"
                                    className="font-semibold text-text-primary"
                                >
                                    All spend
                                </AppText>
                                <AppText
                                    variant="body-xs"
                                    className="text-text-primary-lighter"
                                >
                                    Everyday expenses outside memories
                                </AppText>
                            </View>
                            {allSpendSelected ? (
                                <Iconify
                                    icon="heroicons:check"
                                    size={18}
                                    color={colors.accent.sky}
                                />
                            ) : null}
                        </Pressable>

                        {memories.length === 0 ? (
                            <AppText
                                variant="body-xs"
                                className="py-3 text-center text-text-primary-lighter"
                            >
                                No memories yet
                            </AppText>
                        ) : (
                            memories.map((memory) => {
                                const idStr = String(memory.id);
                                const isSelected =
                                    scopeMode === 'trip' &&
                                    selectedMemoryId === idStr;
                                return (
                                    <Pressable
                                        key={`memory-option-${memory.id}`}
                                        onPress={() => handleSelectMemory(idStr)}
                                        accessibilityRole="button"
                                        accessibilityState={{selected: isSelected}}
                                        accessibilityLabel={`Show ${memory.title}`}
                                        className={`flex-row items-center rounded-2xl border px-3 py-3 ${
                                            isSelected
                                                ? 'border-accent-sky bg-accent-sky-bg'
                                                : 'border-border-input bg-bg-canvas'
                                        }`}
                                    >
                                        <View
                                            className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${
                                                isSelected
                                                    ? 'bg-accent-sky/20'
                                                    : 'bg-bg-primary'
                                            }`}
                                        >
                                            <Iconify
                                                icon="heroicons:photo"
                                                size={20}
                                                color={colors.accent.sky}
                                            />
                                        </View>
                                        <View className="min-w-0 flex-1">
                                            <AppText
                                                variant="body-base"
                                                className="font-semibold text-text-primary"
                                                numberOfLines={1}
                                            >
                                                {memory.title}
                                            </AppText>
                                            <AppText
                                                variant="body-xs"
                                                className="text-text-primary-lighter"
                                                numberOfLines={1}
                                            >
                                                {formatMemoryMeta(memory)}
                                            </AppText>
                                        </View>
                                        {isSelected ? (
                                            <Iconify
                                                icon="heroicons:check"
                                                size={18}
                                                color={colors.accent.sky}
                                            />
                                        ) : null}
                                    </Pressable>
                                );
                            })
                        )}
                    </View>
                </BottomSheetScrollView>
            </View>
        </BottomSheetModal>
    );
}
