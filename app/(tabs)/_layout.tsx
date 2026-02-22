import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function AppHeader() {
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
            <TouchableOpacity
                onPress={() => router.push("/cart")}
                className="w-9 h-9 items-center justify-center"
            >
                <Ionicons name="cart-outline" size={24} color="#49214c" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push("/profile")}
                className="w-9 h-9 items-center justify-center"
            >
                <Ionicons name="person-outline" size={24} color="#49214c" />
            </TouchableOpacity>
        </View>
    );
}

export default function TabsLayout() {
    const { isAuthenticated } = useAuth();

    return (
        <SafeAreaView className="flex-1">
            <AppHeader />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#49214c",
                    tabBarInactiveTintColor: "#9CA3AF",
                    tabBarStyle: {
                        backgroundColor: "#FFFFFF",
                        borderTopWidth: 0,
                        height: Platform.OS === "ios" ? 88 : 60,
                        paddingTop: 4,
                        paddingBottom: Platform.OS === "ios" ? 28 : 8,
                        elevation: 0,
                        // shadowOffset: { width: 0, height: 0 },
                        // shadowOpacity: 0,
                        // shadowRadius: 0,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: "500",
                        marginBottom: 4,
                    },
                }}
            >
                <Tabs.Screen
                    name="inventory"
                    options={{
                        title: "Inventory",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "cube" : "cube-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            if (!isAuthenticated) {
                                e.preventDefault();
                                alert("Please login to access Inventory");
                                router.push("/login");
                            }
                        },
                    }}
                />
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? "home" : "home-outline"}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="operations"
                    options={{
                        title: "Operations",
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={
                                    focused ? "briefcase" : "briefcase-outline"
                                }
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            if (!isAuthenticated) {
                                e.preventDefault();
                                alert("Please login to access Operations");
                                router.push("/login");
                            }
                        },
                    }}
                />
                <Tabs.Screen
                    name="cart"
                    options={{
                        href: null, // This hides the tab from the bottom bar
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
