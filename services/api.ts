import axios, { AxiosError, AxiosResponse } from "axios";

const BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// // Request Interceptor - Log access token if present
// apiClient.interceptors.request.use(
//     (config) => {
//         const token = config.headers?.Authorization;
//         if (token) {
//             console.log("Access Token:", token);
//         } else {
//             console.log("No access token found in headers.");
//         }
//         return config;
//     },
//     (error) => Promise.reject(error),
// );

// Response Interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            console.log("Unauthorized! User needs to log in.");
            // Handle redirect in React Native differently
        }
        return Promise.reject(error);
    },
);

export default apiClient;
