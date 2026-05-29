import path from "path" // Thêm dòng này
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // Giữ nguyên plugin tailwind bạn đã cài

export default defineConfig({
  // server: {
  //   proxy: {
  //   '/socket.io': {
  //     target: 'http://localhost:3000',
  //     ws: true
  //   },
  //   "/api": {
  //     target: "http://localhost:3000",
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