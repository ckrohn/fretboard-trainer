import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const isGitHubPages = mode === 'github-pages'

  return {
    plugins: [react()],
    base: isGitHubPages ? '/fretboard-trainer/' : '/',
  }
})
