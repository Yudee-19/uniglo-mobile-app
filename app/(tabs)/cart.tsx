import { DiamondCard } from "@/components/inventory/DiamondCard";
import { DiamondCardSkeleton } from "@/components/inventory/DiamondCardSkeleton";
import {
    CartItem,
    clearCart,
    getCart,
    removeFromCart,
} from "@/services/cartServices";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
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

// ── Swipeable Card ────────────────────────────────────────────────────────────

interface SwipeableCartCardProps {
    item: CartItem;
    onRemove: () => void;
    actionLoading: boolean;
}

function SwipeableCartCard({
    item,
    onRemove,
    actionLoading,
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
                // Snap to reveal delete zone, then confirm
                Animated.spring(translateX, {
                    toValue: MAX_SWIPE,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            } else {
                // Snap back
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

    // Clamp translateX so card can't swipe right or too far left
    const clampedTranslateX = translateX.interpolate({
        inputRange: [-200, 0],
        outputRange: [-200, 0],
        extrapolate: "clamp",
    });

    // Delete button fades in as user swipes
    const deleteOpacity = translateX.interpolate({
        inputRange: [-100, -40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    return (
        <View className="mb-3 overflow-hidden rounded-lg">
            {/* Delete background */}
            <Animated.View
                style={{ opacity: deleteOpacity }}
                className="absolute right-0 top-0 bottom-0 w-24 bg-red-400/60 rounded-lg items-center justify-center"
            >
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 w-full items-center justify-center gap-1"
                >
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                    <Text className="text-white text-xs font-latoBold">
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
            >
                <Animated.View
                    style={{ transform: [{ translateX: clampedTranslateX }] }}
                >
                    <DiamondCard diamond={item.diamond} />
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
    const [actionLoading, setActionLoading] = useState(false);

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
        fetchCart(true);
    }, [fetchCart]);

    const handleRemoveOne = async (diamondId: string) => {
        try {
            setActionLoading(true);
            await removeFromCart(diamondId);
            await fetchCart(true);
        } catch (err: any) {
            Alert.alert("Error", err?.toString() ?? "Failed to remove item");
        } finally {
            setActionLoading(false);
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
                            setActionLoading(true);
                            await clearCart();
                            await fetchCart(true);
                        } catch (err: any) {
                            Alert.alert(
                                "Error",
                                err?.toString() ?? "Failed to clear cart",
                            );
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ],
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 bg-white border-t border-gray-100">
                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-9 h-9 items-center justify-center"
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color="#49214c"
                            />
                        </TouchableOpacity>
                        <Text className="text-2xl font-loraBold text-primary-purple">
                            My Cart
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={handleClearCart}
                            disabled={actionLoading || cartItems.length === 0}
                            style={{
                                opacity:
                                    actionLoading || cartItems.length === 0
                                        ? 0.4
                                        : 1,
                            }}
                        >
                            {actionLoading ? (
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
                            Browse our inventory and add diamonds to your cart.
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
                                actionLoading={actionLoading}
                                onRemove={() =>
                                    handleRemoveOne(item.diamond._id)
                                }
                            />
                        )}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}
