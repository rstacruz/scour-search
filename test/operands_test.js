'use strict'

const test = require('tape')
const si = require('../src')
const keys = Object.keys
var result

const data =
  [ { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: false },
    { name: 'Durian', rotten: true } ]

test('operands', (t) => {
  const idx = si(data).index('name').index('rotten')

  result = idx.filterRaw({ type: '$eq', key: 'name', value: 'Durian' })
  t.deepEqual(keys(result), ['3', '4'], '$eq')

  result = idx.filterRaw(
    { type: '$and', value:
      [ { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'rotten', value: true } ] })
  t.deepEqual(keys(result), ['4'], '$and')

  result = idx.filterRaw(
    { type: '$nor', value:
      [ { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' } ] })
  t.deepEqual(keys(result), [ '0', '1' ], '$nor')

  result = idx.filterRaw(
    { type: '$not',
    value: { type: '$eq', key: 'name', value: 'Durian' } })
  t.deepEqual(keys(result), ['0', '1', '2'], '$not')

  result = idx.filterRaw({ type: '$in', key: 'name', value: ['Durian', 'Cashew'] })
  t.deepEqual(keys(result), ['2', '3', '4'], '$in')

  result = idx.filterRaw({ type: '$nin', key: 'name', value: ['Durian', 'Cashew'] })
  t.deepEqual(keys(result), ['0', '1'], '$nin')

  result = idx.filterRaw(
    { type: '$or',
      value:
      [ { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' } ] })
  t.deepEqual(keys(result), ['2', '3', '4'], '$or')

  t.end()
})
