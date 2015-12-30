'use strict'

const test = require('tape')
const si = require('../src')

test('.reindex() add', (t) => {
  const data = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George', featured: true }
  ]

  const newData = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George', featured: true },
    { name: 'Ringo', featured: true }
  ]

  const search1 = si(data).index('name')
  const search2 = search1.reindex(newData, 3)

  t.deepEqual(search1.filterKeys({ featured: true }), [ '2' ], 'retains search 1')
  t.deepEqual(search2.filterKeys({ featured: true }), [ '2', '3' ], 'retains search 2')

  t.end()
})
