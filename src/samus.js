#!/usr/bin/env node

import program from 'commander'

import Samus from './core'
import loadConfig from './load-config'

program
  .version('1.2.0')
  .usage('[options] <url>')
  .option('-f, --fullscreen', 'launch mpv in fullscreen')
  .parse(process.argv)

loadConfig()
  .then(config => {

    const url = program.args[0]

    if (!url && (!config || !config.defaultServer || !config.defaultServer.url)) {
      console.log('No url given.')
      console.log('try `samus -h` to see usage')
      process.exit(0)
    }

    new Samus(url, config, program)

  })
/*
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
*/
