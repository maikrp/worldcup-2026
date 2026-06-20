import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api/live": {
        target: "https://worldcup26.ir",
        changeOrigin: true,
        rewrite: () => "/get/games",
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "worldcup-apple-touch.png",
        "wc2026-logo.png",
        "hero-mascots.webp",
        "worldcup-share-v3.jpg",
      ],
      manifest: {
        id: "/fifa-worldcup-2026-v3",
        name: "Mundial 2026 Dashboard",
        short_name: "Mundial 2026",
        description:
          "Dashboard no oficial del Mundial 2026 con calendario, grupos y pronósticos estadísticos.",
        theme_color: "#0b0f19",
        background_color: "#0b0f19",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        lang: "es",
        categories: ["sports", "news", "entertainment"],
        icons: [
          {
            src: "/worldcup-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/worldcup-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/worldcup-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,webp,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /\/api\/live(?:\?.*)?$/,
            handler: "NetworkOnly",
            method: "GET",
          },
        ],
      },
    }),
  ],
});
