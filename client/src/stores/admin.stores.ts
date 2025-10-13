import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/axios";

export interface User {
	id: string;
	email: string;
	username: string;
	role: string;
}

export interface LoginResponse {
	user: User;
	token: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

interface AdminState {
	admin: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;

	login: (data: LoginResponse) => void;
	logout: () => void;
	clear: () => void;

	_hasHydrated: boolean;
	setHasHydrated: (v: boolean) => void;
}

const useAdminStore = create<AdminState>()(
	persist(
		(set) => ({
			admin: null,
			isAuthenticated: false,
			isAdmin: false,

			login: (response: LoginResponse) => {
				console.log("Login response:", response);

				const { user, token } = response;

				if (!user?.id || !user?.email || !user?.role) {
					console.error("Invalid user data:", user);
					return;
				}

				if (!token) {
					console.error("Token is required");
					return;
				}

				const adminFlag = user.role === "admin";

				// Store token
				localStorage.setItem("token", token);

				set({
					admin: user,
					isAuthenticated: true,
					isAdmin: adminFlag,
				});

				console.log("Login successful:", {
					user,
					isAuthenticated: true,
					isAdmin: adminFlag,
				});
			},

			logout: () => {
				localStorage.removeItem("token");
				set({
					admin: null,
					isAuthenticated: false,
					isAdmin: false,
				});
				useAdminStore.persist.clearStorage();
			},

			clear: () => {
				set({
					admin: null,
					isAuthenticated: false,
					isAdmin: false,
				});
			},

			_hasHydrated: false,
			setHasHydrated: (v) => set({ _hasHydrated: v }),
		}),
		{
			name: "admin-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				admin: state.admin,
				isAuthenticated: state.isAuthenticated,
				isAdmin: state.isAdmin,
			}),
			onRehydrateStorage: (store) => {
				return async (persistedState, error) => {
					if (error) {
						console.error("Rehydrate error:", error);
						store.setHasHydrated(true);
						return;
					}

					console.log("persistedState:", persistedState);

					const refreshURL = import.meta.env.VITE_APP_REFRESH__URL;
					const logoutURL = import.meta.env.VITE_APP_LOGOUT__URL;

					if (persistedState && persistedState.admin) {
						try {
							const response = await api.get(refreshURL);
							// assume response contains { user, token }
							const { user, token } = response.data;

							// Update store state with new token & user
							store.login({ user, token });
						} catch (err) {
							console.error("Refresh failed:", err);
							try {
								await api.get(logoutURL);
							} catch (logoutErr) {
								console.error("Logout failed:", logoutErr);
							}
							store.clear();
						}
					}

					store.setHasHydrated(true);
				};
			},
		}
	)
);

export default useAdminStore;
