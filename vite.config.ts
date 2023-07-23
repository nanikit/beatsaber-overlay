import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cloudflarePagesFunctions from "vite-plugin-cloudflare-functions";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: [[
          "@babel/preset-env",
          {
            "corejs": "3.22",
            "useBuiltIns": "usage",
            "modules": false,
          },
        ]],
        plugins: ["jotai/babel/plugin-react-refresh"],
      },
    }),
    cloudflarePagesFunctions({ dts: "cloudflare.d.ts.log" }),
  ],
});
