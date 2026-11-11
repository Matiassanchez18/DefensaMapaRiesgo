
import { create } from "zustand";

const useAuthStore = create((set) => ({
  inicioSesion: false,
  usuario: null,

  login: (usuario) => set({ inicioSesion: true, usuario }),
  logout: () => set({ inicioSesion: false, usuario: null }),
}));

export default useAuthStore;    