#!/usr/bin/env node

const program = require('commander')

const { version } = require('../package.json')
const samus = require('./samus')
const loadConfig = require('./helpers/loadConfig')

program
  .version(version)
  .usage('[options] <url>')
  .option('-f, --fullscreen', 'launch mpv in fullscreen')
  .parse(process.argv)

const options = {
  url: program.url || null,
  fullscreen: !!program.fullscreen,
}

;(async () => {
  const config = await loadConfig()
  samus(options, config)
})()
