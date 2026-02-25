import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export function AppHeader() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const isCartActive = pathname.startsWith("/cart");
    const isProfileActive = pathname.startsWith("/profile");

    return (
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
            {/* Center - Logo */}
            <View className="flex-row items-center gap-2">
                <Image
                    source={require("@/assets/images/logo.png")}
                    className="w-10 h-10"
                    resizeMode="contain"
                />
                <Text className="font-loraBold text-xl tracking-widest text-primary-purple">
                    UNIGLO DIAMONDS
                </Text>
            </View>
            {/* Right - Cart & Profile */}
            <View className="flex-row items-center gap-4">
                <TouchableOpacity
                    onPress={() => router.push("/cart")}
                    className={
                        "w-9 h-9 items-center justify-center " +
                        (authLoading || !isAuthenticated ? "opacity-50" : "")
                    }
                    disabled={authLoading || !isAuthenticated}
                >
                    <Ionicons
                        name={isCartActive ? "cart" : "cart-outline"}
                        size={24}
                        color="#49214c"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push("/profile")}
                    className={
                        "w-9 h-9 items-center justify-center " +
                        (authLoading || !isAuthenticated ? "opacity-50" : "")
                    }
                    disabled={authLoading || !isAuthenticated}
                >
                    <Ionicons
                        name={isProfileActive ? "person" : "person-outline"}
                        size={24}
                        color="#49214c"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}
