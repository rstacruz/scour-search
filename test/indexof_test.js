'use strict'

const test = require('tape')
const si = require('../src')

test('.indexOf() array', (t) => {
  const data =
    [ { f: 'Apple' },
      { f: 'Banana' },
      { f: 'Cashew' },
      { f: 'Durian' } ]

  t.deepEqual(si(data).indexOf({ f: 'Banana' }), 1, 'unindexed')
  t.deepEqual(si(data).indexOf({ f: 'Zucchini' }), -1, 'unindexed, not found')
  t.deepEqual(si(data).index('f').indexOf({ f: 'Banana' }), 1, 'indexed')
  t.deepEqual(si(data).index('f').indexOf({ f: 'Zucchini' }), -1, 'indexed, not found')
  t.end()
})

test('.indexOf() object', (t) => {
  const data =
    { a: { f: 'Apple' },
      b: { f: 'Banana' },
      c: { f: 'Cashew' },
      d: { f: 'Durian' } }

  t.deepEqual(si(data).indexOf({ f: 'Banana' }), 'b', 'unindexed')
  t.deepEqual(si(data).indexOf({ f: 'Zucchini' }), -1, 'unindexed, not found')
  t.deepEqual(si(data).index('f').indexOf({ f: 'Banana' }), 'b', 'indexed')
  t.deepEqual(si(data).index('f').indexOf({ f: 'Zucchini' }), -1, 'indexed, not found')
  t.end()
})
