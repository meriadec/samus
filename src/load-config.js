import fs from 'fs'
import { isPlainObject, isArray } from 'lodash'
import path from 'path'

const configFileName = path.join(process.env.HOME, '.samusrc')

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
          loaded.servers = loaded.servers.filter(s => s.url)
        }
        Object.assign(config, loaded)
      } catch (e) { return reject(e) }
    }
    resolve(config)
  })

})
