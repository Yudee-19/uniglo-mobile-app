import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OperationsScreen() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <Text className="text-2xl font-bold">Operations</Text>
                {/* Add your operations screen content here */}
            </View>
        </SafeAreaView>
    );
}
