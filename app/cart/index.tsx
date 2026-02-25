import { DiamondCardSkeleton } from "@/components/inventory/DiamondCardSkeleton";
import { AppHeader } from "@/components/shared/AppHeader";
import {
    CartItem,
    clearCart,
    getCart,
    holdDiamond,
    removeFromCart,
} from "@/services/cartServices";
import { Diamond } from "@/services/diamondService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Non-interactive Diamond Card for Cart ─────────────────────────────────────

function CartDiamondCard({ diamond }: { diamond: Diamond }) {
    return (
        <View className="bg-white rounded-xl border flex-row border-gray-200 p-4">
            <View className="w-20 h-20 bg-gray-100 rounded-lg mr-4">
                {diamond.webLink && (
                    <Image
                        source={{ uri: diamond.webLink }}
                        className="w-full h-full rounded-lg"
                        resizeMode="contain"
                    />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-lg text-primary-purple font-latoBold mb-1">
                    {diamond.shape} {diamond.weight} CT {diamond.color}{" "}
                    {diamond.clarity} {diamond.cutGrade}
                </Text>
                <Text className="text-sm text-gray-600 font-lato mb-2">
                    {diamond.stockRef} • {diamond.lab} • T:{diamond.tablePerc}%
                    {"  "}D:{diamond.depthPerc}%
                </Text>
                <Text className="text-sm text-gray-500 font-lato">
                    Measurement: {diamond.measurements}
                </Text>
            </View>
        </View>
    );
}

// ── Swipeable Card ────────────────────────────────────────────────────────────

interface SwipeableCartCardProps {
    item: CartItem;
    onRemove: () => void;
    actionLoading: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    selectionMode: boolean;
}

function SwipeableCartCard({
    item,
    onRemove,
    actionLoading,
    isSelected,
    onToggleSelect,
    selectionMode,
}: SwipeableCartCardProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const DELETE_THRESHOLD = -80;
    const MAX_SWIPE = -100;

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true },
    );

    const onHandlerStateChange = ({ nativeEvent }: any) => {
        // State 5 = END
        if (nativeEvent.state === 5) {
            if (nativeEvent.translationX < DELETE_THRESHOLD) {
                Animated.spring(translateX, {
                    toValue: MAX_SWIPE,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            } else {
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            }
        }
    };

    const handleDelete = () => {
        Animated.timing(translateX, {
            toValue: -500,
            duration: 250,
            useNativeDriver: true,
        }).start(() => onRemove());
    };

    const clampedTranslateX = translateX.interpolate({
        inputRange: [-200, 0],
        outputRange: [-200, 0],
        extrapolate: "clamp",
    });

    const deleteOpacity = translateX.interpolate({
        inputRange: [-100, -40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    const handlePress = () => {
        if (selectionMode) {
            onToggleSelect();
        } else {
            // Navigate to diamond detail
            router.push(
                `/diamond/${encodeURIComponent(item.diamond.stockRef)}`,
            );
        }
    };

    return (
        <View className="mb-3 overflow-hidden rounded-lg">
            {/* Delete background */}
            <Animated.View
                style={{ opacity: deleteOpacity }}
                className="absolute right-0 top-0 bottom-0 w-24 rounded-lg items-center justify-center border border-gray-200 bg-gray-50"
            >
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 w-full items-center justify-center gap-1"
                >
                    <Ionicons name="trash-outline" size={22} color="gray" />
                    <Text className="text-gray-400 text-xs font-latoBold">
                        Remove
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Swipeable card */}
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-15, 15]}
                enabled={!selectionMode}
            >
                <Animated.View
                    style={{ transform: [{ translateX: clampedTranslateX }] }}
                >
                    <Pressable
                        onPress={handlePress}
                        onLongPress={onToggleSelect}
                        delayLongPress={400}
                    >
                        <View
                            className={`${
                                isSelected
                                    ? "border-2 border-[#c9a84c] rounded-xl"
                                    : ""
                            }`}
                        >
                            {/* Selection checkbox overlay */}
                            {selectionMode && (
                                <View className="absolute top-2 right-2 z-10">
                                    <View
                                        className={`w-6 h-6 rounded-full items-center justify-center ${
                                            isSelected
                                                ? "bg-[#c9a84c]"
                                                : "bg-white border-2 border-gray-300"
                                        }`}
                                    >
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color="#fff"
                                            />
                                        )}
                                    </View>
                                </View>
                            )}
                            <CartDiamondCard diamond={item.diamond} />
                        </View>
                    </Pressable>
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CartScreen() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [clearingCart, setClearingCart] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [holdingDiamonds, setHoldingDiamonds] = useState(false);

    const selectionMode = selectedIds.size > 0;

    const fetchCart = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await getCart();
            if (res.success) {
                setCartItems(res.data.cart?.items ?? []);
            }
        } catch (err: any) {
            Alert.alert("Error", err?.toString() ?? "Failed to load cart");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setSelectedIds(new Set());
        fetchCart(true);
    }, [fetchCart]);

    const toggleSelect = (diamondId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(diamondId)) {
                next.delete(diamondId);
            } else {
                next.add(diamondId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === cartItems.length) {
            // Deselect all
            setSelectedIds(new Set());
        } else {
            // Select all
            setSelectedIds(new Set(cartItems.map((item) => item.diamond._id)));
        }
    };

    const handleHoldSelected = () => {
        if (selectedIds.size === 0) return;

        const selectedStockRefs = cartItems
            .filter((item) => selectedIds.has(item.diamond._id))
            .map((item) => item.diamond.stockRef);

        Alert.alert(
            "Hold Diamonds",
            `Put ${selectedIds.size} diamond${selectedIds.size > 1 ? "s" : ""} on hold?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Hold",
                    onPress: async () => {
                        setHoldingDiamonds(true);
                        try {
                            await holdDiamond(selectedStockRefs);
                            Alert.alert(
                                "Success",
                                `${selectedIds.size} diamond${selectedIds.size > 1 ? "s" : ""} placed on hold.`,
                            );
                            setSelectedIds(new Set());
                            await fetchCart(true);
                        } catch (err: any) {
                            Alert.alert(
                                "Error",
                                err?.toString() ??
                                    "Failed to hold diamonds. Please try again.",
                            );
                        } finally {
                            setHoldingDiamonds(false);
                        }
                    },
                },
            ],
        );
    };

    const handleRemoveOne = async (diamondId: string) => {
        try {
            setRemovingId(diamondId);
            await removeFromCart(diamondId);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(diamondId);
                return next;
            });
            await fetchCart(true);
        } catch (err: any) {
            Alert.alert("Error", err?.toString() ?? "Failed to remove item");
        } finally {
            setRemovingId(null);
        }
    };

    const handleClearCart = () => {
        if (!cartItems.length) return;
        Alert.alert(
            "Clear Cart",
            "This will remove all items from your cart. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear Cart",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setClearingCart(true);
                            await clearCart();
                            setSelectedIds(new Set());
                            await fetchCart(true);
                        } catch (err: any) {
                            Alert.alert(
                                "Error",
                                err?.toString() ?? "Failed to clear cart",
                            );
                        } finally {
                            setClearingCart(false);
                        }
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView className="flex-1">
            <AppHeader />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View className="flex-1 bg-gray-50">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 py-4 bg-white border-t border-gray-100">
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={() => {
                                    if (selectionMode) {
                                        setSelectedIds(new Set());
                                    } else {
                                        router.back();
                                    }
                                }}
                                className="w-9 h-9 items-center justify-center"
                            >
                                <Ionicons
                                    name={
                                        selectionMode ? "close" : "arrow-back"
                                    }
                                    size={24}
                                    color="#49214c"
                                />
                            </TouchableOpacity>
                            <Text className="text-2xl font-loraBold text-primary-purple">
                                {selectionMode
                                    ? `${selectedIds.size} Selected`
                                    : "My Cart"}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                            {selectionMode && (
                                <TouchableOpacity
                                    onPress={handleSelectAll}
                                    className="px-3 py-1.5 rounded-full border border-gray-300"
                                >
                                    <Text className="text-xs font-latoBold text-gray-600">
                                        {selectedIds.size === cartItems.length
                                            ? "Deselect All"
                                            : "Select All"}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {selectionMode && (
                                <TouchableOpacity
                                    onPress={handleHoldSelected}
                                    disabled={holdingDiamonds}
                                    className="bg-[#c9a84c] px-3 py-1.5 rounded-full flex-row items-center gap-1"
                                    style={{
                                        opacity: holdingDiamonds ? 0.6 : 1,
                                    }}
                                >
                                    {holdingDiamonds ? (
                                        <ActivityIndicator
                                            size="small"
                                            color="#fff"
                                        />
                                    ) : (
                                        <>
                                            <Ionicons
                                                name="hand-left-outline"
                                                size={16}
                                                color="#fff"
                                            />
                                            <Text className="text-white text-xs font-latoBold">
                                                Hold
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleClearCart}
                                disabled={
                                    clearingCart || cartItems.length === 0
                                }
                                style={{
                                    opacity:
                                        clearingCart || cartItems.length === 0
                                            ? 0.4
                                            : 1,
                                }}
                            >
                                {clearingCart ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#ef4444"
                                    />
                                ) : (
                                    <Ionicons
                                        name="trash-outline"
                                        size={22}
                                        color="#26062b"
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <ScrollView className="flex-1 px-4 pt-4">
                            {[...Array(4)].map((_, i) => (
                                <DiamondCardSkeleton key={i} />
                            ))}
                        </ScrollView>
                    ) : cartItems.length === 0 ? (
                        <View className="flex-1 items-center justify-center gap-4 px-8">
                            <Ionicons
                                name="cart-outline"
                                size={72}
                                color="#d1d5db"
                            />
                            <Text className="text-lg font-latoBold text-gray-400">
                                Your cart is empty
                            </Text>
                            <Text className="text-sm font-lato text-gray-400 text-center">
                                Browse our inventory and add diamonds to your
                                cart.
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/(tabs)/inventory")}
                                className="mt-2 bg-primary-purple px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-latoBold text-sm">
                                    Browse Inventory
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {!selectionMode && cartItems.length > 0 && (
                                <View className="px-4 py-2 bg-gray-100">
                                    <Text className="text-xs font-lato text-gray-500 text-center">
                                        Long press on a diamond to select & hold
                                    </Text>
                                </View>
                            )}
                            <FlatList
                                data={cartItems}
                                keyExtractor={(item) => item.diamondId}
                                contentContainerStyle={{ padding: 16 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        tintColor="#49214c"
                                    />
                                }
                                renderItem={({ item }) => (
                                    <SwipeableCartCard
                                        item={item}
                                        actionLoading={
                                            removingId === item.diamond._id
                                        }
                                        onRemove={() =>
                                            handleRemoveOne(item.diamond._id)
                                        }
                                        isSelected={selectedIds.has(
                                            item.diamond._id,
                                        )}
                                        onToggleSelect={() =>
                                            toggleSelect(item.diamond._id)
                                        }
                                        selectionMode={selectionMode}
                                    />
                                )}
                            />
                        </>
                    )}
                </View>
            </GestureHandlerRootView>
        </SafeAreaView>
    );
}
