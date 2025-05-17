import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [[
          "@babel/preset-env",
          {
            "corejs": "3.36",
            "useBuiltIns": "usage",
            "modules": false,
          },
        ]],
        plugins: [jotaiDebugLabel, jotaiReactRefresh],
      },
    }),
    tailwindcss(),
    sentryVitePlugin({
      org: "nanikit",
      project: "beatsaber-overlay",
    }),
  ],

  build: {
    sourcemap: true,
  },
});
