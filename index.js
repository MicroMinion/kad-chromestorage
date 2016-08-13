var _ = require('lodash')
var events = require('events')

'use strict'

var KadChromeStorage = function (namespace) {
  if (namespace.indexOf('_') >= 0) throw new Error('invalid namespace')
  this._prefix = namespace + '_'
}

KadChromeStorage.prototype.get = function (key, cb) {
  chrome.storage.local.get(this._prefix + key, function (items) {
    if (!cb) {
      return
    }
    if (chrome.runtime.lastError) {
      cb(new Error('error while retrieving key ' + key))
    } else if (!_.has(items, key)) {
      cb(new Error('key not found ' + key))
    } else {
      cb(null, items[key])
    }
  })
}

KadChromeStorage.prototype.put = function (key, val, cb) {
  key = this._prefix + key
  var items = {}
  items[key] = val
  chrome.storage.local.set(items, function () {
    if (!cb) {
      return
    }
    if (chrome.runtime.lastError) {
      cb(new Error('Error while storing ' + key))
    } else {
      cb(null)
    }
  })
}

KadChromeStorage.prototype.del = function (key, cb) {
  key = this._prefix + key
  chrome.storage.local.remove(key, function () {
    if (!cb) {
      return
    }
    if (chrome.runtime.lastError) {
      cb(new Error('Error while removing ' + key))
    } else {
      cb(null)
    }
  })
}

KadChromeStorage.prototype.createReadStream = function () {
  var stream = new events.EventEmitter()
  var storage = this
  chrome.storage.local.get(null, function (items) {
    _.forEach(items, function (value, unprefixedKey) {
      var isOwnKey = unprefixedKey.indexOf(storage._prefix) === 0
      if (isOwnKey) {
        var key = unprefixedKey.substring(storage._prefix.length)
        stream.emit('data', {
          key: key,
          value: value
        })
      }
    })
  })
  return stream
}

module.exports = KadChromeStorage
