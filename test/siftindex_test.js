'use strict'

const si = require('../siftindex')

describe('siftindex', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: false },
    { name: 'Durian', rotten: true }
  ]

  it('works for single results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'Apple')).toEqual({'0': 1})
  })

  it('works for multiple results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'Durian')).toEqual({'3': 1, '4': 1})
  })

  it('returns {} for empty results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'derp')).toEqual({})
  })

  it('returns undefined for unindexed fields', function () {
    const idx = si(data)
    expect(idx.getKeys('name', 'Durian')).toEqual(undefined)
  })

  it('$eq', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$eq', key: 'name', value: 'Durian' })

    expect(result).toEqual(['3', '4'])
  })

  it('$and', function () {
    const idx = si(data).index('name').index('rotten')
    const result = idx.filter2({
      type: '$and', value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'rotten', value: true },
      ]
    })

    expect(result).toEqual(['3'])
  })

  it('$not', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$not',
      value: { type: '$eq', key: 'name', value: 'Durian' }
    })

    expect(result).toEqual(['0', '1', '2'])
  })

  it('$in', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$in', key: 'name', value: ['Durian', 'Cashew'] })

    expect(result).toEqual(['2', '3', '4'])
  })

  it('$nin', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$nin', key: 'name', value: ['Durian', 'Cashew'] })

    expect(result).toEqual(['0', '1'])
  })

  it('$or', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({
      type: '$or',
      value: [
        { type: '$eq', key: 'name', value: 'Durian' },
        { type: '$eq', key: 'name', value: 'Cashew' }
      ]
    })

    expect(result).toEqual(['2', '3', '4'])
  })
})
