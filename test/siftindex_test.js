'use strict'

const si = require('../siftindex')

describe('filterKeys', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: 'no' },
    { name: 'Durian', rotten: 'yes' }
  ]

  it('works for single results', function () {
    const idx = si(data).index('name')
    expect(idx.filterKeys({ name: 'Apple' })).toEqual(['0'])
  })

  it('works for and', function () {
    const idx = si(data).index('name').index('rotten')
    expect(idx.filterKeys({ name: 'Durian', rotten: 'yes' })).toEqual(['4'])
  })

  it('works for and (2)', function () {
    const idx = si(data).index('name')
    expect(idx.filterKeys({ name: 'Durian', rotten: 'no' })).toEqual(['3'])
  })
})
