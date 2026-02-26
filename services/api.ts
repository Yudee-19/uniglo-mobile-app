import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosResponse } from "axios";
import { DeviceEventEmitter } from "react-native";

const BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor - Attach Bearer token from AsyncStorage
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error retrieving token from AsyncStorage:", error);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized! User needs to log in.");
            // Handle redirect in React Native differently
            DeviceEventEmitter.emit("EXPIRED_SESSION");
        }
        return Promise.reject(error);
    },
);

export default apiClient;
