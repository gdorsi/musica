import { defineConfig } from "vite";
import { ConfigPlugin } from "@dxos/config/vite-plugin";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		host: true,
	},
	worker: {
		format: "es",
		plugins: () => [topLevelAwait(), wasm()],
	},

	plugins: [ConfigPlugin(), topLevelAwait(), wasm(), react()],
});
