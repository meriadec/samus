const get = require('lodash/get')
const { spawn } = require('child_process')

module.exports = (files, options, config) => {

  const args = buildArgs(files, options, config)

  const child = spawn('mpv', args)

  child.on('error', err => {
    if (err.code === 'ENOENT') {
      throw new Error('Please install mpv to use samus (https://mpv.io/)')
    }
    throw err
  })

  return child

}

function buildArgs (files, options, config) {

  if (process.env.SAMUS_MOCK) {
    files = [
      '../dummy-1.mkv',
      '../dummy-2.mkv',
    ]
  }

  const args = ['--quiet', '--autofit=90%']

  if (options.fullscreen || config.fullscreen) {
    args.push('--fs')
  }

  const preferredAudio = get(config, 'audio.preferred')
  if (preferredAudio) {
    args.push(`--alang=${preferredAudio}`)
  }

  const preferredSubs = get(config, 'subs.preferred')
  if (preferredSubs) {
    args.push(`--slang=${preferredSubs}`)
  }

  if (get(config, 'subs.hidden')) {
    args.push('--no-sub-visibility')
  }

  args.push('--input-ipc-server=/tmp/mpvsocket')

  files.forEach(f => args.push(f))

  return args

}
