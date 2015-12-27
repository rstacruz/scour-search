/* eslint-disable new-cap, no-new */
'use strict'
require('babel-core/register')

const bm = require('./bm')

global.si = require('../siftindex.js')
global.sift = require('sift')

global.data = [
  { id: 1, name: 'Ella Fitzgerald' },
  { id: 2, name: 'Frank Sinatra' },
  { id: 3, name: 'Miles Davis' },
  { id: 4, name: 'Taylor Swift' }
]

for (var i = 0; i < 5; i++) {
  data = data.concat(data)
}

global.objData = {}
data.forEach((val, key) => { data[key] = val })

global.indexed = si(data).index('name')
global.objIndexed = si(objData).index('name')

bm('searching (n=' + data.length + ')', {
  'with index': function () {
    indexed.filter({ name: 'Miles Davis' })
  },
  'with index, object': function () {
    objIndexed.filter({ name: 'Miles Davis' })
  },
  'without index': function () {
    si(data).filter({ name: 'Miles Davis' })
  },
  'via sift': function () {
    sift({ name: 'Miles Davis' }, data)
  }
})
