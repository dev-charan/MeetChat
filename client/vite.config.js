import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ✅ No '@tailwindcss/vite' needed here
export default defineConfig({
  plugins: [react()],
});
