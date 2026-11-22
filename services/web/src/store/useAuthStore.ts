import {create} from "zustand";
import {persist} from "zustand/middleware";

export type RoleType = 'user' | 'admin';

interface User {
    id: string;
    username: string;
    email: string;
    role: RoleType
}

interface AuthStore {
    token: string | null;
    user: User | null;
    isAuthModalOpen: boolean;
    setAuth: (token: string ,user: User) => void;
    logout: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
    requireAuth: (action: () => void) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            isAuthModalOpen: false,
            setAuth: (token, user) => set({ token, user, isAuthModalOpen: false }),
            logout: () => set({ token: null, user: null }),
            openAuthModal: () => set({ isAuthModalOpen: true }),
            closeAuthModal: () => set({ isAuthModalOpen: false }),
            requireAuth: (action: () => void) => {
                if (get().token) {
                    action();
                } else {
                    set({ isAuthModalOpen: true });
                }
            }
        }),
        {
            name: "matify-auth",
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
);