import {
    createDiamondInquiry,
    getUserQueries,
    InquiryQuery,
} from "@/services/inquiryServices";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../(tabs)/_layout";

function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function DetailRow({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) {
    return (
        <View className="flex-row border-b border-gray-100">
            <View className="flex-1 py-2 px-3 border-r border-gray-100">
                <Text className="text-xs text-gray-500 font-lato">{label}</Text>
            </View>
            <View className="flex-1 py-2 px-3">
                <Text className="text-xs font-latoBold text-gray-800 text-right">
                    {value ?? "-"}
                </Text>
            </View>
        </View>
    );
}

// Represents a single chat message in the timeline
interface ChatMessage {
    type: "user" | "admin";
    text: string;
    timestamp: string;
    queryId: string;
}

function buildChatTimeline(queries: InquiryQuery[]): ChatMessage[] {
    const messages: ChatMessage[] = [];

    // Sort queries by createdAt ascending (oldest first)
    const sorted = [...queries].sort(
        (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const q of sorted) {
        // Add user's query
        messages.push({
            type: "user",
            text: q.query,
            timestamp: q.createdAt,
            queryId: q.id,
        });

        // Add admin's reply if exists
        if (q.adminReply) {
            messages.push({
                type: "admin",
                text: q.adminReply,
                timestamp: q.repliedAt || q.updatedAt,
                queryId: q.id,
            });
        }
    }

    // Sort all messages by timestamp ascending
    messages.sort(
        (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return messages;
}

export default function EnquiryChatScreen() {
    // id is now the stockRef (URL-encoded)
    const { id } = useLocalSearchParams<{ id: string }>();
    const stockRef = decodeURIComponent(id || "");
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    const [queries, setQueries] = useState<InquiryQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchQueries = useCallback(
        async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                const res = await getUserQueries();
                if (res.success) {
                    // Filter all queries for this stockRef
                    const filtered = res.data.queries.filter(
                        (q) => q.stockRef === stockRef,
                    );
                    setQueries(filtered);
                }
            } catch (err: any) {
                if (!silent) {
                    Alert.alert(
                        "Error",
                        err?.toString() ?? "Failed to load enquiry",
                    );
                }
            } finally {
                setLoading(false);
            }
        },
        [stockRef],
    );

    useEffect(() => {
        fetchQueries();
    }, [fetchQueries]);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
    }, [queries]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchQueries(true).finally(() => setRefreshing(false));
    }, [fetchQueries]);

    // Get the latest query to determine if user can send
    const latestQuery = queries.length
        ? [...queries].sort(
              (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
          )[0]
        : null;

    const canSend =
        latestQuery?.status === "replied" || latestQuery?.status === "answered";

    const handleSend = async () => {
        if (!message.trim() || !stockRef) return;

        if (latestQuery?.status === "pending") {
            Alert.alert(
                "Please Wait",
                "Your previous question is still pending. You can send another question after the admin replies.",
            );
            return;
        }

        setSending(true);
        try {
            await createDiamondInquiry({
                stockRef,
                query: message.trim(),
            });
            setMessage("");
            await fetchQueries(true);
        } catch (err: any) {
            Alert.alert(
                "Error",
                typeof err === "string" ? err : "Failed to send message",
            );
        } finally {
            setSending(false);
        }
    };

    // Use diamond info from the first query
    const diamond = queries[0]?.diamondId;
    const summary = diamond
        ? `${diamond.shape ?? ""} ${diamond.weight ?? ""} CT ${diamond.color ?? ""}${diamond.clarity ?? ""} ${diamond.cutGrade ?? ""}`.trim()
        : stockRef;

    const chatMessages = buildChatTimeline(queries);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <AppHeader />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#49214c" />
                    <Text className="text-gray-500 font-lato mt-3 text-sm">
                        Loading enquiry...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (queries.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <AppHeader />
                <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-9 h-9 items-center justify-center rounded-full border border-gray-200 mr-3"
                    >
                        <Ionicons name="arrow-back" size={20} color="#49214c" />
                    </TouchableOpacity>
                    <Text className="text-base font-latoBold text-[#49214c]">
                        Enquiry
                    </Text>
                </View>
                <View className="flex-1 items-center justify-center gap-3 px-6">
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#9CA3AF"
                    />
                    <Text className="text-gray-500 font-lato text-base text-center">
                        Enquiry not found
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="px-6 py-2 bg-[#49214c] rounded-full mt-2"
                    >
                        <Text className="text-white font-latoBold">
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <AppHeader />

            {/* Header with diamond info */}
            <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-9 h-9 items-center justify-center rounded-full border border-gray-200 mr-3"
                >
                    <Ionicons name="arrow-back" size={20} color="#49214c" />
                </TouchableOpacity>

                <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center overflow-hidden mr-3">
                    {diamond?.webLink ? (
                        <Image
                            source={{ uri: diamond.webLink }}
                            className="w-9 h-9 rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Ionicons
                            name="diamond-outline"
                            size={18}
                            color="#9CA3AF"
                        />
                    )}
                </View>

                <View className="flex-1">
                    <Text
                        className="text-sm font-latoBold text-gray-900"
                        numberOfLines={1}
                    >
                        {summary}
                    </Text>
                    <Text className="text-xs font-lato text-gray-500">
                        {stockRef}
                    </Text>
                </View>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 bg-gray-50"
                    contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#49214c"
                            colors={["#49214c"]}
                        />
                    }
                >
                    {/* Diamond Details Card */}
                    {/* <View className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <View className="bg-[#26062b] px-4 py-2">
                            <Text className="text-white text-xs font-latoBold uppercase tracking-wide">
                                Diamond Details
                            </Text>
                        </View>
                        <DetailRow label="Stock Ref" value={stockRef} />
                        <DetailRow label="Shape" value={diamond?.shape} />
                        <DetailRow label="Carat" value={diamond?.weight} />
                        <DetailRow label="Color" value={diamond?.color} />
                        <DetailRow label="Clarity" value={diamond?.clarity} />
                        <DetailRow label="Cut" value={diamond?.cutGrade} />
                        <DetailRow label="Lab" value={diamond?.lab} />
                        <DetailRow
                            label="Price/Ct"
                            value={
                                diamond?.pricePerCts
                                    ? `$${diamond.pricePerCts.toLocaleString()}`
                                    : "-"
                            }
                        />
                        <DetailRow
                            label="Total"
                            value={
                                diamond?.weight && diamond?.pricePerCts
                                    ? `$${(diamond.weight * diamond.pricePerCts).toLocaleString()}`
                                    : "-"
                            }
                        />
                    </View> */}

                    {/* Chat Messages Timeline */}
                    {chatMessages.map((msg, index) =>
                        msg.type === "user" ? (
                            <View
                                key={`${msg.queryId}-user-${index}`}
                                className="flex-row justify-end mb-3"
                            >
                                <View className="max-w-[80%]">
                                    <View className="bg-[#26062b] rounded-2xl rounded-br-sm px-4 py-3">
                                        <Text className="text-white text-sm font-lato">
                                            {msg.text}
                                        </Text>
                                    </View>
                                    <Text className="text-xs font-lato text-gray-400 text-right mt-1 mr-1">
                                        {formatDateTime(msg.timestamp)}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View
                                key={`${msg.queryId}-admin-${index}`}
                                className="flex-row justify-start mb-3"
                            >
                                <View style={{ maxWidth: "80%" }}>
                                    <View className="flex-row items-end gap-2">
                                        <View className="w-7 h-7 rounded-full bg-[#c9a84c] items-center justify-center shrink-0">
                                            <Ionicons
                                                name="shield-checkmark"
                                                size={14}
                                                color="#fff"
                                            />
                                        </View>
                                        <View style={{ flexShrink: 1 }}>
                                            <View className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                                                <Text className="text-gray-800 text-sm font-lato">
                                                    {msg.text}
                                                </Text>
                                            </View>
                                            <Text className="text-xs font-lato text-gray-400 mt-1 ml-1">
                                                Admin •{" "}
                                                {formatDateTime(msg.timestamp)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ),
                    )}

                    {/* Pending indicator if latest query has no admin reply */}
                    {latestQuery && !latestQuery.adminReply && (
                        <View className="flex-row justify-start mb-3">
                            <View className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex-row items-center gap-2">
                                <Ionicons
                                    name="time-outline"
                                    size={16}
                                    color="#ca8a04"
                                />
                                <Text className="text-yellow-800 text-xs font-lato">
                                    Awaiting admin reply...
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View className="bg-white border-t border-gray-200 px-4 py-3">
                    {latestQuery?.status === "pending" ? (
                        <View className="flex-row items-center justify-center py-2">
                            <Ionicons
                                name="lock-closed-outline"
                                size={16}
                                color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-sm font-lato ml-2">
                                Wait for admin reply before sending another
                                message
                            </Text>
                        </View>
                    ) : latestQuery?.status === "closed" ? (
                        <View className="flex-row items-center justify-center py-2">
                            <Ionicons
                                name="lock-closed-outline"
                                size={16}
                                color="#9CA3AF"
                            />
                            <Text className="text-gray-400 text-sm font-lato ml-2">
                                This enquiry has been closed
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row items-end gap-2">
                            <TouchableOpacity className="w-10 h-10 items-center justify-center">
                                <Ionicons
                                    name="attach-outline"
                                    size={22}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>

                            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2 min-h-[40px] justify-center">
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Type your question..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    className="text-sm font-lato text-gray-800 max-h-24"
                                    editable={!sending}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={sending || !message.trim()}
                                className={`w-10 h-10 rounded-full items-center justify-center ${
                                    message.trim() && !sending
                                        ? "bg-[#c9a84c]"
                                        : "bg-gray-200"
                                }`}
                            >
                                {sending ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                    />
                                ) : (
                                    <Ionicons
                                        name="send"
                                        size={18}
                                        color={
                                            message.trim() ? "#fff" : "#9CA3AF"
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
