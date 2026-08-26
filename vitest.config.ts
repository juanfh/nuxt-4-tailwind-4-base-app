import { defineVitestConfig } from '@nuxt/test-utils/config'

// Port de vitest.config.ts (Next), adaptado: `defineVitestConfig` (en vez de
// `defineConfig` de "vitest/config" a secas) carga la config real de Nuxt
// (nuxt.config.ts) y de ahí deriva el resolve/alias de Vite — es lo que
// permite que los tests de `shared/`/`server/` resuelvan `#shared/...`
// exactamente igual que en código de app, sin duplicar esa tabla de alias
// aquí a mano. Ver .project_docs/tests.md.
export default defineVitestConfig({
  test: {
    // jsdom global (no 'node'), igual que el proyecto Next: los tests de
    // servicios/mappers no lo necesitan pero mantiene un único environment
    // por defecto en vez de dos configs distintas. Los tests que sí
    // necesitan auto-imports de Nuxt reales (composables, $fetch contra
    // server/api mockeado) se marcan por archivo con
    // `// @vitest-environment nuxt` — ver gotcha en tests.md.
    environment: 'jsdom',
    environmentOptions: {
      nuxt: {
        // domEnvironment: 'jsdom' (no el 'happy-dom' por defecto del
        // environment 'nuxt'), para que los archivos marcados
        // `@vitest-environment nuxt` compartan el mismo DOM que el resto.
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
        // Primitivas ui/ y wrappers common/: mismo criterio que
        // `src/components/ui/**`/`src/components/common/**` en Next — se
        // testean indirectamente a través de los componentes de dominio que
        // los usan, sin exigirles cobertura propia. Ver tests.md.
        'app/components/ui/**',
        'app/components/common/**',
      ],
    },
  },
})
