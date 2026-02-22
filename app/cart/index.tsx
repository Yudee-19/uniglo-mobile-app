// import { DiamondCardSkeleton } from "@/components/inventory/DiamondCardSkeleton";
// import {
//     CartItem,
//     clearCart,
//     getCart,
//     holdDiamond,
//     removeFromCart,
// } from "@/services/cartServices";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import React, { useCallback, useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     FlatList,
//     Image,
//     RefreshControl,
//     ScrollView,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// // ─── helpers ────────────────────────────────────────────────────────────────

// const calculateTotal = (weight: number, pricePerCts: number): string => {
//     if (!weight || !pricePerCts) return "-";
//     return `$${(weight * pricePerCts).toLocaleString("en-US", {
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     })}`;
// };

// // ─── Cart-item card (mirrors the design screenshot) ─────────────────────────

// interface CartCardProps {
//     item: CartItem;
//     selected: boolean;
//     onToggleSelect: () => void;
//     onRemove: () => void;
// }

// function CartCard({ item, selected, onToggleSelect, onRemove }: CartCardProps) {
//     const d = item.diamond;

//     return (
//         <View className="bg-white border border-gray-200 rounded-xl mb-3 overflow-hidden shadow-sm">
//             {/* Select row */}
//             <View className="flex-row items-center px-4 pt-3 pb-1 gap-3">
//                 <TouchableOpacity
//                     onPress={onToggleSelect}
//                     className="w-5 h-5 rounded border-2 border-primary-purple items-center justify-center"
//                     style={{
//                         backgroundColor: selected ? "#49214c" : "transparent",
//                     }}
//                 >
//                     {selected && (
//                         <Ionicons name="checkmark" size={12} color="#fff" />
//                     )}
//                 </TouchableOpacity>
//                 <Text className="text-xs text-gray-400 font-lato">
//                     {d.stockRef}
//                 </Text>
//             </View>

//             {/* Main content */}
//             <View className="flex-row px-4 pb-3 gap-3">
//                 {/* Thumbnail */}
//                 <View className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden items-center justify-center border border-gray-200">
//                     {d.webLink ? (
//                         <Image
//                             source={{ uri: d.webLink }}
//                             className="w-full h-full"
//                             resizeMode="contain"
//                         />
//                     ) : (
//                         <Ionicons
//                             name="diamond-outline"
//                             size={32}
//                             color="#d1d5db"
//                         />
//                     )}
//                 </View>

//                 {/* Details */}
//                 <View className="flex-1 justify-between">
//                     <Text
//                         className="text-base font-latoBold text-primary-purple"
//                         numberOfLines={2}
//                     >
//                         {d.shape} {d.weight?.toFixed(2)} CT {d.color}{" "}
//                         {d.clarity} {d.cutGrade} {d.polish}
//                     </Text>
//                     <Text className="text-xs text-gray-500 font-lato mt-1">
//                         {d.stockRef} • {d.lab} • T:
//                         {d.tablePerc}% D:{d.depthPerc}% R:
//                         {d.depthPerc?.toFixed(2)}
//                     </Text>
//                     <Text className="text-xs text-gray-400 font-lato mt-1">
//                         Measurement: {d.measurements}
//                     </Text>

//                     {/* Price & Remove */}
//                     <View className="flex-row items-center justify-between mt-2">
//                         <Text className="text-sm font-latoBold text-primary-purple">
//                             {calculateTotal(d.weight, d.pricePerCts)}
//                         </Text>
//                         <TouchableOpacity
//                             onPress={onRemove}
//                             className="flex-row items-center gap-1"
//                         >
//                             <Ionicons
//                                 name="remove-circle-outline"
//                                 size={16}
//                                 color="#9ca3af"
//                             />
//                             <Text className="text-xs text-gray-400 font-lato">
//                                 Remove
//                             </Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </View>
//     );
// }

// function AppHeader() {
//     return (
//         <View className="flex-row items-center justify-between px-4 py-3 bg-white">
//             {/* Center - Logo */}
//             <View className="flex-row items-center gap-2">
//                 <Image
//                     source={require("@/assets/images/logo.png")}
//                     className="w-10 h-10"
//                     resizeMode="contain"
//                 />
//                 <Text className="font-loraBold text-xl tracking-widest text-primary-purple">
//                     UNIGLO DIAMONDS
//                 </Text>
//             </View>
//             {/* Right - Cart & Profile */}
//             <TouchableOpacity
//                 onPress={() => router.push("/cart")}
//                 className="w-9 h-9 items-center justify-center"
//             >
//                 <Ionicons name="cart-outline" size={24} color="#49214c" />
//             </TouchableOpacity>
//             <TouchableOpacity
//                 onPress={() => router.push("/profile")}
//                 className="w-9 h-9 items-center justify-center"
//             >
//                 <Ionicons name="person-outline" size={24} color="#49214c" />
//             </TouchableOpacity>
//         </View>
//     );
// }

// // ─── Main Screen ─────────────────────────────────────────────────────────────

// export default function CartScreen() {
//     const [cartItems, setCartItems] = useState<CartItem[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [selectedIds, setSelectedIds] = useState<string[]>([]);
//     const [actionLoading, setActionLoading] = useState(false);

//     // ── Fetch ────────────────────────────────────────────────────────────────

//     const fetchCart = useCallback(async (silent = false) => {
//         if (!silent) setLoading(true);
//         try {
//             const res = await getCart();
//             if (res.success) {
//                 setCartItems(res.data.cart?.items ?? []);
//             }
//         } catch (err: any) {
//             Alert.alert("Error", err?.toString() ?? "Failed to load cart");
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchCart();
//     }, [fetchCart]);

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchCart(true);
//     }, [fetchCart]);

//     // ── Selection ────────────────────────────────────────────────────────────

//     const isAllSelected =
//         cartItems.length > 0 && selectedIds.length === cartItems.length;

//     const toggleAll = () => {
//         setSelectedIds(
//             isAllSelected ? [] : cartItems.map((i) => i.diamond._id),
//         );
//     };

//     const toggleOne = (id: string) => {
//         setSelectedIds((prev) =>
//             prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//         );
//     };

//     // ── Actions ──────────────────────────────────────────────────────────────

//     const handleRemoveSelected = async () => {
//         if (!selectedIds.length) return;
//         Alert.alert(
//             "Remove Items",
//             `Remove ${selectedIds.length} item(s) from cart?`,
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Remove",
//                     style: "destructive",
//                     onPress: async () => {
//                         try {
//                             setActionLoading(true);
//                             await Promise.all(
//                                 selectedIds.map((id) => removeFromCart(id)),
//                             );
//                             setSelectedIds([]);
//                             await fetchCart(true);
//                         } catch (err: any) {
//                             Alert.alert(
//                                 "Error",
//                                 err?.toString() ?? "Failed to remove items",
//                             );
//                         } finally {
//                             setActionLoading(false);
//                         }
//                     },
//                 },
//             ],
//         );
//     };

//     const handleRemoveOne = async (diamondId: string) => {
//         Alert.alert("Remove Item", "Remove this diamond from your cart?", [
//             { text: "Cancel", style: "cancel" },
//             {
//                 text: "Remove",
//                 style: "destructive",
//                 onPress: async () => {
//                     try {
//                         setActionLoading(true);
//                         await removeFromCart(diamondId);
//                         setSelectedIds((prev) =>
//                             prev.filter((id) => id !== diamondId),
//                         );
//                         await fetchCart(true);
//                     } catch (err: any) {
//                         Alert.alert(
//                             "Error",
//                             err?.toString() ?? "Failed to remove item",
//                         );
//                     } finally {
//                         setActionLoading(false);
//                     }
//                 },
//             },
//         ]);
//     };

//     const handleClearCart = () => {
//         if (!cartItems.length) return;
//         Alert.alert(
//             "Clear Cart",
//             "This will remove all items from your cart. This cannot be undone.",
//             [
//                 { text: "Cancel", style: "cancel" },
//                 {
//                     text: "Clear Cart",
//                     style: "destructive",
//                     onPress: async () => {
//                         try {
//                             setActionLoading(true);
//                             await clearCart();
//                             setSelectedIds([]);
//                             await fetchCart(true);
//                         } catch (err: any) {
//                             Alert.alert(
//                                 "Error",
//                                 err?.toString() ?? "Failed to clear cart",
//                             );
//                         } finally {
//                             setActionLoading(false);
//                         }
//                     },
//                 },
//             ],
//         );
//     };

//     const handleHold = async () => {
//         if (!selectedIds.length) {
//             Alert.alert(
//                 "Select Diamonds",
//                 "Please select at least one diamond to hold.",
//             );
//             return;
//         }

//         const selectedDiamonds = cartItems.filter((item) =>
//             selectedIds.includes(item.diamond._id),
//         );

//         try {
//             setActionLoading(true);
//             await Promise.all(
//                 selectedDiamonds.map((item) =>
//                     holdDiamond(item.diamond.stockRef),
//                 ),
//             );
//             Alert.alert(
//                 "Success",
//                 `${selectedDiamonds.length} diamond(s) held successfully.`,
//             );
//             setSelectedIds([]);
//             await fetchCart(true);
//         } catch (err: any) {
//             Alert.alert("Error", err?.toString() ?? "Failed to hold diamonds");
//         } finally {
//             setActionLoading(false);
//         }
//     };

//     // ── Render ───────────────────────────────────────────────────────────────

//     return (
//         <SafeAreaView className="flex-1 bg-gray-50">
//             <AppHeader />
//             {/* Header */}
//             <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
//                 <TouchableOpacity
//                     onPress={() => router.back()}
//                     className="w-9 h-9 items-center justify-center"
//                 >
//                     <Ionicons name="arrow-back" size={24} color="#49214c" />
//                 </TouchableOpacity>
//                 <Text className="text-xl font-loraBold text-primary-purple">
//                     My Cart
//                 </Text>
//                 <Text className="text-sm font-lato text-gray-400">
//                     {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
//                 </Text>
//             </View>

//             {loading ? (
//                 // ── Skeleton ────────────────────────────────────────────────
//                 <ScrollView className="flex-1 px-4 pt-4">
//                     {[...Array(4)].map((_, i) => (
//                         <DiamondCardSkeleton key={i} />
//                     ))}
//                 </ScrollView>
//             ) : cartItems.length === 0 ? (
//                 // ── Empty state ─────────────────────────────────────────────
//                 <View className="flex-1 items-center justify-center gap-4 px-8">
//                     <Ionicons name="cart-outline" size={72} color="#d1d5db" />
//                     <Text className="text-lg font-latoBold text-gray-400">
//                         Your cart is empty
//                     </Text>
//                     <Text className="text-sm font-lato text-gray-400 text-center">
//                         Browse our inventory and add diamonds to your cart.
//                     </Text>
//                     <TouchableOpacity
//                         onPress={() => router.push("/(tabs)/inventory")}
//                         className="mt-2 bg-primary-purple px-6 py-3 rounded-lg"
//                     >
//                         <Text className="text-white font-latoBold text-sm">
//                             Browse Inventory
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             ) : (
//                 <>
//                     {/* ── Toolbar ─────────────────────────────────────────── */}
//                     <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between">
//                         {/* Select all */}
//                         <TouchableOpacity
//                             onPress={toggleAll}
//                             className="flex-row items-center gap-2"
//                         >
//                             <View
//                                 className="w-5 h-5 rounded border-2 border-primary-purple items-center justify-center"
//                                 style={{
//                                     backgroundColor: isAllSelected
//                                         ? "#49214c"
//                                         : "transparent",
//                                 }}
//                             >
//                                 {isAllSelected && (
//                                     <Ionicons
//                                         name="checkmark"
//                                         size={12}
//                                         color="#fff"
//                                     />
//                                 )}
//                             </View>
//                             <Text className="text-sm font-lato text-gray-600">
//                                 {isAllSelected ? "Deselect All" : "Select All"}
//                             </Text>
//                         </TouchableOpacity>

//                         {/* Action buttons */}
//                         <View className="flex-row items-center gap-3">
//                             {/* Remove selected */}
//                             <TouchableOpacity
//                                 onPress={handleRemoveSelected}
//                                 disabled={!selectedIds.length || actionLoading}
//                                 className="flex-row items-center gap-1 opacity-100"
//                                 style={{
//                                     opacity:
//                                         selectedIds.length && !actionLoading
//                                             ? 1
//                                             : 0.4,
//                                 }}
//                             >
//                                 <Ionicons
//                                     name="trash-outline"
//                                     size={18}
//                                     color="#49214c"
//                                 />
//                             </TouchableOpacity>

//                             {/* Hold selected */}
//                             <TouchableOpacity
//                                 onPress={handleHold}
//                                 disabled={!selectedIds.length || actionLoading}
//                                 style={{
//                                     opacity:
//                                         selectedIds.length && !actionLoading
//                                             ? 1
//                                             : 0.4,
//                                 }}
//                                 className="flex-row items-center gap-1 bg-primary-purple px-3 py-1.5 rounded-lg"
//                             >
//                                 {actionLoading ? (
//                                     <ActivityIndicator
//                                         size="small"
//                                         color="#fff"
//                                     />
//                                 ) : (
//                                     <>
//                                         <Ionicons
//                                             name="hand-left-outline"
//                                             size={14}
//                                             color="#fff"
//                                         />
//                                         <Text className="text-white text-xs font-latoBold ml-1">
//                                             Hold{" "}
//                                             {selectedIds.length > 0
//                                                 ? `(${selectedIds.length})`
//                                                 : ""}
//                                         </Text>
//                                     </>
//                                 )}
//                             </TouchableOpacity>

//                             {/* Clear cart */}
//                             <TouchableOpacity
//                                 onPress={handleClearCart}
//                                 disabled={actionLoading}
//                                 style={{ opacity: actionLoading ? 0.4 : 1 }}
//                             >
//                                 <Ionicons
//                                     name="close-circle-outline"
//                                     size={20}
//                                     color="#ef4444"
//                                 />
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* ── List ────────────────────────────────────────────── */}
//                     <FlatList
//                         data={cartItems}
//                         keyExtractor={(item) => item.diamondId}
//                         contentContainerStyle={{ padding: 16 }}
//                         refreshControl={
//                             <RefreshControl
//                                 refreshing={refreshing}
//                                 onRefresh={onRefresh}
//                                 tintColor="#49214c"
//                             />
//                         }
//                         renderItem={({ item }) => (
//                             <CartCard
//                                 item={item}
//                                 selected={selectedIds.includes(
//                                     item.diamond._id,
//                                 )}
//                                 onToggleSelect={() =>
//                                     toggleOne(item.diamond._id)
//                                 }
//                                 onRemove={() =>
//                                     handleRemoveOne(item.diamond._id)
//                                 }
//                             />
//                         )}
//                         ListFooterComponent={
//                             cartItems.length > 0 ? (
//                                 <View className="mt-2 mb-6 border-t border-gray-200 pt-4">
//                                     <View className="flex-row justify-between">
//                                         <Text className="text-sm font-lato text-gray-500">
//                                             Total Items
//                                         </Text>
//                                         <Text className="text-sm font-latoBold text-primary-purple">
//                                             {cartItems.length}
//                                         </Text>
//                                     </View>
//                                     <View className="flex-row justify-between mt-1">
//                                         <Text className="text-sm font-lato text-gray-500">
//                                             Total Weight
//                                         </Text>
//                                         <Text className="text-sm font-latoBold text-primary-purple">
//                                             {cartItems
//                                                 .reduce(
//                                                     (sum, i) =>
//                                                         sum +
//                                                         (i.diamond.weight ?? 0),
//                                                     0,
//                                                 )
//                                                 .toFixed(2)}{" "}
//                                             CT
//                                         </Text>
//                                     </View>
//                                     <View className="flex-row justify-between mt-1">
//                                         <Text className="text-base font-latoBold text-gray-700">
//                                             Grand Total
//                                         </Text>
//                                         <Text className="text-base font-latoBold text-primary-purple">
//                                             $
//                                             {cartItems
//                                                 .reduce(
//                                                     (sum, i) =>
//                                                         sum +
//                                                         (i.diamond.weight ??
//                                                             0) *
//                                                             (i.diamond
//                                                                 .pricePerCts ??
//                                                                 0),
//                                                     0,
//                                                 )
//                                                 .toLocaleString("en-US", {
//                                                     minimumFractionDigits: 2,
//                                                     maximumFractionDigits: 2,
//                                                 })}
//                                         </Text>
//                                     </View>
//                                 </View>
//                             ) : null
//                         }
//                     />
//                 </>
//             )}
//         </SafeAreaView>
//     );
// }
