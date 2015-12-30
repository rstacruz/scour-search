const stringify = require('./stringify')
const get = require('../utilities/get')
const indexers = {}

indexers['$eq'] = function (item, key, field, index) {
  const val = stringify(get(item, field))
  if (!index[val]) index[val] = {}
  index[val][key] = 1
}

module.exports = indexers
