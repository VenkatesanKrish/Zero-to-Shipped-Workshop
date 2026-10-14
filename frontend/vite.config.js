import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React plugin gives us JSX and Fast Refresh (edit a component, see it
// update without losing state).
export default defineConfig({
  plugins: [react()],

  // In dev, requests to /api are forwarded to the Express server. This is
  // nicer than calling http://localhost:5000 from the browser, because the
  // request looks same-origin to the browser and there is no CORS at all.
  // api.js uses a relative URL for exactly this reason.
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
