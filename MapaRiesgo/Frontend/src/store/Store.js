import { create } from "zustand";

const useAuthStore = create((set) => ({
  inicioSesion: false,
  usuario: null,
  token: null,

  login: (usuario, token) => set({ inicioSesion: true, usuario, token }),
  logout: () => set({ inicioSesion: false, usuario: null, token: null }),
}));

export default useAuthStore;