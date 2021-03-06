const blessed = require('blessed')
const chalk = require('chalk')

const listOpts = {
  loop: true,
  keys: true,
  vi: true,
  style: {
    selected: {
      bg: 'white',
      fg: 'black',
    },
  },
}

module.exports = props => {
  const { items, search, onSelect, onToggle } = props

  let _items = items

  const list = blessed.list(
    Object.assign(
      {
        search,
        items: items.map(renderItem),
      },
      listOpts,
    ),
  )

  list._rawSetItems = list.setItems
  list.setItems = items => {
    _items = items
    list._rawSetItems(items.map(renderItem))
  }

  list.key(['a'], () => {
    onToggle(_items[list.selected])
  })

  list.key(['c'], () => {
    onSelect(_items[list.selected], 'cast')
  })

  list.on('select', (item, i) => {
    onSelect(_items[i])
  })

  return list
}

function renderItem(item) {
  const lineColor = item.isFolder ? chalk.blue : i => i
  const res = []
  if (!item.isFolder) {
    if (item.isViewed) {
      res.push(chalk.red('[x]'))
    } else {
      res.push(chalk.green('[ ]'))
    }
    if (item.isSelected) {
      res.push(chalk.blue('(+)'))
    }
  }
  res.push(item.name)
  return lineColor(res.join(' '))
}
