import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import CustomAvatar from "@/src/components/common/CustomAvatar";
import { toggleLock, removeUser, amountUpdate } from "@/src/utils/expenseUtils";

interface Props {
    title: string;
    type: "contributor" | "paid_by";
    users: any[];
    setUsers: (users: any[]) => void;
    amount: string;
    setAmount: (val: string) => void;
    openModal: () => void;
}

export default function UserList({
                                     title,
                                     type,
                                     users,
                                     setUsers,
                                     amount,
                                     openModal,
                                 }: Props) {
    const formatNumber = (num: number) => {
        if (isNaN(num)) return "";
        return parseFloat(num.toFixed(2)).toString();
    };

    const renderUser = (user: any) => {
        const total = parseFloat(amount) || 0;
        const percentage = total > 0 ? formatNumber(((user.amount || 0) / total) * 100) : "";

        const handleAmountUpdate = (newAmount: number) => {
            amountUpdate(user, newAmount, amount, users, setUsers);
        };

        return (
            <View
                key={user.id}
                className="flex-row items-center border rounded-lg p-2 mb-2 bg-gray-50 justify-between"
            >
                {/* Avatar + Name */}
                <View className="flex-row items-center">
                    <CustomAvatar
                        name={user.name}
                        title={user.avatar_title}
                        url={user.avatar_url}
                        host={user.avatar_host}
                        host_type={user.avatar_host_type}
                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
                        showTitle={false}
                    />
                    <Text>{user.name}</Text>
                </View>

                {/* Amount + Percentage + Actions */}
                <View className="flex-row items-center">
                    <TextInput
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-right"
                        keyboardType="numeric"
                        value={user.amount !== undefined ? formatNumber(user.amount) : ""}
                        editable={!user.locked}
                        onChangeText={(val) => {
                            const parsed = Number(val);
                            const newAmount = isNaN(parsed) ? 0 : parsed; // ensure it's a number
                            handleAmountUpdate(newAmount);
                        }}
                    />
                    <TextInput
                        className="ml-2 border border-gray-300 rounded px-2 py-1 w-16 text-right"
                        keyboardType="numeric"
                        value={percentage.toString()}
                        editable={!user.locked}
                        onChangeText={(val) => {
                            const perc = parseFloat(val) || 0;
                            const newAmount = (perc / 100) * (parseFloat(amount) || 0);
                            handleAmountUpdate(newAmount);
                        }}
                    />
                    <Text className="ml-1 text-gray-600 text-sm">%</Text>

                    {/* Lock */}
                    <TouchableOpacity
                        className={`ml-2 px-2 py-1 rounded ${user.locked ? "bg-red-500" : "bg-gray-400"}`}
                        onPress={() => toggleLock(users, setUsers, user.id)}
                    >
                        <Text className="text-white text-xs">{user.locked ? "Unlock" : "Lock"}</Text>
                    </TouchableOpacity>

                    {/* Remove */}
                    <TouchableOpacity
                        className="ml-2 bg-red-600 px-2 py-1 rounded"
                        onPress={() => removeUser(user.id, type, users, setUsers, [], setUsers)}
                    >
                        <Text className="text-white text-xs">X</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="mb-4">
            <Text className="font-medium mb-2">{title}</Text>
            {users.map((u) => renderUser(u))}
            <TouchableOpacity
                className="bg-blue-500 rounded-lg py-2 px-3"
                onPress={openModal}
            >
                <Text className="text-white text-center">+ Add {title}</Text>
            </TouchableOpacity>
        </View>
    );
}
