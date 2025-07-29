import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
	const isDev = mode === 'development';
	const isProd = mode === 'production';

	return {
		plugins: [tailwindcss(), sveltekit()],

		// Development server configuration
		server: {
			port: 5173,
			host: true, // Allow external connections
			cors: true
			// Proxy API requests during development if needed
			// proxy: {
			//   '/api': 'http://localhost:8000'
			// }
		},

		// Build optimizations
		build: {
			// Production optimizations
			minify: isProd ? 'esbuild' : false,
			sourcemap: isDev ? 'inline' : false,
			target: 'esnext',

			// Chunk splitting for better caching
			rollupOptions: {
				output: {
					// Separate vendor chunks
					manualChunks: isProd
						? {
								vendor: ['svelte']
								// Add other vendor libraries here
							}
						: undefined,

					// Better chunk naming for caching
					chunkFileNames: isProd ? 'assets/[name]-[hash].js' : 'assets/[name].js',
					entryFileNames: isProd ? 'assets/[name]-[hash].js' : 'assets/[name].js',
					assetFileNames: isProd ? 'assets/[name]-[hash].[ext]' : 'assets/[name].[ext]'
				}
			},

			// Performance optimizations
			reportCompressedSize: isProd,
			chunkSizeWarningLimit: 1000
		},

		// CSS optimization
		css: {
			devSourcemap: isDev
		},

		// Dependency optimization
		optimizeDeps: {
			include: [
				// Pre-bundle these dependencies
			],
			exclude: [
				// Don't pre-bundle these
			]
		},

		// Define global constants
		define: {
			// Global constants can be defined here
		},

		// Performance and debugging
		esbuild: {
			// Remove debugger statements in production
			drop: isProd ? ['debugger'] : [],
			// Keep function names for better stack traces
			keepNames: true
		},

		// Preview configuration (for npm run preview)
		preview: {
			port: 4173,
			host: true
		}
	};
});
