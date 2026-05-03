import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/cangjie-input-method-practice/',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
  },
});
