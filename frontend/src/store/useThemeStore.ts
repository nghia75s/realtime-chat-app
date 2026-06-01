import { create } from "zustand"

type Theme = "light" | "dark"

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem("app-theme")
  if (saved === "light" || saved === "dark") return saved
  return "dark"
}

const applyTheme = (theme: Theme) => {
  const html = document.documentElement
  if (theme === "dark") {
    html.classList.add("dark")
  } else {
    html.classList.remove("dark")
  }
  localStorage.setItem("app-theme", theme)
}

// Apply theme ngay khi store được khởi tạo
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme: Theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
