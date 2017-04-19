const fs = require('fs')
const promisify = require('es6-promisify')
const path = require('path')

const readFile = promisify(fs.readFile)

const configFileName = process.env.SAMUS_MOCK
  ? path.join(__dirname, '../../mock/samusrc')
  : path.join(process.env.HOME, '.samusrc')

module.exports = async function () {

  const config = {
    servers: [],
  }

  try {
    const fileContent = await readFile(configFileName, { encoding: 'utf8' })
    try {
      const parsedContent = JSON.parse(fileContent)
      Object.assign(config, parsedContent)
    } catch (e) {
      throw new Error(`Bad config file: ${e.message}`)
    }
  } catch (e) {
    throw new Error('Config file not found')
  }

  return config

}
