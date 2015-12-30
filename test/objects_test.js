'use strict'

const test = require('tape')
const si = require('../src')

const data =
  { a: { name: 'Apple' },
    b: { name: 'Banana' },
    c: { name: 'Cashew' },
    d: { name: 'Durian', rotten: 'no' },
    d2: { name: 'Durian', rotten: 'yes' } }

var idx

test('.filterKeys() objects', (t) => {
  idx = si(data).index('name')
  t.deepEqual(idx.filterKeys({ name: 'Apple' }), ['a'], 'single result')

  idx = si(data).index('name').index('rotten')
  t.deepEqual(idx.filterKeys({ name: 'Durian', rotten: 'yes' }), ['d2'], 'and')

  idx = si(data).index('name')
  t.deepEqual(idx.filterKeys({ name: 'Durian', rotten: 'no' }), ['d'], 'and')
  t.end()
})

test('.filter() objects', (t) => {
  t.deepEqual(
    si(data).index('name').filter({ name: 'Apple' }),
    { a: { name: 'Apple' } })
  t.end()
})
