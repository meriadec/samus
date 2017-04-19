const blessed = require('blessed')

module.exports = (msg) => {

  const loader = blessed.box({})

  loader.append(blessed.text({
    style: {
      bg: 'blue',
      fg: 'black',
    },
    padding: 1,
    content: ' LOADING... ',
  }))

  loader.append(blessed.text({
    top: 4,
    style: {
      fg: 'white',
    },
    content: msg,
  }))

  return loader
}
