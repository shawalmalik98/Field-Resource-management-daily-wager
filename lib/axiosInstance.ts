// utils/axiosInstance.ts
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "./constants";

const axiosInstance = axios.create({
	baseURL: BACKEND_URL,
	withCredentials: true,
});

axiosInstance.defaults.withCredentials = true;

// Add a request interceptor
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("wager_token");
		if (token) {
			config.headers["authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);
// Add response interceptor
axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error: AxiosError) => {
		const resError = (error.response?.data as { error: string }) ?? {
			error: error.message,
		};

		return Promise.reject(resError.error);
	}
);

export default axiosInstance;
