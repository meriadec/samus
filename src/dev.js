import samus from './samus'

// command line should be in that form:
// npm run dev -- <url>

const url = process.argv[2]

samus(url)
