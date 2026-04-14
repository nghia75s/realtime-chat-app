import path from "path" // Thêm dòng này
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // Giữ nguyên plugin tailwind bạn đã cài

export default defineConfig({
  // server: {
  //   proxy: {
  //   "/api": {
  //     target: "http://localhost:3080",
  //     changeOrigin: true,
  //   },
  // },
  //   allowedHosts: true,
  // },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})