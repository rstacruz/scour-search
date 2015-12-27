'use strict'

const si = require('../siftindex')

describe('reindex add', function () {
  var search1, search2

  const data = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George', featured: true }
  ]

  const newData = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George', featured: true },
    { name: 'Ringo', featured: true }
  ]

  before(function () {
    search1 = si(data).index('name')
    search2 = search1.reindex(newData, 3)
  })

  it('retains search 1', function () {
    expect(search1.filterKeys({ featured: true })).toEqual([ '2' ])
  })

  it('updates search 2', function () {
    expect(search2.filterKeys({ featured: true })).toEqual([ '2', '3' ])
  })
})
