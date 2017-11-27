const { isViewed } = require('./history')

module.exports = function enrichItems(rawItems, url, playlist) {
  return rawItems.filter(text => text !== '../').map(text => {
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
      isSelected: !!playlist.find(u => u === full),
    }
  })
}
