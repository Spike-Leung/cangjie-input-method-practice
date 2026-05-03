import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/cangjie-practice/',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
  },
});
