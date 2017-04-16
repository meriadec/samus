#!/usr/bin/env node

import program from 'commander'

import { version } from '../package.json'
import Samus from './Samus'
import loadConfig, { prettyfyUrl } from './helpers/load-config'
import { load as loadHistory } from './helpers/history'

program
  .version(version)
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
