const linkRegex = new RegExp('<a href="([^"]*)"', 'g')

export default text => {

  const links = []

  let link
  while (link = linkRegex.exec(text)) { // eslint-disable-line
    if (link !== '../') {
      links.push(decodeURI(link[1]))
    }
  }

  return links

}
