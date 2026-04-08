import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { deleteAccount, disableAccount, getUserProfile, UserProfile } from "@/services/userServices";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeValue(value: any, fallback: string = "N/A"): string {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
}

function safeConcatenated(
    values: (string | undefined | null)[],
    separator: string = " ",
    fallback: string = "N/A",
): string {
    const filtered = values.filter(
        (v) => v !== undefined && v !== null && v !== "",
    );
    return filtered.length > 0 ? filtered.join(separator) : fallback;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between items-start py-3 border-b border-gray-100">
            <Text className="text-sm font-latoBold text-gray-600 flex-1">
                {label}
            </Text>
            <Text className="text-sm font-lato text-gray-900 flex-1 text-right">
                {value}
            </Text>
        </View>
    );
}

function SectionCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
            <View className="bg-[#26062b] px-4 py-2.5">
                <Text className="text-white text-sm font-latoBold uppercase tracking-wide">
                    {title}
                </Text>
            </View>
            <View className="px-4">{children}</View>
        </View>
    );
}

function ProfileSkeleton() {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#49214c" />
            <Text className="text-gray-500 font-lato mt-3 text-sm">
                Loading Profile...
            </Text>
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ProfileScreen() {
    const { logout, isAuthenticated } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [disablingAccount, setDisablingAccount] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteConfirmations, setDeleteConfirmations] = useState({
        understand: false,
        noRecovery: false,
        loseData: false,
        loseAccess: false,
    });
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const fetchProfile = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getUserProfile();
            if (res.success) {
                setUser(res.data.user);
            }
        } catch (err: any) {
            Alert.alert(
                "Error",
                typeof err === "string" ? err : "Failed to load profile",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile(true);
    }, [fetchProfile]);

    const defaultBillingAddress =
        user?.billingAddress?.find((addr) => addr.isDefault === "Y") ||
        user?.billingAddress?.[0];
    const defaultShippingAddress =
        user?.shippingAddress?.find((addr) => addr.isDefault === "Y") ||
        user?.shippingAddress?.[0];

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        setLoggingOut(true);
                        await logout();
                    } catch (err: any) {
                        Alert.alert(
                            "Error",
                            typeof err === "string"
                                ? err
                                : "Failed to logout. Please try again.",
                        );
                    } finally {
                        setLoggingOut(false);
                    }
                },
            },
        ]);
    };

    const allDeleteConfirmationsChecked =
        deleteConfirmations.understand &&
        deleteConfirmations.noRecovery &&
        deleteConfirmations.loseData &&
        deleteConfirmations.loseAccess;

    const handleOpenDeleteModal = () => {
        setDeleteStep(1);
        setDeleteConfirmations({
            understand: false,
            noRecovery: false,
            loseData: false,
            loseAccess: false,
        });
        setDeleteConfirmText("");
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteStep(1);
        setDeleteConfirmations({
            understand: false,
            noRecovery: false,
            loseData: false,
            loseAccess: false,
        });
        setDeleteConfirmText("");
    };

    const handleDeleteAccount = async () => {
        if (!allDeleteConfirmationsChecked || deleteConfirmText !== "DELETE") return;
        setIsDeletingAccount(true);
        try {
            await deleteAccount();
            handleCloseDeleteModal();
            Alert.alert(
                "Account Deleted",
                "Your account has been permanently deleted.",
                [{ text: "OK", onPress: () => logout() }],
            );
        } catch (err: any) {
            Alert.alert(
                "Error",
                typeof err === "string"
                    ? err
                    : "Failed to delete account. Please try again.",
            );
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const toggleConfirmation = (key: keyof typeof deleteConfirmations) => {
        setDeleteConfirmations((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDisableAccount = () => {
        Alert.alert(
            "Disable Account",
            "Are you sure you want to disable your account? You can request reactivation anytime by contacting our admin team.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Disable",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDisablingAccount(true);
                            await disableAccount();
                            Alert.alert(
                                "Account Disabled",
                                "Your account has been disabled. You can request reactivation anytime.",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => logout(),
                                    },
                                ],
                            );
                        } catch (err: any) {
                            Alert.alert(
                                "Error",
                                typeof err === "string"
                                    ? err
                                    : "Failed to disable account. Please try again.",
                            );
                        } finally {
                            setDisablingAccount(false);
                        }
                    },
                },
            ],
        );
    };

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppHeader />

            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 items-center justify-center rounded-full border border-gray-200 mr-3"
                >
                    <Ionicons name="arrow-back" size={20} color="#49214c" />
                </TouchableOpacity>
                <Text className="text-2xl font-loraBold text-primary-purple">
                    My Profile
                </Text>
            </View>

            {loading ? (
                <ProfileSkeleton />
            ) : !user ? (
                <View className="flex-1 items-center justify-center gap-4 px-8">
                    <Ionicons name="person-outline" size={72} color="#d1d5db" />
                    <Text className="text-lg font-latoBold text-gray-400">
                        Unable to load profile
                    </Text>
                    <TouchableOpacity
                        onPress={() => fetchProfile()}
                        className="mt-2 bg-primary-purple px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-latoBold text-sm">
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 bg-gray-50"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#49214c"
                        />
                    }
                >
                    {/* ── Profile Avatar & Name ── */}
                    <View className="bg-white px-4 py-6 items-center border-b border-gray-100">
                        <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-3 overflow-hidden">
                            <Ionicons name="person" size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-loraBold text-gray-900">
                            {safeValue(user.username)}
                        </Text>
                        <Text className="text-sm font-lato text-gray-500 mt-1">
                            {safeValue(user.email)}
                        </Text>
                    </View>

                    <View className="px-4 pt-4">
                        {/* ── Account Information ── */}
                        <SectionCard title="Account Information">
                            <InfoRow
                                label="Username"
                                value={safeValue(user.username)}
                            />
                            <InfoRow
                                label="Email Address"
                                value={safeValue(user.email)}
                            />
                            <InfoRow
                                label="Status"
                                value={safeValue(user.status)}
                            />
                            <InfoRow
                                label="Role"
                                value={safeValue(user.role)}
                            />
                            <InfoRow
                                label="Member Since"
                                value={
                                    user.createdAt
                                        ? new Date(
                                              user.createdAt,
                                          ).toLocaleDateString()
                                        : "N/A"
                                }
                            />
                        </SectionCard>

                        {/* ── Personal Information ── */}
                        <SectionCard title="Personal Information">
                            <InfoRow
                                label="Name"
                                value={safeConcatenated([
                                    user.customerData?.firstName,
                                    user.customerData?.lastName,
                                ])}
                            />
                            <InfoRow
                                label="Phone"
                                value={safeConcatenated([
                                    user.customerData?.countryCode,
                                    user.customerData?.phoneNumber,
                                ])}
                            />
                            <InfoRow
                                label="Landline"
                                value={safeValue(
                                    user.customerData?.landlineNumber,
                                )}
                            />
                            <InfoRow
                                label="Birth Date"
                                value={
                                    user.customerData?.birthDate
                                        ? new Date(
                                              user.customerData.birthDate,
                                          ).toLocaleDateString()
                                        : "N/A"
                                }
                            />
                            <InfoRow
                                label="My Address"
                                value={safeConcatenated(
                                    [
                                        user.customerData?.address?.street,
                                        user.customerData?.address?.city,
                                        user.customerData?.address?.state,
                                        user.customerData?.address?.postalCode,
                                        user.customerData?.address?.country,
                                    ],
                                    ", ",
                                )}
                            />
                        </SectionCard>

                        {/* ── Company Information ── */}
                        <SectionCard title="Company Information">
                            <InfoRow
                                label="Company Name"
                                value={safeValue(user.companyName)}
                            />
                            <InfoRow
                                label="Contact Name"
                                value={safeValue(user.contactName)}
                            />
                            <InfoRow
                                label="Currency"
                                value={safeValue(user.currency)}
                            />
                            <InfoRow
                                label="Company Group"
                                value={safeValue(user.companyGroup)}
                            />
                            <InfoRow
                                label="Firm Reg No"
                                value={safeValue(user.firmRegNo)}
                            />
                            <InfoRow
                                label="Default Terms"
                                value={safeValue(user.defaultTerms)}
                            />
                            <InfoRow
                                label="Credit Limit"
                                value={
                                    user.currency && user.creditLimit
                                        ? `${user.currency} ${user.creditLimit}`
                                        : "N/A"
                                }
                            />
                            <InfoRow
                                label="Annual Target"
                                value={
                                    user.currency && user.annualTarget
                                        ? `${user.currency} ${user.annualTarget}`
                                        : "N/A"
                                }
                            />
                            <InfoRow
                                label="Remarks"
                                value={safeValue(user.remarks)}
                            />
                        </SectionCard>

                        {/* ── Business Information ── */}
                        <SectionCard title="Business Information">
                            <InfoRow
                                label="Business Type"
                                value={safeValue(
                                    user.customerData?.businessInfo
                                        ?.businessType,
                                )}
                            />
                            <InfoRow
                                label="VAT Number"
                                value={safeValue(
                                    user.customerData?.businessInfo?.vatNumber,
                                )}
                            />
                            <InfoRow
                                label="Website"
                                value={safeValue(
                                    user.customerData?.businessInfo?.websiteUrl,
                                )}
                            />
                        </SectionCard>

                        {/* ── Contact Details ── */}
                        <SectionCard title="Contact Details">
                            <InfoRow
                                label="Contact Name"
                                value={safeValue(
                                    user.contactDetail?.contactName,
                                )}
                            />
                            <InfoRow
                                label="Designation"
                                value={safeValue(
                                    user.contactDetail?.designation,
                                )}
                            />
                            <InfoRow
                                label="Business Tel 1"
                                value={safeValue(
                                    user.contactDetail?.businessTel1,
                                )}
                            />
                            <InfoRow
                                label="Business Tel 2"
                                value={safeValue(
                                    user.contactDetail?.businessTel2,
                                )}
                            />
                            <InfoRow
                                label="Business Fax"
                                value={safeValue(
                                    user.contactDetail?.businessFax,
                                )}
                            />
                            <InfoRow
                                label="Mobile"
                                value={safeValue(user.contactDetail?.mobileNo)}
                            />
                            <InfoRow
                                label="Personal"
                                value={safeValue(
                                    user.contactDetail?.personalNo,
                                )}
                            />
                            <InfoRow
                                label="Email"
                                value={safeValue(user.contactDetail?.email)}
                            />
                        </SectionCard>

                        {/* ── Billing Address ── */}
                        {defaultBillingAddress && (
                            <SectionCard title="Billing Address">
                                <InfoRow
                                    label="Print Name"
                                    value={safeValue(
                                        defaultBillingAddress.printName,
                                    )}
                                />
                                <InfoRow
                                    label="Address"
                                    value={safeConcatenated(
                                        [
                                            defaultBillingAddress.street,
                                            defaultBillingAddress.city,
                                            defaultBillingAddress.state,
                                            defaultBillingAddress.zipCode,
                                            defaultBillingAddress.country,
                                        ],
                                        ", ",
                                    )}
                                />
                                <InfoRow
                                    label="VAT No"
                                    value={safeValue(
                                        defaultBillingAddress.vat_No,
                                    )}
                                />
                                <InfoRow
                                    label="GSTN No"
                                    value={safeValue(
                                        defaultBillingAddress.gstn_No,
                                    )}
                                />
                            </SectionCard>
                        )}

                        {/* ── Shipping Address ── */}
                        {defaultShippingAddress && (
                            <SectionCard title="Shipping Address">
                                <InfoRow
                                    label="Print Name"
                                    value={safeValue(
                                        defaultShippingAddress.printName,
                                    )}
                                />
                                <InfoRow
                                    label="Address"
                                    value={safeConcatenated(
                                        [
                                            defaultShippingAddress.street,
                                            defaultShippingAddress.city,
                                            defaultShippingAddress.state,
                                            defaultShippingAddress.zipCode,
                                            defaultShippingAddress.country,
                                        ],
                                        ", ",
                                    )}
                                />
                                <InfoRow
                                    label="VAT No"
                                    value={safeValue(
                                        defaultShippingAddress.vat_No,
                                    )}
                                />
                                <InfoRow
                                    label="GSTN No"
                                    value={safeValue(
                                        defaultShippingAddress.gstn_No,
                                    )}
                                />
                            </SectionCard>
                        )}

                        {/* ── Disable Account Button ── */}
                        {user.role === "USER" && (
                            <TouchableOpacity
                                onPress={handleDisableAccount}
                                disabled={disablingAccount}
                                className="bg-orange-50 border border-orange-200 rounded-lg py-4 items-center flex-row justify-center gap-2 mb-3"
                                activeOpacity={0.7}
                            >
                                {disablingAccount ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#f97316"
                                    />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="ban-outline"
                                            size={20}
                                            color="#f97316"
                                        />
                                        <Text className="text-orange-500 font-latoBold text-sm uppercase tracking-wide">
                                            Disable Account
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* ── Delete Account Button ── */}
                        {user.role === "USER" && (
                            <TouchableOpacity
                                onPress={handleOpenDeleteModal}
                                className="bg-red-50 border border-red-200 rounded-lg py-4 items-center flex-row justify-center gap-2 mb-3"
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="#ef4444"
                                />
                                <Text className="text-red-500 font-latoBold text-sm uppercase tracking-wide">
                                    Delete Account
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* ── Logout Button ── */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            disabled={loggingOut}
                            className="bg-red-50 border border-red-200 rounded-lg py-4 items-center flex-row justify-center gap-2 mb-4"
                            activeOpacity={0.7}
                        >
                            {loggingOut ? (
                                <ActivityIndicator
                                    size="small"
                                    color="#ef4444"
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="log-out-outline"
                                        size={20}
                                        color="#ef4444"
                                    />
                                    <Text className="text-red-500 font-latoBold text-sm uppercase tracking-wide">
                                        Logout
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Bottom spacing */}
                        <View className="h-6" />
                    </View>
                </ScrollView>
            )}
            {/* ── Delete Account Modal ── */}
            <Modal
                visible={isDeleteModalOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseDeleteModal}
            >
                <View className="flex-1 bg-black/50 justify-center px-4">
                    <View className="bg-white rounded-2xl overflow-hidden max-h-[85%]">
                        {/* Modal Header */}
                        <View className="bg-red-600 px-5 py-4 flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="warning" size={22} color="white" />
                                <Text className="text-white text-lg font-loraBold">
                                    Delete Account
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleCloseDeleteModal}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
                            {/* ── Step 1: Warning ── */}
                            {deleteStep === 1 && (
                                <View>
                                    <Text className="text-base font-latoBold text-gray-900 mb-3">
                                        We recommend disabling your account instead
                                    </Text>
                                    <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                                        <Text className="text-sm font-latoBold text-orange-700 mb-2">
                                            Benefits of disabling:
                                        </Text>
                                        <Text className="text-sm font-lato text-orange-600 mb-1">
                                            {"\u2022"} You can reactivate your account anytime
                                        </Text>
                                        <Text className="text-sm font-lato text-orange-600 mb-1">
                                            {"\u2022"} Your data and history are preserved
                                        </Text>
                                        <Text className="text-sm font-lato text-orange-600">
                                            {"\u2022"} Your account is fully recoverable
                                        </Text>
                                    </View>

                                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                                        <Text className="text-sm font-latoBold text-red-700 mb-2">
                                            Warning: Permanent deletion means:
                                        </Text>
                                        <Text className="text-sm font-lato text-red-600 mb-1">
                                            {"\u2022"} All your data will be permanently erased
                                        </Text>
                                        <Text className="text-sm font-lato text-red-600 mb-1">
                                            {"\u2022"} Your account cannot be recovered
                                        </Text>
                                        <Text className="text-sm font-lato text-red-600">
                                            {"\u2022"} This action is irreversible
                                        </Text>
                                    </View>

                                    <View className="flex-row gap-3 mb-4">
                                        <TouchableOpacity
                                            onPress={handleCloseDeleteModal}
                                            className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-gray-700 font-latoBold text-sm">
                                                Cancel
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleCloseDeleteModal();
                                                handleDisableAccount();
                                            }}
                                            className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-white font-latoBold text-sm">
                                                Disable Instead
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setDeleteStep(2)}
                                        className="bg-red-600 rounded-lg py-3 items-center mb-2"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-white font-latoBold text-sm">
                                            Continue to Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* ── Step 2: Confirmations ── */}
                            {deleteStep === 2 && (
                                <View>
                                    <Text className="text-base font-latoBold text-gray-900 mb-1">
                                        Please acknowledge each of the following to proceed:
                                    </Text>
                                    <Text className="text-sm font-lato text-gray-500 mb-4">
                                        You must confirm all items before continuing.
                                    </Text>

                                    {[
                                        {
                                            key: "understand" as const,
                                            text: "I understand that deleting my account is permanent and cannot be undone",
                                        },
                                        {
                                            key: "noRecovery" as const,
                                            text: "I acknowledge that my account cannot be recovered after deletion, even by contacting support",
                                        },
                                        {
                                            key: "loseData" as const,
                                            text: "I understand that all my data, order history, saved items, and preferences will be permanently erased",
                                        },
                                        {
                                            key: "loseAccess" as const,
                                            text: "I will lose access to all services associated with this account immediately",
                                        },
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.key}
                                            onPress={() => toggleConfirmation(item.key)}
                                            className="flex-row items-start gap-3 mb-4"
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                className={`w-5 h-5 rounded border-2 mt-0.5 items-center justify-center ${
                                                    deleteConfirmations[item.key]
                                                        ? "bg-red-600 border-red-600"
                                                        : "border-gray-300"
                                                }`}
                                            >
                                                {deleteConfirmations[item.key] && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={14}
                                                        color="white"
                                                    />
                                                )}
                                            </View>
                                            <Text className="flex-1 text-sm font-lato text-red-700">
                                                {item.text}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    <View className="flex-row gap-3 mt-2 mb-2">
                                        <TouchableOpacity
                                            onPress={() => setDeleteStep(1)}
                                            className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-gray-700 font-latoBold text-sm">
                                                Back
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setDeleteStep(3)}
                                            disabled={!allDeleteConfirmationsChecked}
                                            className={`flex-1 rounded-lg py-3 items-center ${
                                                allDeleteConfirmationsChecked
                                                    ? "bg-red-600"
                                                    : "bg-gray-300"
                                            }`}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                className={`font-latoBold text-sm ${
                                                    allDeleteConfirmationsChecked
                                                        ? "text-white"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                Proceed
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* ── Step 3: Final confirmation ── */}
                            {deleteStep === 3 && (
                                <View>
                                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                        <Text className="text-sm font-latoBold text-red-700 text-center">
                                            This is your last chance to turn back.
                                        </Text>
                                    </View>

                                    <Text className="text-sm font-lato text-gray-700 mb-2">
                                        Type <Text className="font-latoBold">DELETE</Text> below
                                        to confirm permanent account deletion:
                                    </Text>

                                    <TextInput
                                        value={deleteConfirmText}
                                        onChangeText={setDeleteConfirmText}
                                        placeholder="Type DELETE to confirm"
                                        placeholderTextColor="#9ca3af"
                                        autoCapitalize="characters"
                                        className="border border-gray-300 rounded-lg px-4 py-3 text-base font-lato text-gray-900 mb-4"
                                    />

                                    <View className="flex-row gap-3 mb-2">
                                        <TouchableOpacity
                                            onPress={() => setDeleteStep(2)}
                                            className="flex-1 border border-gray-300 rounded-lg py-3 items-center"
                                            activeOpacity={0.7}
                                        >
                                            <Text className="text-gray-700 font-latoBold text-sm">
                                                Back
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDeleteAccount}
                                            disabled={
                                                !allDeleteConfirmationsChecked ||
                                                deleteConfirmText !== "DELETE" ||
                                                isDeletingAccount
                                            }
                                            className={`flex-1 rounded-lg py-3 items-center ${
                                                allDeleteConfirmationsChecked &&
                                                deleteConfirmText === "DELETE" &&
                                                !isDeletingAccount
                                                    ? "bg-red-600"
                                                    : "bg-gray-300"
                                            }`}
                                            activeOpacity={0.7}
                                        >
                                            {isDeletingAccount ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="white"
                                                />
                                            ) : (
                                                <Text
                                                    className={`font-latoBold text-sm ${
                                                        allDeleteConfirmationsChecked &&
                                                        deleteConfirmText === "DELETE"
                                                            ? "text-white"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    Permanently Delete
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
