'use strict'

const si = require('../siftindex')

describe('siftindex', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Orange' },
    { name: 'Banana' },
    { name: 'Grape' },
    { name: 'Grape' }
  ]

  it('works for single results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'Apple')).toEqual({'0': 1})
  })

  it('works for multiple results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'Grape')).toEqual({'3': 1, '4': 1})
  })

  it('returns {} for empty results', function () {
    const idx = si(data).index('name')
    expect(idx.getKeys('name', 'derp')).toEqual({})
  })

  it('returns undefined for unindexed fields', function () {
    const idx = si(data)
    expect(idx.getKeys('name', 'Grape')).toEqual(undefined)
  })

  it('filter: $eq', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$eq', key: 'name', value: 'Grape' })

    expect(result).toEqual(['3', '4'])
  })

  it('filter: $in', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({ type: '$in', key: 'name', value: ['Grape', 'Banana'] })

    expect(result).toEqual(['2', '3', '4'])
  })

  it('filter: $or', function () {
    const idx = si(data).index('name')
    const result = idx.filter2({
      type: '$or',
      value: [
        { type: '$eq', key: 'name', value: 'Grape' },
        { type: '$eq', key: 'name', value: 'Banana' }
      ]
    })

    expect(result).toEqual(['2', '3', '4'])
  })
})
