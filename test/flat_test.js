'use strict'

const si = require('../siftindex')

describe('objects', function () {
  const data = [ 'apple', 'banana' ]

  it('works', function () {
    expect(si(data).filter({ $eq: 'apple' })).toEqual(['apple'])
  })

  it('works without $eq', function () {
    expect(si(data).filter('apple')).toEqual(['apple'])
  })
})