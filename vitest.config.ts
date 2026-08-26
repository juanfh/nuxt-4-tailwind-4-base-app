import { defineVitestConfig } from '@nuxt/test-utils/config'

/* 
`defineVitestConfig` (no `defineConfig` de "vitest/config" a secas) carga nuxt.config.ts y de ahí deriva el resolve/alias de Vite
 — necesario para que los tests resuelvan `#shared/...` igual que en código de app. 
*/
export default defineVitestConfig({
  test: {
    /* 
    Los archivos que necesitan auto-imports de Nuxt reales (composables, $fetch contra server/api mockeado) 
    se marcan por archivo con @vitest-environment nuxt. 
    */
    environment: 'jsdom',
    environmentOptions: {
      nuxt: {
        /* 
        domEnvironment: 'jsdom' (no el 'happy-dom' por defecto del environment 'nuxt'), para que los archivos 
        marcados @vitest-environment nuxt compartan el mismo DOM que el resto. 
        */
        domEnvironment: 'jsdom',
      },
    },
    setupFiles: ['./test/setup.ts'],
    include: ['app/**/*.test.ts', 'server/**/*.test.ts', 'shared/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts', 'shared/**/*.ts'],
      exclude: [
        '**/*.d.ts',
        'app/pages/**',
        'app/layouts/**',
        'app/middleware/**',
        'app/i18n/**',
        'app/plugins/**',
        'shared/types/**',
        /* Se testean indirectamente a través de los componentes de dominio que los usan, sin exigirles cobertura propia. */
        'app/components/ui/**',
        'app/components/common/**',
      ],
    },
  },
})
