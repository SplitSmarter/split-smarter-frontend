import React, {useState} from 'react';
import {View, ScrollView, Pressable, ActivityIndicator} from 'react-native';
import {useUploadStore} from '@/src/store/uploadStore';
import {permissionStore} from '@/src/store/permissionStore';
import {AppText} from '@/src/components/common/AppText';
import {AppImage} from '@/src/components/common/AppImage';
import {Iconify} from 'react-native-iconify';
import {useAssetPicker} from "@/src/hooks/useMediaPicker";
import {MediaPickerBottomSheet} from "@/src/components/common/MediaPickerBottomSheet";
import {CategoryGroupLocationSelector} from "@/src/screens/expense/CGLSelector";

export default function AssetTestingScreen() {
    const {handleSingleCamera, handleSingleGallery, handleMultipleGallery} = useAssetPicker();
    const queue = useUploadStore((state) => state.queue);
    const {camera, media, syncPermissions} = permissionStore();

    const [isProcessing, setIsProcessing] = useState(false);

    const renderStatus = (status: string) => {
        const color = status === 'granted' ? 'text-emerald-500' : 'text-red-500';
        return <AppText className={`${color} font-bold`}>{status.toUpperCase()}</AppText>;
    };
    const [pickerVisible, setPickerVisible] = useState(false);

    const runTestAction = async (action: () => Promise<any>) => {
        // setIsProcessing removed for brevity
        await action();
    };

    const handleMediaSelection = async (fromCamera: boolean) => {
        setPickerVisible(false); // Close modal first
        if (fromCamera) {
            await runTestAction(handleSingleCamera);
        } else {
            await runTestAction(handleSingleGallery);
        }
    };



    return (
        <View style={{ flex: 1 }}>
            <ScrollView className="flex-1 bg-background p-4 pt-12">
                <AppText variant="h2" className="mb-6 font-bold text-text-primary">Asset System Test</AppText>

                {/* --- SECTION 1: Permissions --- */}
                <View className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-3xl mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <AppText variant="h4" className="text-text-primary">Permissions</AppText>
                        <Pressable onPress={syncPermissions}>
                            <Iconify icon="heroicons:arrow-path" size={20} color="#059669"/>
                        </Pressable>
                    </View>
                    <View className="gap-y-2">
                        <View className="flex-row justify-between">
                            <AppText className="text-text-secondary">Camera:</AppText>
                            {renderStatus(camera)}
                        </View>
                        <View className="flex-row justify-between">
                            <AppText className="text-text-secondary">Gallery:</AppText>
                            {renderStatus(media)}
                        </View>
                    </View>
                </View>

                {/* --- SECTION 2: Trigger Buttons --- */}
                <View className="gap-y-3 mb-6">
                    <TestButton
                        title="Take Single Photo"
                        icon={<Iconify icon="heroicons:camera" size={22} color="white"/>}
                        onPress={() => runTestAction(handleSingleCamera)}
                    />
                    <TestButton
                        title="Select Single Gallery"
                        icon={<Iconify icon="heroicons:photo" size={22} color="white"/>}
                        onPress={() => runTestAction(handleSingleGallery)}
                    />
                    <TestButton
                        title="Select Image (Modal)"
                        icon={<Iconify icon="heroicons:plus-circle" size={22} color="white"/>}
                        onPress={() => setPickerVisible(true)}
                    />
                    <TestButton
                        title="Batch Select (Gallery)"
                        icon={<Iconify icon="heroicons:squares-2x2" size={22} color="white"/>}
                        onPress={() => runTestAction(handleMultipleGallery)}
                    />
                    <TestButton
                        title="Select Image (Modal)"
                        icon={<Iconify icon="heroicons:plus-circle" size={22} color="white"/>}
                        onPress={() => {
                            setPickerVisible(true);
                        }}
                    />
                </View>

                {/* --- SECTION 3: Live Upload Queue --- */}
                <View className="flex-row justify-between items-center mb-4">
                    <AppText variant="h4" className="text-text-primary">Live Upload Queue</AppText>
                    <AppText variant="caption-xs" className="text-text-secondary">
                        {Object.values(queue).length} Items
                    </AppText>
                </View>

                {Object.values(queue).length === 0 ? (
                    <View
                        className="py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl items-center border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Iconify icon="heroicons:cloud-arrow-up" size={32} color="#666"/>
                        <AppText className="text-text-secondary italic mt-2">No uploads in current session.</AppText>
                    </View>
                ) : (
                    <View className="gap-y-3 mb-20">
                        {Object.values(queue).reverse().map((task) => (
                            <View
                                key={task.id}
                                className="bg-white dark:bg-zinc-900 p-3 rounded-2xl flex-row items-center border border-zinc-100 dark:border-zinc-800 shadow-sm"
                                style={{height: 72}} // Enforce a fixed height for the row
                            >
                                {/* Fixed Square Image Container */}
                                <View
                                    className="w-14 h-14 rounded-xl overflow-hidden mr-4 bg-zinc-200 dark:bg-zinc-800">
                                    <AppImage
                                        // Use remoteUrl if completed, otherwise fallback to local uri
                                        id={task.id}
                                        url={task.status === 'completed' ? task.remoteUrl : task.uri}
                                        size="full"
                                    />
                                </View>

                                <View className="flex-1 justify-center">
                                    <AppText variant="body-base" className="text-text-primary font-medium" numberOfLines={1}>
                                        {task.assetId ? `Asset: ${task.assetId.slice(-8)}` : `Local: ${task.id}`}
                                    </AppText>

                                    <View className="flex-row items-center mt-1">
                                        <View className={`w-2 h-2 rounded-full mr-2 ${
                                            task.status === 'completed' ? 'bg-emerald-500' :
                                                task.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                                        }`}/>
                                        <AppText variant="caption-xs"
                                                 className="uppercase tracking-wider font-bold text-text-secondary">
                                            {task.status}
                                        </AppText>
                                    </View>
                                </View>

                                <View className="ml-2">
                                    {task.status === 'uploading' ? (
                                        <ActivityIndicator size="small" color="#059669"/>
                                    ) : task.status === 'completed' ? (
                                        <Iconify icon="heroicons:check-circle" size={24} color="#10b981"/>
                                    ) : (
                                        <Iconify icon="heroicons:exclamation-circle" size={24} color="#ef4444"/>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
            <MediaPickerBottomSheet
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleMediaSelection}
            />
        </View>
    );
}

// Fixed TestButton component
const TestButton = ({title, icon, onPress}: { title: string, icon: React.ReactNode, onPress: () => void }) => (
    <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between bg-emerald-700 p-4 rounded-2xl active:opacity-80 shadow-sm"
    >
        <View className="flex-row items-center">
            {icon}
            <AppText className="text-white ml-3 font-medium">{title}</AppText>
        </View>
        <Iconify icon="heroicons:chevron-right" size={20} color="white"/>
    </Pressable>
);