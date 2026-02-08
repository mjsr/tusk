import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import { loadEnv } from 'vite'

const monacoPlugin = (monacoEditorPlugin as any).default || monacoEditorPlugin

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    main: {
      define: {
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
      },
      build: {
        outDir: 'dist/main',
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'src/main/index.ts')
          }
        }
      }
    },
  preload: {
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: resolve(__dirname, 'src/main/preload.ts'),
        formats: ['cjs'],
        fileName: () => 'index.js'
      },
      rollupOptions: {
        external: ['electron'],
        output: {
          format: 'cjs'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    plugins: [
      react(),
      monacoPlugin({
        languageWorkers: ['editorWorkerService']
      })
    ],
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    }
  }
  }
})
