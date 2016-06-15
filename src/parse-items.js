import cheerio from 'cheerio'

export default text => {

  const $ = cheerio.load(text)
  const links = $('a')

  const items = []

  links.each((i, el) => items.push($(el).attr('href')))

  return items

}
