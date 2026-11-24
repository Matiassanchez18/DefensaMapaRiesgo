
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      inicioSesion: false,
      usuario: null,
      token: null,

      login: (usuario, token) =>
        set({
          inicioSesion: true,
          usuario,
          token,
        }),

      logout: () =>
        set({
          inicioSesion: false,
          usuario: null,
          token: null,
        }),
    }),
    {
      name: "sesion-usuario",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
