(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Clones an object but misses a key.
 */

module.exports = function cloneWithoutKeys(object, keys) {
  var result = {};
  for (var k in object) {
    if (object.hasOwnProperty(k) && !keys[k]) {
      result[k] = object[k];
    }
  }
  return result;
};

},{}],2:[function(require,module,exports){
'use strict';

var normalizeKeypath = require('../utilities/normalize_keypath');
var stringify = require('./stringify');
var each = require('../utilities/each');
var get = require('../utilities/get');

var fallbacks = {};

fallbacks['$eq'] = function (idx, _ref) {
  var key = _ref.key;
  var value = _ref.value;

  var results = {};
  value = stringify(value);
  each(idx.data, function (item, _key) {
    if (stringify(get(item, normalizeKeypath(key))) === value) results[_key] = 1;
  });
  return results;
};

module.exports = fallbacks;

},{"../utilities/each":8,"../utilities/get":9,"../utilities/normalize_keypath":10,"./stringify":5}],3:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var get = require('../utilities/get');
var indexers = {};

indexers['$eq'] = function (item, key, field, index) {
  var val = stringify(get(item, field));
  if (!index[val]) index[val] = {};
  index[val][key] = 1;
};

module.exports = indexers;

},{"../utilities/get":9,"./stringify":5}],4:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var cloneWithoutKeys = require('./clone_without_keys');
var assign = require('object-assign');
var each = require('../utilities/each');

/**
 * Internal: operands.
 *
 * Every operand is passed the `idx` (an `si` instance), a `condition`
 * (consisting of `{ type, key, value }`), and the `filter` function.
 *
 *     operands['$eq'] = function (idx, condition, filter) {
 *       var { key, value, type } = condition
 *
 *       // key   === 'name'
 *       // value === 'Homer'
 *       // type  === '$eq'
 *       // idx   === [si (data, indices)]
 *     }
 *
 * They're expected to return a result of keys in the same format
 * `si#getKeys()` returns.
 *
 *     { '23': 1, '45': 1, '70': 1 }
 */

var operands = {};

operands['$eq'] = function (idx, _ref) {
  var key = _ref.key;
  var value = _ref.value;

  return idx.getKeys(key, value);
};

operands['$ne'] = function (idx, _ref2, filter) {
  var key = _ref2.key;
  var value = _ref2.value;

  return filter(idx, {
    type: '$not',
    value: { type: '$eq', key: key, value: value }
  });
};

operands['$or'] = unary(function (idx, _ref3, filter) {
  var value = _ref3.value;

  var result = {};

  for (var i = 0, len = value.length; i < len; i++) {
    var subcon = value[i];
    var keys = filter(idx, subcon);
    if (!keys) return;
    assign(result, keys);
  }

  return result;
});

operands['$and'] = unary(function (idx, _ref4, filter) {
  var value = _ref4.value;

  var result = {};

  var _loop = function _loop() {
    var subcon = value[i];
    var keys = filter(idx, subcon);
    if (!keys) return {
        v: undefined
      };
    if (i === 0) assign(result, keys);else {
      each(result, function (_, key) {
        if (!keys[key]) delete result[key];
      });
    }
  };

  for (var i = 0, len = value.length; i < len; i++) {
    var _ret = _loop();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  return result;
});

operands['$in'] = function (idx, _ref5, filter) {
  var key = _ref5.key;
  var value = _ref5.value;

  return filter(idx, {
    type: '$or',
    value: value.map(function (subvalue) {
      return { type: '$eq', key: key, value: subvalue };
    })
  });
};

operands['$not'] = unary(function (idx, _ref6, filter) {
  var value = _ref6.value;

  var subcon = value;
  var result = filter(idx, subcon);

  return cloneWithoutKeys(idx.data, result);
});

operands['$nin'] = function (idx, _ref7, filter) {
  var key = _ref7.key;
  var value = _ref7.value;

  return filter(idx, {
    type: '$not',
    value: { type: '$in', key: key, value: value }
  });
};

module.exports = operands;

function unary(fn) {
  fn.unary = true;
  return fn;
}

},{"../utilities/each":8,"./clone_without_keys":1,"object-assign":undefined}],5:[function(require,module,exports){
"use strict";

// Used to stringify values for index keys
module.exports = JSON.stringify;

},{}],6:[function(require,module,exports){
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var operands = require('./operands');

/*
 * Converts a MongoDB-style query to an AST.
 *
 *     toAST({ name: 'john' })
 *     { type: '$eq', key: 'name', value: 'john' }
 */

module.exports = function toAST(condition, prefix) {
  if ((typeof condition === 'undefined' ? 'undefined' : _typeof(condition)) !== 'object') {
    return { type: '$eq', key: prefix, value: condition };
  }

  var keys = Object.keys(condition);

  if (keys.length === 1) {
    var operand = operands[keys[0]];
    var value = condition[keys[0]];

    if (operand && operand.unary) {
      return { type: keys[0], key: prefix, value: toAST(value, prefix) };
    } else if (operand) {
      return { type: keys[0], key: prefix, value: condition[keys[0]] };
    }
  }

  var conditions = keys.map(function (key) {
    return toAST(condition[key], prefix ? prefix + '.' + key : key);
  });

  return conditions.length === 1 ? conditions[0] : { type: '$and', value: conditions };
};

},{"./operands":4}],7:[function(require,module,exports){
'use strict';

var normalizeKeypath = require('./utilities/normalize_keypath');
var cloneWithoutKeys = require('./lib/clone_without_keys');
var toAST = require('./lib/to_ast');
var assign = require('object-assign');
var each = require('./utilities/each');
var get = require('./utilities/get');
var stringify = require('./lib/stringify');

var operands = require('./lib/operands');
var indexers = require('./lib/indexers');
var fallbacks = require('./lib/fallbacks');

/**
 * Searcher : Searcher(data)
 * (Class) Creates a searcher object where you can search given data.
 *
 *     import Searcher from 'scour-search'
 *
 *     data = [ { symbol: 'AAPL' }, { symbol: 'MSFT' } ]
 *
 *     search = Searcher(data)
 *     search.filter({ symbol: 'AAPL' })
 *
 *     // Add indexing via .index()
 *     search = search.index('symbol')
 *     search.filter({ symbol: 'AAPL' })
 */

function Search(source, options) {
  if (!(this instanceof Search)) return new Search(source);
  if (!options) options = {};
  this.data = source;
  this.indices = options.indices || {};
}

Search.prototype = {
  /**
   * Creates an index for the field `field`. This allows searches against this
   * field to be faster.
   *
   * This function is mutative; it will modify the current Searcher instance.
   *
   *     data = [
   *       { name: 'John' }, { name: 'Paul' }
   *     ]
   *
   *     search = Searcher(data)
   *     search.filter({ name: 'John' }) // ...slow (no index)
   *
   *     search = Searcher(data).index('name')
   *     search.filter({ name: 'John' }) // ...fast
   */

  index: function index(field, type) {
    field = normalizeKeypath(field);
    var indexKey = '' + field.join('.') + ':' + (type || '$eq');

    var index = {};
    each(this.data, function (value, key) {
      indexers['$eq'](value, key, field, index, 1);
    });

    this.indices[indexKey] = index;
    return this;
  },
  dup: function dup(data, options) {
    return new Search(data, {
      indices: options.indices || this.indices
    });
  },

  /**
   * Given new `newData`, update the indices for `keys`. The parameter `keys`
   * can be an array, a number, or a string.
   *
   * The parameter `newData` *must* be different from `data`, but based off of
   * it. (scour-search is biased towards immutable workflows.)
   *
   *     data = [ { name: 'john' } ]
   *     search = Searcher(data).index('name')
   *
   *     // An addition at key `1`
   *     newData = [ { name: 'john' }, { name: 'ringo' } ]
   *     search = search.reindex(newData, 1)
   *
   *     // An deletion at key `1`
   *     newData = [ { name: 'john' } ]
   *     search = search.reindex(newData, 1)
   */

  reindex: function reindex(newData, keys) {
    var _this = this;

    if (!Array.isArray(keys)) keys = [keys];
    var indices = assign({}, this.indices);

    each(keys, function (key) {
      each(_this.indices, function (_, indexKey) {
        var parts = indexKey.split(':'); // TODO support :
        var field = normalizeKeypath(parts[0]);
        var type = parts[1];
        var item = newData[key];

        // Remove old ones
        if (_this.data[key]) {
          var index = {};
          indexers[type](_this.data[key], key, field, index);
          indices[indexKey] = cloneWithoutKeys(_this.indices[indexKey], index);
        }

        // Insert new ones
        if (item) indexers[type](item, key, field, indices[indexKey]);
      });
    });

    return this.dup(newData, { indices: indices });
  },

  /**
   * Internal: Returns keys matching a given value. Run it through
   * `Object.keys` later.
   *
   *     getKeys('name', 'John') // => { '4': 1, '5': 1 }
   */

  getKeys: function getKeys(field, value, type) {
    var key = '' + field + ':' + (type || '$eq');
    if (!this.indices[key]) return;

    var result = this.indices[key][stringify(value)];
    if (typeof result === 'undefined') return {};

    return result;
  },

  /**
   * Performs a query. Supports some MongoDB-style filters.
   *
   *     search = Searcher(data)
   *
   *     search.filter({ name: 'John' })
   *     search.filter({ name: { $eq: 'John' } })
   *     search.filter({ name: { $in: ['John', 'George'] } })
   */

  filter: function filter(condition) {
    var _this2 = this;

    var keys = this.filterRaw(toAST(condition));
    keys = Object.keys(keys);

    if (Array.isArray(this.data)) {
      return keys.map(function (key) {
        return _this2.data[key];
      });
    } else {
      var result = {};
      keys.forEach(function (key) {
        result[key] = _this2.data[key];
      });
      return result;
    }
  },

  /**
   * Performs a query, and only returns keys.
   */

  filterKeys: function filterKeys(condition) {
    return Object.keys(this.filterRaw(toAST(condition)));
  },
  filterRaw: function filterRaw(ast) {
    return filter(this, ast);
  }
};

/**
 * Internal: filters by a given condition (`{ type, key, value }`).
 */

function filter(idx, condition) {
  var type = condition.type;
  if (!type) return;

  return operands[type] && operands[type](idx, condition, filter) || fallbacks[type] && fallbacks[type](idx, condition, filter) || undefined;
}

/*
 * Internal: Exports
 */

Search.toAST = toAST;
Search.operands = operands;
Search.indexers = indexers;
Search.fallbacks = fallbacks;

module.exports = Search;

},{"./lib/clone_without_keys":1,"./lib/fallbacks":2,"./lib/indexers":3,"./lib/operands":4,"./lib/stringify":5,"./lib/to_ast":6,"./utilities/each":8,"./utilities/get":9,"./utilities/normalize_keypath":10,"object-assign":undefined}],8:[function(require,module,exports){
'use strict';

/**
 * each : each(list, fn)
 * Iterates through `list` (an array or an object). This is useful when dealing
 * with NodeLists like `document.querySelectorAll`.
 */

function each(list, fn) {
  if (!list) return;

  var i;
  var len = list.length;
  var idx;

  if (typeof len === 'number') {
    if (each.native) return each.native.call(list, fn);
    for (i = 0; i < len; i++) {
      fn(list[i], i, i);
    }
  } else {
    idx = 0;
    for (i in list) {
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++);
    }
  }

  return list;
}

each.native = Array.prototype.forEach;

module.exports = each;

},{}],9:[function(require,module,exports){
'use strict';

module.exports = function get(object, keypath) {
  var result = object;

  for (var i = 0, len = keypath.length; i < len; i++) {
    result = result[keypath[i]];
    if (!result) return result;
  }

  return result;
};

},{}],10:[function(require,module,exports){
'use strict';

/**
 * Internal: normalizes a keypath, allowing dot syntax, and normalizing them
 * all to strings.
 *
 *     normalizeKeypath('user.12.name')  // => ['user', '12', 'name']
 *     normalizeKeypath(['user', 12])    // => ['user', 12]
 */

module.exports = function normalizeKeypath(keypath, isArguments) {
  if (!keypath) return [];
  if (typeof keypath === 'string') {
    return keypath.split('.');
  } else if (isArguments && keypath.length === 1) {
    if (Array.isArray(keypath[0])) return keypath[0].map(function (k) {
      return '' + k;
    });
    if (typeof keypath[0] === 'number') return ['' + keypath[0]];
    return ('' + keypath[0]).split('.');
  } else {
    if (isArguments) keypath = Array.prototype.slice.call(keypath);
    return keypath.map(function (k) {
      return '' + k;
    });
  }
};

},{}]},{},[7]);