import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Button } from "react-native";
import { getRelationsApi } from "@/src/api/relations/relation";
import { RelationItem } from "@/src/interfaces/relation";
import CustomAvatar from "@/src/components/common/CustomAvatar";
import {useUserStore} from "@/src/store/userStore";
import {RelationWithUserType} from "@/src/constants/expense";
import {ExpenseUser} from "@/src/interfaces/expense/expenseUser";

type Props = {
    type: "contributor" | "paid_by";
    onClose: () => void;
    onSelect: (user: ExpenseUser) => void;
    selectedUsers: ExpenseUser[];
};

export default function SelectUserModal({ type, onClose, onSelect, selectedUsers  }: Props) {
    const { user } = useUserStore();
    const [relations, setRelations] = useState<RelationItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRelations = async () => {
            try {
                setLoading(true);
                const res = await getRelationsApi({ offset: 0, limit: 20 });
                setRelations(res.data.relations);
            } catch (err) {
                console.error("Error fetching relations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRelations();
    }, []);

    const allUsers = [
        ...(user ? [{ with_user: user, id: `self-${user.id}` }] : []),
        ...relations,
    ].filter(
        (val, idx, arr) =>
            arr.findIndex((v) => v.with_user.id === val.with_user.id) === idx // remove duplicates
    );

    const renderRelation = ({ item }: { item: RelationItem }) => {
        const isSelected = selectedUsers.some((u) => u.id === item.with_user.id && u.user_type === item.with_user.type);

        return (

            <TouchableOpacity
                className="flex-row items-center border rounded-lg p-3 mb-3 bg-white"
                disabled={isSelected}
                onPress={() => onSelect(item.with_user)}
            >
                <CustomAvatar
                    name={item.with_user.name}
                    title={item.with_user.avatar_title}
                    url={item.with_user.avatar_url}
                    host={item.with_user.avatar_host}
                    host_type={item.with_user.avatar_host_type}
                    style={{width: 40, height: 40, borderRadius: 20, marginRight: 12}}
                    showTitle={false}
                />
                <Text className="text-black">{item.with_user.name}</Text>
            </TouchableOpacity>
        )
    };

    return (
        <View className="flex-1 bg-white p-4">
            <Text className="text-xl font-bold mb-4">
                Select {type === "contributor" ? "Contributor" : "Payer"}
            </Text>
            {loading ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    data={relations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderRelation}
                />
            )}
            <Button title="Close" onPress={onClose} />
        </View>
    );
}
