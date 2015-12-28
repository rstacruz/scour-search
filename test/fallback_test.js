'use strict'

const si = require('../scour-search')

describe('filter (unindexed)', function () {
  const data = [
    { name: 'Apple' },
    { name: 'Banana' },
    { name: 'Cashew' },
    { name: 'Durian', rotten: 'no' },
    { name: 'Durian', rotten: 'yes' }
  ]

  const idx = si(data) // .index('name')

  it('$eq', function () {
    expect(idx.filter({ name: 'Apple' })).toEqual([ data[0] ])
  })

  it('$eq $and', function () {
    // expect(idx.filter({ $or: [ { name: 'Durian' }, { rotten: 'no' } ] }))
    //  .toEqual([ data[3] ])
  })
})
