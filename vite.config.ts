import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "url"
import checker from "vite-plugin-checker"
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    checker({
        typescript: true,
    }),
],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: './'
})
