const r = require('superagent')
const fs = require('fs')
const path = require('path')

const { wait } = require('./mock')

const HISTORY_FILE_NAME = path.join(process.env.HOME, '.samus_history')

// lol, don't care
const SYNC_URL = 'http://samus-sync.sigsev.io'

let _history = {}
let _syncID = null

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

exports.loadHistory = async (config) => {

  _syncID = config.sync

  if (_syncID) {
    if (process.env.SAMUS_MOCK) {
      await wait(200)
      _history = {}
    } else {
      _history = await fetchHistory(_syncID)
    }
  } else {
    _history = await readHistoryFile()
  }
}

exports.isViewed = (key) => {
  return !!_history[hash(key)]
}

exports.set = (key) => {
  return new Promise(resolve => {
    const h = hash(key)
    if (_syncID) {
      r.post(`${SYNC_URL}/history/${_syncID}/${h}`).end(resolve)
    } else {
      _history[h] = true
      fs.writeFile(HISTORY_FILE_NAME, Object.keys(_history).join('\n'), resolve)
    }
  })
}

function fetchHistory (syncID) {
  return new Promise((resolve, reject) => {
    r.get(`${SYNC_URL}/history/${syncID}`).end((err, res) => {
      if (err) { return reject(err) }
      resolve(res.body)
    })
  })
}

function readHistoryFile () {
  return new Promise((resolve, reject) => {
    fs.readFile(HISTORY_FILE_NAME, { encoding: 'utf8' }, (err, content) => {
      if (err) {
        if (err.code !== 'ENOENT') { return reject(err) }
        return resolve({})
      }
      const history = {}
      const all = content.split('\n')
      all.forEach(k => history[k] = true)
      resolve(history)
    })
  })
}
