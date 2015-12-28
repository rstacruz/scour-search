'use strict'

const si = require('../scour-search')

describe('operands', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: false },
    { name: 'Durian', rotten: true }
  ]

  it('$eq', function () {
    const idx = si(data).index('name')
    const result = idx.filterRaw({ type: '$eq', key: 'name', value: 'Durian' })

    expect(Object.keys(result)).toEqual(['3', '4'])
  })

  it('$and', function () {
    const idx = si(data).index('name').index('rotten')
    const result = idx.filterRaw({
      type: '$and', value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'rotten', value: true },
      ]
    })

    expect(Object.keys(result)).toEqual(['4'])
  })

  it('$nor', function () {
    const idx = si(data).index('name').index('rotten')
    const result = idx.filterRaw({
      type: '$nor', value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' },
      ]
    })

    expect(Object.keys(result)).toEqual([ '0', '1' ])
  })

  it('$not', function () {
    const idx = si(data).index('name')
    const result = idx.filterRaw({ type: '$not',
      value: { type: '$eq', key: 'name', value: 'Durian' }
    })

    expect(Object.keys(result)).toEqual(['0', '1', '2'])
  })

  it('$in', function () {
    const idx = si(data).index('name')
    const result = idx.filterRaw({ type: '$in', key: 'name', value: ['Durian', 'Cashew'] })

    expect(Object.keys(result)).toEqual(['2', '3', '4'])
  })

  it('$nin', function () {
    const idx = si(data).index('name')
    const result = idx.filterRaw({ type: '$nin', key: 'name', value: ['Durian', 'Cashew'] })

    expect(Object.keys(result)).toEqual(['0', '1'])
  })

  it('$or', function () {
    const idx = si(data).index('name')
    const result = idx.filterRaw({
      type: '$or',
      value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' }
      ]
    })

    expect(Object.keys(result)).toEqual(['2', '3', '4'])
  })
})
