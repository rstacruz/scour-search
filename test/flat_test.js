'use strict'

const test = require('tape')
const si = require('../src')

test('flat', (t) => {
  const data = [ 'apple', 'banana' ]

  t.deepEqual(si(data).filter({ $eq: 'apple' }), ['apple'])
  t.deepEqual(si(data).filter('apple'), ['apple'])
  t.end()
})
