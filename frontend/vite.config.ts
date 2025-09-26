import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        // Include .tsx files
        include: "**/*.tsx",
        // Babel configuration for better performance
        babel: {
          plugins: [
            // Add any additional babel plugins here
          ],
        },
      }),
    ],

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME),
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@context': path.resolve(__dirname, './src/context'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@locales': path.resolve(__dirname, './src/locales'),
      },
    },

    // CSS configuration
    css: {
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
      },
      // PostCSS configuration
      postcss: {
        plugins: [
          // PostCSS plugins are loaded from postcss.config.js
        ],
      },
      // CSS preprocessor options
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
      },
    },

    // Development server configuration
    server: {
      host: true, // Listen on all addresses
      port: 5173,
      strictPort: true, // Exit if port is already in use
      open: true, // Open browser on server start
      cors: true,

      // Proxy API requests to Laravel backend
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          ws: true, // Enable websocket proxy
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req, _res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          },
        },
        // Proxy Laravel Sanctum CSRF cookie endpoint
        '/sanctum': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        // Proxy WebSocket connections
        '/socket.io': {
          target: env.VITE_WS_URL || 'ws://localhost:8000',
          ws: true,
          changeOrigin: true,
        },
      },

      // HMR configuration
      hmr: {
        overlay: true, // Show error overlay
      },
    },

    // Preview server configuration (for production preview)
    preview: {
      port: 4173,
      strictPort: true,
      cors: true,
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',

      // Generate source maps for production
      sourcemap: mode === 'development' ? 'inline' : false,

      // Minify options
      minify: 'esbuild',

      // Target browsers
      target: 'es2015',

      // Asset handling
      assetsDir: 'assets',
      assetsInlineLimit: 4096,

      // Rollup options
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // Manual chunks for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['framer-motion', 'lucide-react'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
            i18n: ['i18next', 'react-i18next'],
            http: ['axios'],
          },
          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const extType = info[info.length - 1];

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff|woff2|eot|ttf|otf/i.test(extType || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[ext]/[name]-[hash][extname]`;
          },
        },
        external: [],
      },

      // Build performance options
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false,
    },

    // Optimization configuration
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'framer-motion',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers',
        'zod',
        'clsx',
        'tailwind-merge',
        'i18next',
        'react-i18next',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },

    // Environment variables
    envPrefix: 'VITE_',
    envDir: '.',

    // Logging
    logLevel: mode === 'development' ? 'info' : 'warn',
    clearScreen: false,

    // Experimental features
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `/${filename}` };
        } else {
          return { relative: true };
        }
      },
    },

    // Worker configuration
    worker: {
      format: 'es',
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false,
    },

    // ESBuild configuration
    esbuild: {
      // Drop console and debugger in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // JSX configuration
      jsxDev: mode === 'development',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
  }
})
