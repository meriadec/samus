import fs from 'fs'
import path from 'path'

const configFileName = path.join(process.env.HOME, '.samusrc')

export default () => new Promise((resolve, reject) => {

  const config = {
    defaultServer: null,
  }

  fs.readFile(configFileName, { encoding: 'utf8' }, (err, loadedString) => {
    if (!err) {
      try {
        const loaded = JSON.parse(loadedString)
        Object.assign(config, loaded)
      } catch (e) { return reject(e) }
    }
    resolve(config)
  })

})
