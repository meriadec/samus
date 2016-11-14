import fs from 'fs'
import { isPlainObject, isArray } from 'lodash'
import path from 'path'

const configFileName = path.join(process.env.HOME, '.samusrc')

export const prettyfyUrl = url =>
  url ? url.slice(-1) === '/' ? url.slice(0, -1) : url : null

export default () => new Promise((resolve, reject) => {

  const config = {
    servers: [],
  }

  fs.readFile(configFileName, { encoding: 'utf8' }, (err, loadedString) => {
    if (!err) {
      try {
        const loaded = JSON.parse(loadedString)
        if (!isPlainObject(loaded)) {
          return reject(new Error('Invalid config'))
        }
        if (isArray(loaded.servers)) {
          loaded.servers = loaded.servers
            .filter(s => s.url)
            .map(s => ({ ...s, url: prettyfyUrl(s.url) }))
        }
        Object.assign(config, loaded)
      } catch (e) { return reject(e) }
    }
    resolve(config)
  })

})
