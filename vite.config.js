import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { codeInspectorPlugin } from "code-inspector-plugin";
export default defineConfig({
  plugins: [
    vue(),
    codeInspectorPlugin({
      bundler: "vite",
      editor: 'code', // 指定 IDE 为 vscode
    }),
  ],
  resolve: {
    alias: {
      "@": "/frontend",
    },
  },
  server: {
    open: true,
    proxy: {
      // Proxy API requests to Django backend during development
      "/api": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
