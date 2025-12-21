// A tiny "lint" script: scans source files for the literal "..." inside quotes.
// It's a common accident when people use placeholder text while designing.
//
// Run: npm run lint

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = join(process.cwd(), 'src')

function walk(dir) {
  for (const it of readdirSync(dir)) {
    const full = join(dir, it)
    const st = statSync(full)

    if (st.isDirectory()) {
      walk(full)
      continue
    }

    if (!full.endsWith('.js') && !full.endsWith('.jsx')) continue

    const text = readFileSync(full, 'utf8')
    const lines = text.split(/\r?\n/)

    lines.forEach((line, idx) => {
      // Line-scoped regex, so we don't accidentally match across many lines.
      const bad = /["'`][^"'`]*\.\.\.[^"'`]*["'`]/
      if (bad.test(line)) {
        console.log(`Possible placeholder found in: ${full}:${idx + 1}`)
        console.log(`  -> ${line.trim()}`)
        process.exitCode = 1
      }
    })
  }
}

walk(root)
if (process.exitCode === 1) {
  console.log('\nFix placeholders then re-run.')
} else {
  console.log('OK: no placeholder strings found.')
}
