#!/usr/bin/env node

import samus from './samus'

const url = process.argv[2]

if (!url) {
  console.log(`Usage: samus <url>`)
  process.exit(1)
}

samus(url)
