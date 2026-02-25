import { AppHeader } from "@/components/shared/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
                                Alert.alert(
                                    "Authentication Required",
                                    "Please login to access Inventory",
                                );
                                router.push("/(auth)/login");
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
                                Alert.alert(
                                    "Authentication Required",
                                    "Please login to access Operations",
                                );
                                router.push("/(auth)/login");
                            }
                        },
                    }}
                />
            </Tabs>
        </SafeAreaView>
    );
}
