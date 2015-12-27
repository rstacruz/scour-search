/* eslint-disable new-cap, no-new */
'use strict'
require('babel-core/register')

const bm = require('./bm')
const si = require('../siftindex.js')
const sift = require('sift')

let data = [
  { id: 1, name: 'Ella Fitzgerald' },
  { id: 2, name: 'Frank Sinatra' },
  { id: 3, name: 'Miles Davis' },
  { id: 4, name: 'Taylor Swift' }
]

for (var i = 0; i < 5; i++) {
  data = data.concat(data)
}

const indexed = si(data).index('name')

bm('searching (n=' + data.length + ')', {
  'with index': function () {
    indexed.filter({ name: 'Miles Davis' })
  },
  'without index': function () {
    si(data).filter({ name: 'Miles Davis' })
  },
  'via sift': function () {
    sift({ name: 'Miles Davis' }, data)
  }
})
