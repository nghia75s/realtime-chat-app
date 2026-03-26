import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  authUser: {name: "Nghia", _id: 123, age: 22},
  isLoggedIn: false,
  isLoading: false,

  login: () => {
    console.log("login");
    set({ isLoggedIn: true, isLoading: true });

    

  }
}))
