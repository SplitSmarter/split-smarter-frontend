import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {
    AddExpenseForm,
    ItemsComponentDto,
    UserContributorsDto,
    UserPaidByDto,
} from "@/src/interfaces/expense";
import { ExpenseUser } from "@/src/interfaces/expense/expenseUser";
import {CurrencyType, ExpenseComponentType} from "@/src/constants/expense";
import {mapUsersToDto, validateExpense} from "@/src/utils/expenseUtils";
import {useDeviceStore} from "@/src/store/deviceStore";
import {AddExpenseApi} from "@/src/api/expense/expense";
import {useAlert} from "@/src/context/alertContext";
import SelectUserModal from "@/src/components/common/SelectUser";
import ExpenseCategorySelector from "@/src/components/expense/ExpenseCategorySelector";
import ExpenseItemForm from "@/src/components/expense/ExpenseItemForm";
import SaveButton from "@/src/components/common/SaveButton";
import UserList from "@/src/components/user/UserList";
import ExpenseServiceForm from "@/src/components/expense/ExpenseServiceForm";
import ExpenseTransferForm from "@/src/components/expense/ExpenseTransferForm";
import CustomText from "@/src/components/common/CustomText";

export default function AddExpenseScreen() {
    const [name, setName] = useState("");
    const {showAlert} = useAlert();
    const {platform} = useDeviceStore();
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState<ItemsComponentDto[]>([]);
    const [serviceDetail, setServiceDetail] = useState<any>();
    const [transferDetail, setTransferDetail] = useState<any>();
    const [componentType, setComponentType] = useState<ExpenseComponentType>(ExpenseComponentType.item);

    const [contributors, setContributors] = useState<ExpenseUser[]>([]);
    const [paidBy, setPaidBy] = useState<ExpenseUser[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<"contributor" | "paid_by">("contributor");

    const [error, setError] = useState<string | null>(null);
    const [showErrorDetail, setShowErrorDetail] = useState(false);

    useEffect(() => {
        const unlockedCount = contributors.filter(u => !u.locked).length;
        if (contributors.length === 1) {
            setContributors(prev =>
                prev.map(u => ({
                    ...u,
                    amount: parseFloat(amount) || 0,
                    locked: true,
                }))
            );
        } else if (contributors.length <= 2 && contributors.length > 0) {
            setContributors(prev => prev.map(u => ({...u, locked: true})));
        }
        if (unlockedCount === 1) {
            setContributors(prev => prev.map(u => ({...u, locked: true})));
        }
    }, [contributors.length, amount]);

    useEffect(() => {
        const unlockedCount = paidBy.filter(u => !u.locked).length;
        if (paidBy.length === 1) {
            setPaidBy(prev =>
                prev.map(u => ({
                    ...u,
                    amount: parseFloat(amount) || 0,
                    locked: true,
                }))
            );
        } else if (paidBy.length <= 2 && paidBy.length > 0) {
            setPaidBy(prev => prev.map(u => ({...u, locked: true})));
        }
        if (unlockedCount === 1) {
            setPaidBy(prev => prev.map(u => ({...u, locked: true})));
        }
    }, [paidBy.length, amount]);

    useEffect(() => {
        setError(validateExpense(amount, contributors, paidBy));
    }, [contributors, paidBy, amount]);

    const renderTypeSpecificForm = () => {
        switch (componentType) {
            case ExpenseComponentType.item:
                return <ExpenseItemForm selectedItems={selectedItems} setSelectedItems={setSelectedItems} setTotalAmount={setAmount} />;
            case ExpenseComponentType.service:
                return <ExpenseServiceForm serviceDetail={serviceDetail} setServiceDetail={setServiceDetail} />;
            case ExpenseComponentType.transfer:
                return <ExpenseTransferForm transferDetail={transferDetail} setTransferDetail={setTransferDetail} />;
            default:
                return null;
        }
    };

    const handleSave = async () => {
        if (error) {
            showAlert("Validation Error" + error, "error");
            return;
        }

        const total = parseFloat(amount);

        if (total <= 0) {
            showAlert("Total amount must be greater than 0", "error");
            return;
        }

        const contributorsDto = mapUsersToDto(contributors, total, "contributor") as UserContributorsDto[];
        const paidByDto = mapUsersToDto(paidBy, total, "paid_by") as UserPaidByDto[];

        const payload: AddExpenseForm = {
            name,
            description,
            expense_type: ExpenseComponentType.item,
            category_id: parseInt(categoryId, 10),
            currency: CurrencyType.inr,
            contributors: contributorsDto,
            paid_by_users: paidByDto,
            components: {
                type: ExpenseComponentType.item,
                items: selectedItems,
            },
        };


        try {
            setLoading(true);
            const res = await AddExpenseApi(payload);
            showAlert(res.message, "success");
            setName("");
            setDescription("");
            setAmount("");
            setCategoryId("");
            setContributors([]);
            setPaidBy([]);
        } catch (err: any) {
            showAlert(err.message || "Failed to create expense", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={platform === "ios" ? "padding" : "height"} // adjusts differently for iOS/Android
            keyboardVerticalOffset={platform === "ios" ? 80 : 160} // tweak depending on your header
        >
            <ScrollView className="flex-1 bg-white">
                <View className="bg-white p-4">
                    <Text className="text-xl font-bold mb-6">Add Expense</Text>

                    {/* Name */}
                    <Text className="font-medium">Name *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-2 mb-4"
                        placeholder="Enter expense name"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Description */}
                    <Text className="font-medium">Description</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-2 mb-4"
                        placeholder="Enter description (optional)"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <ExpenseCategorySelector categoryId={categoryId} setCategoryId={setCategoryId} />

                    <View className="flex-row mt-2">
                        {Object.values(ExpenseComponentType).map((t) => (
                            <TouchableOpacity
                                key={t}
                                className={`px-3 py-2 rounded-lg mr-2 ${t === componentType ? "bg-blue-500" : "bg-gray-200"}`}
                                onPress={() => setComponentType(t)}
                            >
                                <View className="flex-row items-center">
                                    <CustomText className={`${
                                        t === componentType ? "text-white" : "text-gray-800"
                                    }`}>{t}</CustomText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {renderTypeSpecificForm()}

                    {/* Amount */}
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-medium">Amount *</Text>
                    </View>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-2 mb-4"
                        placeholder="Enter amount"
                        value={amount}
                        editable={false}
                        onChangeText={val => {
                            setAmount(val);
                        }}
                        keyboardType="numeric"
                    />

                    <UserList
                        title="Contributors *"
                        type="contributor"
                        users={contributors}
                        setUsers={setContributors}
                        amount={amount}
                        openModal={() => {
                            setModalType("contributor");
                            setModalVisible(true);
                        }}
                    />

                    {/* Paid By */}
                    <UserList
                        title="Paid By *"
                        type="paid_by"
                        users={paidBy}
                        setUsers={setPaidBy}
                        amount={amount}
                        openModal={() => {
                            setModalType("paid_by");
                            setModalVisible(true);
                        }}
                    />

                    {/* Error & Save */}
                    {error && (
                        <View className="flex-row items-center mb-4">
                            <Ionicons
                                name="information-circle"
                                size={20}
                                color="red"
                                onPress={() => setShowErrorDetail(!showErrorDetail)}
                            />
                            <Text className="ml-2 text-red-600">Fix errors before saving</Text>
                        </View>
                    )}
                    {showErrorDetail && error && (
                        <Text className="text-sm text-red-500 mb-2">{error}</Text>
                    )}

                    <SaveButton onSave={handleSave} loading={loading} error={error} />

                    {/* User Select Modal */}
                    <Modal visible={modalVisible} animationType="slide">
                        <SelectUserModal
                            type={modalType}
                            selectedUsers={modalType === "contributor" ? contributors : paidBy}
                            onClose={() => setModalVisible(false)}
                            onSelect={(user: ExpenseUser) => {
                                if (modalType === "contributor") {
                                    setContributors((prev: ExpenseUser[]) =>
                                        prev.some((u) => u.id === user.id)
                                            ? prev
                                            : [...prev, {...user, amount: 0, locked: false}]
                                    );
                                } else {
                                    setPaidBy((prev: ExpenseUser[]) =>
                                        prev.some((u) => u.id === user.id)
                                            ? prev
                                            : [...prev, {...user, amount: 0, locked: false}]
                                    );
                                }
                                setModalVisible(false);
                            }}
                        />
                    </Modal>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
