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
// áp dụng theme lên giao diện
const applyTheme = (theme: Theme) => {
  const html = document.documentElement
  if (theme === "dark") {
    html.classList.add("dark")
  } else {
    html.classList.remove("dark")
  }
  localStorage.setItem("app-theme", theme)
}

// chạy ngay lập tức khi file được import lần đầu
const initialTheme = getInitialTheme()
applyTheme(initialTheme)
// store chính cho các component khác sử dụng
export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme: Theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
