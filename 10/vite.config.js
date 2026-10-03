import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      manifest: {
        name: "Tågförseningar",
        short_name: "Tåg",
        description: "Se försenade och inställda tåg i Sverige, live på karta.",
        icons: [
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        background_color: "#2b3a55",
        display: "standalone",
        theme_color: "#2b3a55",
      },
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
        runtimeCaching: [
          {
            // Stationsdata ändras sällan - CacheFirst
            urlPattern: ({ url }) =>
              url.hostname === "trafik.emilfolino.se" &&
              url.pathname === "/stations",
            handler: "CacheFirst",
            options: {
              cacheName: "stations-cache",
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Förseningsdata ändras ofta - NetworkFirst
            urlPattern: ({ url }) =>
              url.hostname === "trafik.emilfolino.se" &&
              url.pathname === "/delayed",
            handler: "NetworkFirst",
            options: {
              cacheName: "delayed-cache",
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      registerType: "autoUpdate",
    }),
  ],
  server: {
    port: 5183,
  },
});
