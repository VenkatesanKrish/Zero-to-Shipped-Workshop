import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React plugin gives us JSX and Fast Refresh (edit a component, see it
// update without losing state). Vite serves from the root index.html.
export default defineConfig({
  plugins: [react()],
});
