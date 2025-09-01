import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine if we're building for production
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    
    // Define global constants available in the app
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENVIRONMENT || mode),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || 'dev'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    
    build: {
      outDir: 'dist',
      sourcemap: !isProduction, // Source maps only in non-production
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          // Optimize chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['@headlessui/react', '@heroicons/react']
          }
        }
      },
      // Build performance optimizations
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
    },
    
    server: {
      port: 3000,
      host: true, // Allow external connections
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:7071',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    
    // Environment-specific optimizations
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    },
    
    // Preview server configuration (for local testing of builds)
    preview: {
      port: 4173,
      host: true
    }
  }
})
