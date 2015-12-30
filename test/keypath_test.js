'use strict'

const test = require('tape')
const si = require('../src')
var idx, result

test('keypaths', (t) => {
  const data =
    [ { fruit: { name: 'Apple' } },
      { fruit: { name: 'Banana' } },
      { fruit: { name: 'Cashew' } },
      { fruit: { name: 'Durian', rotten: false } },
      { fruit: { name: 'Durian', rotten: true } } ]

  idx = si(data).index('fruit.name')
  t.deepEqual(idx.getKeys('fruit.name', 'Apple'), {'0': 1})

  idx = si(data).index('fruit.name')
  result = idx.filterRaw({ type: '$eq', key: 'fruit.name', value: 'Durian' })
  t.deepEqual(Object.keys(result), ['3', '4'], 'indexed')

  result = si(data).filterFallback(
    { type: '$eq', key: 'fruit.name', value: 'Durian' })
  t.deepEqual(result, [ data[3], data[4] ], 'unndexed')
  t.end()
})
