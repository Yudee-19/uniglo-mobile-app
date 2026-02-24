import { useAuth } from "@/context/AuthContext";
import { getUserProfile, UserProfile } from "@/services/userServices";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../(tabs)/_layout";

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
    const { logout } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

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
        </SafeAreaView>
    );
}
