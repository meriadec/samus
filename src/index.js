#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

import Samus from './samus'

const url = process.argv[2] || ''

const configFileName = path.join(process.env.HOME, '.samusrc')
const config = {
  defaultServer: null
}

fs.readFile(configFileName, { encoding: 'utf8' }, (err, l) => {
  if (!err) {
    try {
      const loaded = JSON.parse(l)
      Object.assign(config, loaded)
    } catch (e) {
      console.log(e)
    }
  }
  if (!url && (!config || !config.defaultServer || !config.defaultServer.url)) {
    console.log('usage: samus <url>')
    process.exit(0)
  }
  new Samus(url, config)
})
