

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')

//note cbs.length is one less than matching routes, this is because the best match is placed in match.fn when '.match()' is invoked
//keep in mind, these functions can be defined in any order, because there are no conflicts between them
function a() {
  this.next()
}
function b() {
  this.next()
}
function c() {
  this.next()
}
function d() {
  this.next()
}
tree.define('/hello', a)
tree.define('/hello/world', b)
tree.define('/hello/world/foo', c)
tree.define('/hello/world/foo/bar', d)

var match = tree.match('/hello/world/foo/bar')
assert(match.cbs.length === 3)
assert(match.fn === d)
assert(match.cbs[2] === a)
assert(match.cbs[1] === b)
assert(match.cbs[0] === c)
match.fn()
assert(match.cbs.length === 0)

match = tree.match('/hello/world')
assert(match.cbs.length === 1)
assert(match.fn === b)
assert(match.cbs[0] === a)
match.fn()
assert(match.cbs.length === 0)
