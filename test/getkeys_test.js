'use strict'

const si = require('../scour-search')

describe('getKeys', function () {
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
})
