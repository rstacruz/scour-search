'use strict'

const test = require('tape')
const si = require('../src')

test('.reindex() change', (t) => {
  const data = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George' }
  ]

  const newData = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' }
  ]

  const search1 = si(data).index('name')
  const search2 = search1.reindex(newData, 2)

  t.deepEqual(search1.filterKeys({ name: 'George' }), [ '2' ], 'retain search1')
  t.deepEqual(search1.filterKeys({ name: 'Ringo' }), [ ], 'retain search1')

  t.deepEqual(search2.filterKeys({ name: 'Ringo' }), [ '2' ], 'update search2')
  t.deepEqual(search2.filterKeys({ name: 'George' }), [ ], 'update search2')

  t.end()
})
