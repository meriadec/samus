#!/usr/bin/env node

import program from 'commander'

import Samus from './core'
import loadConfig, { prettyfyUrl } from './load-config'
import { load as loadHistory } from './history'

program
  .version('1.3.0')
  .usage('[options] <url>')
  .option('-f, --fullscreen', 'launch mpv in fullscreen')
  .parse(process.argv)

Promise.resolve()
  .then(loadConfig)
  .then(config => loadHistory(config).then(() => config))
  .then(config => {
    const url = prettyfyUrl(program.args[0])
    new Samus(url, config, program)
  })
