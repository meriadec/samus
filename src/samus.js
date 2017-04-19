const blessed = require('blessed')
const { get } = require('lodash')

const { isViewed } = require('./helpers/history')
const fetch = require('./helpers/fetch')
const launchMpv = require('./helpers/mpv')
const { loadHistory } = require('./helpers/history')

const filesList = require('./ui/filesList')
const loader = require('./ui/loader')

class Samus {

  constructor (options, config) {

    this.options = options
    this.config = config
    this.playlist = []

    this.servers = options.url
      ? [{ url: options.url }]
      : get(config, 'servers', [])

    if (!this.servers.length) {
      this.exit('No server specified', 1)
    }

    this.serverIndex = 0

    this.screen = blessed.screen({ smartCSR: true })
    this.screen.key(
      ['escape', 'q', 'C-c'],
      () => this.screen.destroy()
    )

    this.init()

  }

  async init () {
    this.drawTabs()
    this.drawView()
    this.showLoader('Loading history...')
    await loadHistory(this.config)
    const server = this.servers[this.serverIndex]
    await this.load(server.url)
  }

  exit (msg, code = 0) {
    if (this.screen) {
      this.screen.destroy()
    }
    if (msg) {
      console.log(msg) // eslint-disable-line
    }
    process.exit(code)
  }

  async load (url) {
    const server = this.servers[this.serverIndex]
    this.location = url

    this.showLoader('Fetching data...')

    const rawItems = await fetch(this.location, server.credentials)
    this.items = this.enrichItems(rawItems, this.location)

    if (this.location !== server.url) {
      this.items.unshift({
        isFolder: true,
        name: '..',
        url: this.location.substring(0, this.location.lastIndexOf('/')),
      })
    }

    this.hideLoader()

    this.drawList()
  }

  enrichItems (rawItems, url) {
    return rawItems.map(text => {
      let full = `${url}/${text}`
      const isFolder = text[text.length - 1] === '/'
      if (isFolder) {
        full = full.substr(0, full.length - 1)
      }
      return {
        name: text,
        url: full,
        isFolder,
        isViewed: isViewed(full),
        isSelected: !!this.playlist.find(u => u === full),
      }
    })
  }

  play (url) {

    const files = this.playlist.length ? this.playlist : [url]
    const child = launchMpv(files, this.options, this.config)

    this.showPlaying()

    child.on('exit', () => this.hidePlaying())

  }

  drawList (listState) {
    if (this.list) {
      this.list.destroy()
    }

    this.list = filesList({
      items: this.items,
      onSelect: item => {
        if (item.isFolder) {
          this.load(item.url)
        } else {
          this.play(item.url)
        }
      },
      onToggle: item => {
        item.isSelected = !item.isSelected
        if (item.isSelected) {
          this.playlist.push(item.url)
        } else {
          this.playlist = this.playlist.filter(u => u !== item.url)
        }
        const listState = {
          selected: this.list.selected,
          scroll: this.list.getScroll(),
        }
        this.drawList(listState)
      },
    })

    // restore last list position/scroll
    if (listState) {
      this.list.select(listState.selected)
      this.list.scroll(listState.scroll)
    }

    this.view.append(this.list)
    this.list.focus()
    this.screen.render()
  }

  drawView () {
    this.view = blessed.box({
      top: 2,
      padding: 1,
    })
    this.screen.append(this.view)
  }

  drawTabs () {
    if (this.tabs) {
      this.tabs.destroy()
    }
    this.tabs = blessed.listbar({
      top: 1,
      left: 0,
      height: 1,
      style: {
        selected: {
          bg: 'green',
          fg: 'black',
        },
      },
      items: this.servers.map(server => {
        return server.name || server.url
      }),
      autoCommandKeys: true,
    })
    this.screen.append(this.tabs)
    this.screen.render()
  }

  showLoader (msg) {
    if (this.loader) {
      this.loader.destroy()
    }
    this.loader = loader(msg)
    this.view.append(this.loader)
    this.screen.render()
  }

  hideLoader () {
    this.loader.destroy()
  }

  showPlaying () {
    if (this.playingBox) {
      this.playingBox.destroy()
    }
    this.playingBox = blessed.text({
      content: 'Playing',
      top: 'center',
      left: 'center',
      padding: 1,
      style: {
        bg: 'white',
        fg: 'black',
      },
    })

    this.view.append(this.playingBox)
    this.screen.render()
  }

  hidePlaying () {
    this.view.remove(this.playingBox)
    this.playingBox.destroy()
    this.screen.render()
  }

}

module.exports = (options, config) => new Samus(options, config)
