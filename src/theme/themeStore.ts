import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Replaces shared_preferences

type ThemeState = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Default
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'theme-storage', // Key for localStorage (replaces SharedPreferences)
    }
  )
);