import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import api from "../api/axios";

interface User {
  name: string;
  email: string;
  id: number;
  role: string;
}

interface AdminState {
  admin: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (user: User) => void;
  logout: () => void;
  clear: () => void;

  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

const useAdminStore = create<AdminState>()(
  persist(
    (set/* , get, store */) => ({
      admin: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user) => {
        const adminFlag = user.role === "admin";
        set({
          admin: user,
          isAuthenticated: true,
          isAdmin: adminFlag,
        });
      },

      logout: () => {
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
      setHasHydrated: (v) => {
        set({ _hasHydrated: v });
      },
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
            // still mark hydrated so UI can proceed
            store.setHasHydrated(true);
            return;
          }

          // persistedState is the object read from storage: it contains the partials
          console.log("persistedState:", persistedState);

          const refreshURL = import.meta.env.VITE_APP_REFRESH__URL;
          const logoutURL = import.meta.env.VITE_APP_LOGOUT__URL;

          if (persistedState && persistedState.admin) {
            try {
              await api.get(refreshURL);
            } catch (err) {
              console.error("Refresh failed:", err);
              // Attempt logout API
              try {
                await api.get(logoutURL);
              } catch (logoutErr) {
                console.error("Logout failed:", logoutErr);
              }
              // Reset store state
              store.clear();
            }
          }
          // Always mark hydrated (even if no admin)
          store.setHasHydrated(true);
        };
      },
    }
  )
);

export default useAdminStore;
