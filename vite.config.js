import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // INTL_PRICING=1 (Vercel env) switches customers outside Türkiye to USD prices; keep in sync with the server flag
    __INTL_PRICING__: JSON.stringify(process.env.INTL_PRICING === '1'),
  },
})
