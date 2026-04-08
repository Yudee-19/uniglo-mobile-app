import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export function AppHeader() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const pathname = usePathname();

    const isCartActive = pathname.startsWith("/cart");
    const isProfileActive = pathname.startsWith("/profile");

    const handleProtectedNavigation = (route: "/cart" | "/profile", label: string) => {
        if (!isAuthenticated) {
            Alert.alert(
                "Login Required",
                `Please login to access ${label}.`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Login",
                        onPress: () => router.push("/(auth)/login"),
                    },
                ],
            );
            return;
        }
        router.push(route);
    };

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
                    onPress={() => handleProtectedNavigation("/cart", "Cart")}
                    className="w-9 h-9 items-center justify-center"
                    disabled={authLoading}
                >
                    <Ionicons
                        name={isCartActive ? "cart" : "cart-outline"}
                        size={24}
                        color="#49214c"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleProtectedNavigation("/profile", "Profile")}
                    className="w-9 h-9 items-center justify-center"
                    disabled={authLoading}
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
