import blessed from 'blessed'
import { spawn } from 'child_process'
import { get } from 'lodash'

import fetch from './helpers/fetch'
import * as history from './helpers/history'

const isBasicAuthErr = err => (
  err.status
  && err.status === 401
  && err.response
  && err.response.headers
  && err.response.headers['www-authenticate']
  && err.response.headers['www-authenticate'].indexOf('Basic') > -1
)

const defaultListOpts = {
  loop: true,
  border: 'line',
  keys: true,
  style: {
    selected: {
      bg: 'white',
      fg: 'black'
    }
  },
}

class Samus {

  constructor (url, config, args) {

    this.config = config
    this.args = args
    this.url = url || get(config, 'servers[0].url')
    this.baseUrl = this.url

    if (config.servers.length > 1) {
      this.shouldPickServer = true
    }

    if (!this.url) {
      console.log('No url provided.')
      console.log('try `samus -h` to see usage')
      process.exit(0)
    }

    this.list = null
    this.authForm = null
    this.credentials = get(config, 'servers[0].credentials')

    this.screen = blessed.screen({ smartCSR: true })
    this.screen.key(['escape', 'q', 'C-c'], () => this.screen.destroy())

    this.loader = blessed.loading()
    this.screen.append(this.loader)

    this.load()

  }

  destroy (msg) {
    this.screen.destroy()
    if (msg) {
      console.log(msg)
    }
    process.exit()
  }

  getFullUrl (text) {
    let name = `${this.url}/${text}`
    if (!name.startsWith('http')) {
      name = `http://${name}`
    }
    return name
  }

  buildArgs (text) {
    const args = ['--quiet']
    const name = this.getFullUrl(text)

    if (this.config.fullscreen || this.args.fullscreen) {
      args.push('--fs')
    }

    const preferredAudio = get(this.config, 'audio.preferred')
    if (preferredAudio) {
      args.push(`--alang=${preferredAudio}`)
    }

    const preferredSubs = get(this.config, 'subs.preferred')
    if (preferredSubs) {
      args.push(`--slang=${preferredSubs}`)
    }

    if (get(this.config, 'subs.hidden')) {
      args.push('--no-sub-visibility')
    }

    args.push(name)
    return args
  }

  markRead (text) {
    const full = this.getFullUrl(text)
    return history.set(full)
  }

  checkmarkText ({ text, selected }) {
    if (text === '../' || text[text.length - 1] === '/') { return text }
    return `[${selected ? 'x' : ' '}] ${text}`
  }

  output (text) {
    this.screen.destroy()

    console.log(`\n▶ Selected [ ${decodeURI(text)} ]`)
    console.log('▶ Launching mpv...\n')

    const mpvArgs = this.buildArgs(text)

    this.markRead(text)
      .then(() => {
        const child = spawn('mpv', mpvArgs)
        child.on('error', err => {
          if (err.code === 'ENOENT') {
            console.log('\nPlease install mpv to use samus (https://mpv.io/).\n')
            process.exit()
          }
        })
        child.stdout.pipe(process.stdout)
        child.stderr.pipe(process.stderr)
      })

  }

  navigate (suburl) {
    this.url = `${this.url}/${suburl}`
    this.load()
  }

  pickServer () {

    this.list = blessed.list({
      items: this.config.servers.map(s => s.url),
      parent: this.screen,
      label: 'Pick your server',
      ...defaultListOpts
    })

    this.list.on('select', (item, i) => {
      this.url = get(this.config, `servers[${i}].url`)
      this.baseUrl = this.url
      this.credentials = get(this.config, `servers[${i}].credentials`)
      this.shouldPickServer = false
      this.load()
    })

    this.list.focus()
    this.screen.render()

  }

  isRoot () {
    return this.url === this.baseUrl
  }

  renderList (items) {

    const enhancedItems = items
      .map(text => ({
        text,
        selected: history.has(this.getFullUrl(encodeURI(text)))
      }))
      .filter(({ text }) => text !== '../' || !this.isRoot())

    this.list = blessed.list({
      items: enhancedItems.map(::this.checkmarkText),
      parent: this.screen,
      label: ` ${this.url} `,
      ...defaultListOpts
    })

    if (this.config.autoSelect && !this.isRoot()) {
      const lastViewed = enhancedItems
        .filter(({ text }) => text !== '../')
        .map(({ selected }) => selected)
        .lastIndexOf(true)

      this.list.select(lastViewed + 2)
    }

    this.list.on('select', (item) => {
      const text = item.getText()
      if (text === '../') {
        this.url = this.url.substring(0, this.url.lastIndexOf('/'))
        this.load()
      } else if (text[text.length - 1] === '/') {
        this.navigate(text.substr(0, text.length - 1))
      } else {
        this.output(encodeURI(text.substr(4)))
      }
    })

    this.list.focus()
    this.screen.render()

  }

  load () {

    if (this.list) { this.screen.remove(this.list) }
    if (this.shouldPickServer) { return this.pickServer() }

    this.loader.load(`▶ Loading ${this.url}`)

    fetch(this.url, this.credentials)
      .then(::this.renderList)
      .catch(err => {
        if (isBasicAuthErr(err)) {
          this.destroy('This site is protected. You may need to add your credentials in your ~/.samusrc, check README')
        } else {
          this.destroy(err)
        }
      })
      .then(() => this.loader.stop())

  }

}

export default Samus
