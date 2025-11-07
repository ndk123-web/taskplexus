import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name?: string;
  email: string;
  userId: string;
  _accessToken: string;
  _refreshToken: string;
  auth?: boolean;
}

interface UserState {
  userInfo: User | null;
  signinUser: (data: User) => void;
  signOutUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userInfo: null,

      // put the info in userInfo
      signinUser: (data) => {
        set({
          userInfo: {
            ...data,
            name: data.email,
            auth: true,
          },
        });
      },

      // signout the info
      signOutUser: () => {
        set({ userInfo: null });
      },
    }),
    {
      name: "user-store", // key for localStorage
    }
  )
);

export default useUserStore;
