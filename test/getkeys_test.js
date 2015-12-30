'use strict'

const test = require('tape')
const si = require('../src')

test('getKeys', (t) => {
  const data =
    [ { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Cashew' },
      { name: 'Durian', rotten: false },
      { name: 'Durian', rotten: true } ]

  const idx = si(data).index('name')

  t.deepEqual(idx.getKeys('name', 'Apple'), {'0': 1}, 'single result')
  t.deepEqual(idx.getKeys('name', 'Durian'), {'3': 1, '4': 1}, 'multiple results')
  t.deepEqual(idx.getKeys('name', 'derp'), {}, 'empty result')
  t.end()
})
