// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { Image, Text, TouchableOpacity, View } from "react-native";

// interface AppHeaderProps {
//     showBack?: boolean;
//     title?: string;
// }

// export function AppHeader({ showBack = false, title }: AppHeaderProps) {
//     return (
//         <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
//             {/* Left - Back button or Logo */}
//             {showBack ? (
//                 <TouchableOpacity
//                     onPress={() => router.back()}
//                     className="w-9 h-9 items-center justify-center"
//                 >
//                     <Ionicons name="arrow-back" size={24} color="#49214c" />
//                 </TouchableOpacity>
//             ) : (
//                 <View className="flex-row items-center gap-2 flex-1">
//                     <Image
//                         source={require("@/assets/images/logo.png")}
//                         className="w-10 h-10"
//                         resizeMode="contain"
//                     />
//                     <Text className="font-loraBold text-xl tracking-widest text-primary-purple">
//                         UNIGLO DIAMONDS
//                     </Text>
//                 </View>
//             )}

//             {/* Center title (when showBack is true) */}
//             {showBack && title && (
//                 <Text className="text-xl font-loraBold text-primary-purple flex-1 text-center">
//                     {title}
//                 </Text>
//             )}

//             {/* Right - Cart & Profile */}
//             <View className="flex-row items-center gap-1">
//                 <TouchableOpacity
//                     onPress={() => router.push("/cart")}
//                     className="w-9 h-9 items-center justify-center"
//                 >
//                     <Ionicons name="cart-outline" size={24} color="#49214c" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     onPress={() => router.push("/profile")}
//                     className="w-9 h-9 items-center justify-center"
//                 >
//                     <Ionicons name="person-outline" size={24} color="#49214c" />
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// }
