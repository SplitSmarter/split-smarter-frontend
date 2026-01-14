import React, { useEffect, useState } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { getRelationsApi } from "@/src/api/relations/relation";
import { RelationItem } from "@/src/interfaces/relation";
import CustomText from "@/src/components/common/CustomText";
import CustomAvatar from "@/src/components/common/CustomAvatar";
import {ImageHostType} from "@/src/constants/images";

const RelationsScreen = () => {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [relations, setRelations] = useState<RelationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRelations = async () => {
        try {
            setLoading(true);
            const res = await getRelationsApi({ offset: 0, limit: 20 });
            setRelations(res.data.relations);
        } catch (err: any) {
            showAlert(err.message || "Failed to fetch relations", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRelations();
    }, []);

    const renderRelation = ({ item }: { item: RelationItem }) => (
        <TouchableOpacity
            className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4 bg-white dark:bg-gray-900"
            onPress={() => console.log("relation selected", item)}
        >
            {/* Avatar */}
            <CustomAvatar
                name={item.with_user.name}
                title={item.with_user.avatar_title}
                url={item.with_user.avatar_url}
                host={item.with_user.avatar_host}
                host_type={item.with_user.avatar_host_type}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                showTitle={false}
            />

            {/* Relation details */}
            <View className="flex-1">
                <CustomText className="text-lg font-semibold text-black dark:text-white">
                    {item.with_user.name}
                </CustomText>
                <CustomText className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.relationship?.title || "No relationship"}
                </CustomText>
                <CustomText className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                </CustomText>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white dark:bg-black p-6">
            <CustomText className="text-2xl font-bold mb-6 text-black dark:text-white">
                My Relations
            </CustomText>

            {loading ? (
                <ActivityIndicator size="large" className="mt-10" />
            ) : (
                <FlatList
                    data={relations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderRelation}
                    ListEmptyComponent={
                        <CustomText className="text-gray-500 dark:text-gray-400 text-center mt-10">
                            No relations found
                        </CustomText>
                    }
                />
            )}
        </View>
    );
};

export default RelationsScreen;
