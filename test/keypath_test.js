'use strict'

const si = require('../siftindex')

describe('keypaths', function () {
  const data = [
    { fruit: { name: 'Apple' } },
    { fruit: { name: 'Banana' } },
    { fruit: { name: 'Cashew' } },
    { fruit: { name: 'Durian', rotten: false } },
    { fruit: { name: 'Durian', rotten: true } }
  ]

  it('works for single results', function () {
    const idx = si(data).index('fruit.name')
    expect(idx.getKeys('fruit.name', 'Apple')).toEqual({'0': 1})
  })

  it('works for indexed', function () {
    const idx = si(data).index('fruit.name')
    const result = idx.filterAST({ type: '$eq', key: 'fruit.name', value: 'Durian' })

    expect(result).toEqual(['3', '4'])
  })

  it('works for unindexed', function () {
    const idx = si(data)
    const result = idx.filterAST({ type: '$eq', key: 'fruit.name', value: 'Durian' })

    expect(result).toEqual(['3', '4'])
  })
})
