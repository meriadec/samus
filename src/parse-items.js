const linkRegex = new RegExp('<a href="([^"]*)"', 'g')

export default text => {

  const links = []

  let link
  while (link = linkRegex.exec(text)) {
    links.push(link[1])
  }

  return links

}
