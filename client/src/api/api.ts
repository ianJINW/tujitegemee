import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./axios";
import useAdminStore from "../stores/admin.stores";
import { useToastStore } from "../stores/toast.store";
import type { LoginRequest, LoginResponse } from "../stores/admin.stores";

type MutationPayload = Record<string, unknown> | FormData;

const usePostInfo = (url: string) => {
	return useMutation({
		mutationFn: (data: MutationPayload) => {
			return api.post(url, data);
		},
		onSuccess: (data) => {
			console.log("Info sent successfully:", data);
			useToastStore.getState().addToast("Info sent successfully", "success");
		},
		onError: (error) => {
			console.error("Error sending info:", error);
			useToastStore.getState().addToast("Error sending info", "error");
		},
	});
};

const useGetInfo = (url: string) => {
	return useQuery({
		queryKey: [url],
		queryFn: async () => {
			const res = await api.get(url);
			return res.data;
		},
	});
};

const LoginUser = (url: string) => {
	const login = useAdminStore((state) => state.login);

	return useMutation({
		mutationFn: (data: LoginRequest) => api.post<LoginResponse>(url, data),
		onSuccess: (response) => {
			console.log("Login response:", response);

			const { user, token } = response.data;

			if (!user || !token) {
				console.error("Invalid login response:", response.data);
				return;
			}

			login(response.data);
			console.log("Login successful");
		},
		onError: (error) => {
			console.error("Login failed:", error);
		},
	});
};

const LogoutUser = (url: string) => {
	const logout = useAdminStore((state) => state.logout);

	return useQuery({
		queryKey: [url],
		queryFn: async () => {
			try {
				const res = await api.get(url);
				logout();
				return res.data;
			} catch (err: unknown) {
				console.error(err, "error in logging out");
			}
		},
	});
};

export { usePostInfo, useGetInfo, LoginUser, LogoutUser };
