const fs = require('fs')
const path = require('path')

const configFileName = process.env.SAMUS_MOCK
  ? path.join(__dirname, '../../mock/samusrc')
  : path.join(process.env.HOME, '.samusrc')

module.exports = () => new Promise((resolve, reject) => {

  const config = {
    servers: [],
  }

  fs.readFile(configFileName, { encoding: 'utf8' }, (err, loadedString) => {
    if (!err) {
      try {
        const fileContent = JSON.parse(loadedString)
        Object.assign(config, fileContent)
      } catch (e) { return reject(e) }
    }
    resolve(config)
  })

})
