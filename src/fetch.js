import r from 'superagent'

import parseItems from './parse-items'

export default (url, creds) => new Promise((resolve, reject) => {

  const req = r.get(url)

  if (creds) {
    req.auth(creds.username, creds.password)
  }

  req.end((err, res) => {
    if (err) { return reject(err) }
    if (res.text.indexOf('Index of') === -1) { return resolve(['../']) }
    resolve(parseItems(res.text))
  })

})
