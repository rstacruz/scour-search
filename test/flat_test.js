'use strict'

const si = require('../scour-search')

describe('objects', function () {
  const data = [ 'apple', 'banana' ]

  it('unindexed works', function () {
    expect(si(data).filter({ $eq: 'apple' })).toEqual(['apple'])
  })

  it('works without $eq', function () {
    expect(si(data).filter('apple')).toEqual(['apple'])
  })
})
