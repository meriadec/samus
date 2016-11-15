const linkRegex = new RegExp('<a href="([^"]*)"', 'g')

export default text => {

  const links = []

  let link
  while (link = linkRegex.exec(text)) {
    links.push(decodeURI(link[1]))
  }

  return links

}
