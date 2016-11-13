import r from 'superagent'
import fs from 'fs'
import path from 'path'

const HISTORY_FILE_NAME = path.join(process.env.HOME, '.samus_history')

// hard coded variable!! baaad!! (ps: I don't care, we are two to use this, lol)
const SYNC_URL = 'http://samus-sync.sigsev.io'

let _history = {}
let _syncId = null

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
  return Math.abs(hash)
}

export function load (config) {
  return new Promise((resolve, reject) => {
    _syncId = config.sync
    if (_syncId) {
      r.get(`${SYNC_URL}/history/${_syncId}`).end((err, res) => {
        if (err) { return resolve() }
        _history = res.body
        resolve()
      })
    } else {
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
    }
  })
}

export function has (key) {
  return !!_history[hash(key)]
}

export function set (key) {
  return new Promise(resolve => {
    const h = hash(key)
    if (_syncId) {
      r.post(`${SYNC_URL}/history/${_syncId}/${h}`).end(resolve)
    } else {
      _history[h] = true
      fs.writeFile(HISTORY_FILE_NAME, Object.keys(_history).join('\n'), resolve)
    }
  })
}
