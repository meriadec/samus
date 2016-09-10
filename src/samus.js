#!/usr/bin/env node

import program from 'commander'

import Samus from './core'
import loadConfig from './load-config'
import { load as loadHistory } from './history'

program
  .version('1.3.0')
  .usage('[options] <url>')
  .option('-f, --fullscreen', 'launch mpv in fullscreen')
  .parse(process.argv)

loadHistory()
  .then(() => loadConfig())
  .then(config => {

    const url = program.args[0]

    if (!url && (!config || !config.defaultServer || !config.defaultServer.url)) {
      console.log('No url given.')
      console.log('try `samus -h` to see usage')
      process.exit(0)
    }

    new Samus(url, config, program)

  })
