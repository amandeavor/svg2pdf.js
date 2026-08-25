import { relative, resolve } from 'node:path'
import { promises as fs } from 'node:fs'
import type { Plugin } from 'vitest/config'

export function serveTestAssets(): Plugin {
  const fixtureRoot = resolve('test')

  return {
    name: 'serve-test-fixtures',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const fixtureUrl = request.url?.split('?', 1)[0]
        if (!fixtureUrl?.startsWith('/test/') || !fixtureUrl.endsWith('.css')) {
          next()
          return
        }

        const fixturePath = resolve(fixtureRoot, `.${decodeURIComponent(fixtureUrl.slice(5))}`)
        const relativePath = relative(fixtureRoot, fixturePath)
        if (!relativePath || relativePath.startsWith('..')) {
          next()
          return
        }

        try {
          const content = await fs.readFile(fixturePath)
          response.statusCode = 200
          response.setHeader('Content-Type', 'text/css')
          response.end(content)
        } catch {
          next()
        }
      })
    }
  }
}
