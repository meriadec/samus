const r = require('superagent')

const { wait } = require('./mock')

const linkRegex = new RegExp('<a href="([^"]*)"', 'g')
const cache = process.env.SAMUS_MOCK
  ? require('../../mock/data')
  : {}

module.exports = async (url, credentials) => {

  if (process.env.SAMUS_MOCK) {
    await wait(200)
  }

  const rawItems = cache[url] || await xhrFetch(url, credentials)
  cache[url] = rawItems

  return rawItems
}

function parseItems (text) {
  const links = []
  let link
  while (link = linkRegex.exec(text)) { // eslint-disable-line
    links.push(decodeURI(link[1]))
  }
  return links
}

function xhrFetch (url, credentials) {
  return new Promise((resolve, reject) => {

    const req = r.get(url)

    if (credentials) {
      req.auth(credentials.username, credentials.password)
    }

    req.end((err, res) => {
      if (err) { return reject(err) }
      if (res.text.indexOf('Index of') === -1) { return resolve(['../']) }
      resolve(parseItems(res.text))
    })

  })
}
