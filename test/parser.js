import test from 'ava'

import parseItems from '../src/parse-items'

test('it should extract links', t => {

  const content = `<html>
<head><title>Index of /Whatever</title></head>
<body bgcolor="white">
<h1>Index of /Downloads/</h1><hr><pre><a href="../">../</a>
<a href="first.link/">first.link/</a>      16-Jun-2016 20:14                   -
<a href="second%20link/">second link//</a>                                        28-May-2016 16:10                   -
</pre><hr></body>
</html>`

  const parsed = parseItems(content)

  t.deepEqual(parsed, [
    '../',
    'first.link/',
    'second%20link/'
  ])

})
