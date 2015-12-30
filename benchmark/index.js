/* eslint-disable new-cap, no-new */
'use strict'

const bm = require('./bm')

const si = require('../lib')
const sift = require('sift')

let data = [
  { id: 1, name: 'Ella Fitzgerald' },
  { id: 2, name: 'Frank Sinatra' },
  { id: 3, name: 'Miles Davis' },
  { id: 4, name: 'Taylor Swift' }
]

for (var i = 0; i < 7; i++) {
  data = data.concat(data)
}

const objData = {}
data.forEach((val, key) => { data[key] = val })

const indexed = si(data).index('name')
const objIndexed = si(objData).index('name')

bm('searching (n=' + data.length + ')', {
  'indexed, array': function () {
    indexed.filter({ name: 'Miles Davis' })
  },
  'indexed, object': function () {
    objIndexed.filter({ name: 'Miles Davis' })
  },
  'unindexed, array': function () {
    si(data).filter({ name: 'Miles Davis' })
  },
  'via sift.js': function () {
    sift({ name: 'Miles Davis' }, data)
  },
  'native Array.filter()': function () {
    indexed.filter((item) => item.name === 'Miles Davis')
  }
})
