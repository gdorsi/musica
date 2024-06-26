
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import path from "node:path";

export default defineConfig({
	base: "/",

	build: { target: "esnext" },

	plugins: [wasm(), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	worker: {
		format: "es",
		plugins: () => [wasm()],
	},
});
