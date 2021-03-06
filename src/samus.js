const blessed = require('blessed')
const chalk = require('chalk')
const { get, cloneDeep } = require('lodash')
const Chromecast = require('chromecast-js')

const enrichItems = require('./helpers/enrichItems')
const fetch = require('./helpers/fetch')
const launchMpv = require('./helpers/mpv')
const { loadHistory, markRead } = require('./helpers/history')
const { hash } = require('./helpers/strings')

const filesList = require('./ui/filesList')

class Samus {
  constructor(options, config) {
    this.options = options
    this.config = config

    this.servers = options.url ? [{ url: options.url }] : get(config, 'servers', [])

    if (!this.servers.length) {
      this.exit('No server specified', 1)
    }

    this.server = this.servers[0]

    this._LIST_STATE_CACHE_ = {}

    this.state = {
      isLoadingGlobal: false,
      isLoadingList: false,
      isPlaying: false,
      isPaused: false,
      location: null,
      items: [],
      playlist: [],
      filter: '',
    }

    this.draw()
    this.init()
  }

  exit(msg, code = 0) {
    if (this.screen) {
      this.screen.destroy()
    }
    if (msg) {
      console.log(msg) // eslint-disable-line
    }
    process.exit(code)
  }

  setState(state) {
    try {
      this.prevState = cloneDeep(this.state)
      Object.assign(this.state, state)
      this.render()
    } catch (err) {
      this.exit(err, 1)
    }
  }

  async init() {
    this.setState({ isLoadingGlobal: true })
    await loadHistory(this.config)
    this.setState({ isLoadingGlobal: false })

    await this.load(this.server.url)

    const chromecastBrowser = new Chromecast.Browser()
    chromecastBrowser.on('deviceOn', device => {
      device.connect()
      device.on('connected', () => {
        this.setState({ device })
      })
    })
  }

  async load(url) {
    this.setState({ isLoadingList: true })

    const rawItems = await fetch(url, this.server.credentials, this.config)
    const items = enrichItems(rawItems, url, this.state.playlist)

    if (url !== this.server.url) {
      const u = url.substring(0, url.lastIndexOf('/'))
      items.unshift({ isFolder: true, name: '..', url: u })
    }

    this.setState({ isLoadingList: false, items, location: url })
  }

  play(url, shouldCast) {
    const files = this.state.playlist.length ? this.state.playlist : [url]

    this.setState({
      isPlaying: true,
      items: this.state.items.map(
        item => (item.url === url ? Object.assign(item, { isViewed: true }) : item),
      ),
    })

    if (shouldCast && this.state.device) {
      // TODO maybe we could save the position for resuming?
      this.state.device.play(url, 0)
    } else {
      const child = launchMpv(files, this.options, this.config)
      child.on('exit', () => {
        this.setState({ isPlaying: false })
      })
    }

    // TODO: history actually works only with 1 file, because I don't want
    // to mark as read an entire fucking playlist if I watch only 1 episode
    //
    // we may find a way to mark as read episodes as they are played
    if (files.length === 1) {
      markRead(files[0])
    }
  }

  backupListState() {
    if (!this.state.location) {
      return
    }

    this._LIST_STATE_CACHE_[hash(this.state.location)] = {
      selected: this.list.selected,
      scroll: this.list.getScroll(),
    }
  }

  getBackupListState() {
    if (!this.state.location) {
      return null
    }

    return this._LIST_STATE_CACHE_[hash(this.state.location)] || null
  }

  debug(msg) {
    if (!process.env.SAMUS_DEBUG) {
      return
    }

    if (!this._LAST_TICK_) {
      this._LAST_TICK_ = Date.now()
    }
    const now = Date.now()
    const ts = chalk.red(`(${now - this._LAST_TICK_}ms)`)
    this.debugUI.add(`${ts} ${msg}`)
    this._LAST_TICK_ = now
  }

  draw() {
    this.screen = blessed.screen({ smartCSR: true })
    this.screen.key(['escape', 'q', 'C-c'], () => this.screen.destroy())

    this.chromecast = blessed.box({
      top: 0,
      left: 0,
      height: 1,
      width: 4,
      content: 'Cast',
      style: {
        fg: 'white',
        bg: 'red',
      },
    })

    this.tabs = blessed.listbar({
      top: 0,
      left: 4,
      height: 1,
      style: {
        selected: {
          bg: 'green',
          fg: 'black',
        },
      },
      items: this.servers.map(server => {
        return {
          text: server.name || server.url,
          callback: () => {
            if (this.server === server) {
              return
            }

            this.server = server
            this._LIST_STATE_CACHE_ = {}
            this.load(this.server.url)
          },
        }
      }),
      autoCommandKeys: true,
    })

    this.search = blessed.textbox({
      top: 1,
      left: 1,
      height: 1,
      input: true,
      inputOnFocus: true,
      style: {
        bg: 'black',
        focus: {
          bg: 'blue',
        },
      },
    })

    this.search.key('enter', () => {
      this.setState({ filter: this.search.getValue().toLowerCase() })
    })

    this.view = blessed.box({
      top: 3,
      left: 1,
    })

    this.list = filesList({
      items: this.state.items,
      search: () => {
        if (this.search.getValue()) {
          this.search.setValue('')
          return this.setState({ filter: '' })
        }

        this.search.focus()
      },
      onSelect: (item, shouldCast) => {
        if (!item) {
          return
        }

        this.backupListState()
        if (item.isFolder) {
          this.load(item.url)
        } else {
          this.play(item.url, shouldCast)
        }
      },
      onToggle: item => {
        item.isSelected = !item.isSelected
        if (item.isSelected) {
          this.state.playlist.push(item.url)
        } else {
          this.playlist = this.state.playlist.filter(u => u !== item.url)
        }
        this.backupListState()
        this.render()
      },
    })

    this.globalLoader = blessed.text({
      top: 0,
      right: 0,
      content: 'Establishing connection...',
      style: {
        fg: 'yellow',
      },
    })

    this.playBox = blessed.text({
      top: 'center',
      left: 'center',
      padding: 1,
      border: 'line',
      style: {
        bg: 'red',
        fg: 'black',
        border: {
          fg: 'red',
        },
      },
    })

    this.playBox.key('space', () => {
      if (this.state.device) {
        this.state.device[this.state.isPaused ? 'unpause' : 'pause']()
        this.setState({ isPaused: !this.state.isPaused })
      }
    })

    this.playBox.key('c', () => {
      if (this.state.device) {
        this.state.device.stop()
        this.setState({ isPlaying: false, isPaused: false })
      }
    })

    this.debugUI = blessed.log({
      bottom: 0,
      right: 0,
      height: 30,
      border: {
        type: 'line',
      },
      style: {},
    })

    this.globalLoader.hide()
    this.playBox.hide()

    this.screen.append(this.chromecast)
    this.screen.append(this.view)
    this.screen.append(this.tabs)
    this.screen.append(this.search)

    if (process.env.SAMUS_DEBUG) {
      this.screen.append(this.debugUI)
    }

    this.view.append(this.list)
    this.screen.append(this.globalLoader)
    this.screen.append(this.playBox)
  }

  render() {
    if (!this._NB_RENDER_) {
      this._NB_RENDER_ = 0
    }

    ++this._NB_RENDER_

    const { state, prevState } = this

    // this.debug(JSON.stringify(omit(state, ['items'])))

    this.chromecast.style.bg = state.device ? 'green' : 'red'
    this.chromecast.style.fg = state.device ? 'black' : 'white'

    if (state.isLoadingGlobal && !prevState.isLoadingGlobal) {
      this.globalLoader.show()
    } else if (!state.isLoadingGlobal && prevState.isLoadingGlobal) {
      this.globalLoader.hide()
    }

    if (state.isLoadingList && !prevState.isLoadingList) {
      this.list.style.selected.bg = 'yellow'
      this.globalLoader.setContent('Loading list...')
      this.globalLoader.show()
    } else if (!state.isLoadingList && prevState.isLoadingList) {
      this.list.style.selected.bg = 'white'
      this.globalLoader.hide()
    }

    if (state.items !== prevState.items || state.filter !== prevState.filter) {
      this.list.setItems(
        state.filter
          ? state.items.filter(i => i.name === '..' || i.name.toLowerCase().includes(state.filter))
          : state.items,
      )

      const listState = this.getBackupListState()
      if (listState) {
        this.list.select(listState.selected)
        this.list.scroll(listState.scroll)
      } else {
        this.list.select(0)
        this.list.scroll(0)
      }
      this.list.focus()
    }

    this.playBox.content = state.isPaused ? '  Paused.  ' : '  Playing...  '

    if (state.isPlaying) {
      this.list.interactive = false
      this.playBox.show()
      this.playBox.focus()
    } else if (!state.isPlaying && prevState.isPlaying) {
      this.list.interactive = true
      this.playBox.hide()
    }

    this.debug(`render ${this._NB_RENDER_}`)
    this.screen.render()
  }
}

module.exports = (options, config) => new Samus(options, config)
