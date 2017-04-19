const blessed = require('blessed')
const chalk = require('chalk')

const listOpts = {
  loop: true,
  keys: true,
  style: {
    selected: {
      bg: 'white',
      fg: 'black',
    },
  },
}

module.exports = (props) => {

  const {
    items,
    onSelect,
    onToggle,
  } = props

  const list = blessed.list(Object.assign({
    items: items.map(renderItem),
  }, listOpts))

  list.key(['a'], () => {
    onToggle(items[list.selected])
  })

  list.on('select', (item, i) => {
    onSelect(items[i])
  })

  return list
}

function renderItem (item) {
  const lineColor = item.isFolder
    ? chalk.blue
    : i => i
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
