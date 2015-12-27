'use strict'

const si = require('../siftindex')

describe('reindex del', function () {
  var search1, search2

  const data = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'George' }
  ]

  const newData = [
    { name: 'John' },
    { name: 'Paul' }
  ]

  before(function () {
    search1 = si(data).index('name')
    search2 = search1.reindex(newData, 2)
  })

  it('retains search 1', function () {
    expect(search1.filterKeys({ name: 'George' })).toEqual([ '2' ])
  })

  it('updates search 2', function () {
    expect(search2.filterKeys({ name: 'George' })).toEqual([ ])
  })
})
