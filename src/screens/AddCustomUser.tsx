import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useAlert } from "@/src/context/alertContext";
import { addCustomUserApi } from "@/src/api/user/customuser";
import { getMyRelationshipsApi } from "@/src/api/relations/relationship";
import { Relationship } from "@/src/interfaces/relationship";
import CustomText from "@/src/components/common/CustomText";

interface AddCustomUserForm {
    name: string;
    relationshipId: number | null;
}

const AddCustomUserScreen = () => {
    const router = useRouter();
    const { showAlert } = useAlert();

    const [form, setForm] = useState<AddCustomUserForm>({
        name: "",
        relationshipId: null,
    });

    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingRelationships, setLoadingRelationships] = useState(false);

    useEffect(() => {
        const fetchRelationships = async () => {
            try {
                setLoadingRelationships(true);
                const res = await getMyRelationshipsApi();
                setRelationships(res.data.relationships);
            } catch (err: any) {
                showAlert(err.message || "Failed to load relationships", "error");
            } finally {
                setLoadingRelationships(false);
            }
        };
        fetchRelationships();
    }, []);

    const handleChange = (key: keyof AddCustomUserForm, value: any) => {
        setForm({ ...form, [key]: value });
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.relationshipId) {
            showAlert("Name and Relationship are required", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await addCustomUserApi({
                name: form.name.trim(),
                relationship_id: form.relationshipId,
            });
            showAlert(res.message, "success");
            setForm({ name: "", relationshipId: null });
            router.back(); // navigate back after success
        } catch (err: any) {
            showAlert(err.message || "Failed to create custom user", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-black p-6">
            <CustomText className="text-2xl font-bold mb-6 text-black dark:text-white">
                Add Custom User
            </CustomText>

            {/* Name */}
            <Text className="font-medium mb-2 text-black dark:text-white">
                Name *
            </Text>
            <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-md px-4 py-3 mb-4 text-black dark:text-white"
                placeholder="Enter custom user name"
                placeholderTextColor="#888"
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
            />

            {/* Relationship */}
            <Text className="font-medium mb-2 text-black dark:text-white">
                Relationship *
            </Text>
            {loadingRelationships ? (
                <ActivityIndicator size="small" />
            ) : (
                <View className="border border-gray-300 dark:border-gray-600 rounded-md mb-6">
                    <Picker
                        selectedValue={form.relationshipId}
                        onValueChange={(value) =>
                            handleChange("relationshipId", value)
                        }
                    >
                        <Picker.Item label="Select relationship" value={null} />
                        {relationships.map((rel) => (
                            <Picker.Item
                                key={rel.id}
                                label={rel.title}
                                value={rel.id}
                            />
                        ))}
                    </Picker>
                </View>
            )}

            {/* Save button */}
            <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                className={`py-3 rounded-lg ${
                    loading ? "bg-gray-400" : "bg-blue-600"
                }`}
            >
                <Text className="text-white text-center font-semibold">
                    {loading ? "Saving..." : "Save User"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default AddCustomUserScreen;
