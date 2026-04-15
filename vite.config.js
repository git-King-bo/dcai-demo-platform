import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { codeInspectorPlugin } from "code-inspector-plugin";

function resolveProxyTarget(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = resolveProxyTarget(
    env.VITE_API_BASE_URL,
    "http://localhost:8000",
  );
  const agentWsTarget = resolveProxyTarget(env.VITE_AGENT_WS_URL, apiTarget);
  const base = env.VITE_PUBLIC_BASE || "/";
  const isProd = mode === "production";

  return {
    base,
    plugins: [
      vue(),
      !isProd &&
        codeInspectorPlugin({
          bundler: "vite",
          editor: "code",
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": "/frontend",
      },
    },
    server: {
      open: true,
      host: true,
      port: 5174,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
        // "/dataflow/socket.io": {
        //   target: agentWsTarget,
        //   changeOrigin: true,
        //   ws: true,
        // },
      },
    },
    preview: {
      host: true,
      port: 4174,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: env.VITE_BUILD_SOURCEMAP === "true",
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) {
              return;
            }

            if (id.includes("element-plus")) {
              return "vendor-element-plus";
            }

            if (id.includes("@vue-flow")) {
              return "vendor-vue-flow";
            }

            if (
              id.includes("graphology") ||
              id.includes("sigma")
            ) {
              return "vendor-graph";
            }

            if (
              id.includes("markdown-it") ||
              id.includes("highlight.js") ||
              id.includes("katex") ||
              id.includes("pdfjs")
            ) {
              return "vendor-content";
            }

            if (
              id.includes("vue") ||
              id.includes("vue-router") ||
              id.includes("vue-i18n") ||
              id.includes("pinia")
            ) {
              return "vendor-vue";
            }

            return "vendor-misc";
          },
        },
      },
    },
  };
});
