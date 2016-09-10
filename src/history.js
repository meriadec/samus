import fs from 'fs'
import path from 'path'

const HISTORY_FILE_NAME = path.join(process.env.HOME, '.samus_history')

const _history = {}

function hash (str) {
  let hash = 0
  let i
  let chr
  let len
  if (str.length === 0) { return hash }
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return -hash
}

export function load () {
  return new Promise((resolve, reject) => {
    fs.readFile(HISTORY_FILE_NAME, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          return reject(err)
        }
        return resolve()
      }
      const all = content.split('\n')
      all.forEach(k => _history[k] = true)
      resolve()
    })
  })
}

export function has (key) {
  return !!_history[hash(key)]
}

export function set (key) {
  return new Promise(resolve => {
    _history[hash(key)] = true
    fs.writeFile(HISTORY_FILE_NAME, Object.keys(_history).join('\n'), resolve)
  })
}
