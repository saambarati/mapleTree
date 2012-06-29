
var assert = require('assert')
  , mapleTree = require('../treeRouter.js')
  , router = new mapleTree.RouteTree()

router.define('/foo/bar', function(){})
router.define('/bar', function(){})
router.define('/foo/bar/hello', function(){})

var route = router.match('/bar')
assert.ok(route.fn instanceof Function, 'Should match a route.')
assert.equal(route.cbs.length, 0, 'Should match one and only one route.')

var route = router.match('/foo/bar')
assert.ok(route.fn instanceof Function, 'Should match a route.')
assert.equal(route.cbs.length, 0, 'Should match one and only one route.') // This will throw

var route = router.match('/foo/bar/hello')
assert.ok(route.fn instanceof Function)
assert.equal(route.cbs.length, 1) //should match two routes '/foo/bar callback && /foo/bar/hello callback'

