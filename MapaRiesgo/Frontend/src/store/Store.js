
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      inicioSesion: false,
      usuario: null,

      login: (usuario) => set({
        inicioSesion: true,
        usuario,
      }),

      logout: () => set({
        inicioSesion: false,
        usuario: null,
      }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
