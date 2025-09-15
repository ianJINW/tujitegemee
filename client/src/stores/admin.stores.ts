// stores/useAdminStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  name: string;
  email: string;
  id: number;
}

interface AdminState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (user: User) => void;
  logout: () => void;
}

const useAdminStore = create<AdminState>()(
  persist(
    (set,) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: true,

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },
    }),
    {
      name: "admin-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

export default useAdminStore;
