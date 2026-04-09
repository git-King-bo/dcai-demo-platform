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

  return {
    plugins: [
      vue(),
      codeInspectorPlugin({
        bundler: "vite",
        editor: "code",
      }),
    ],
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
  };
});
