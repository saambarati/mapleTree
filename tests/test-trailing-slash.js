
var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')

function a() {}
function b() {}
function c() {}
tree.define('/trail', a)
tree.define('/trail/', b)
tree.define('/withorwithout/?', c)

var matcher = tree.match('/trail')
assert(matcher.perfect)
assert(matcher.fn === a)

matcher = tree.match('/trail/')
assert(matcher.perfect)
assert(matcher.fn === b)

matcher = tree.match('/withorwithout/')
assert(matcher.perfect)
assert(matcher.fn === c)
matcher = tree.match('/withorwithout')
assert(matcher.perfect)
assert(matcher.fn === c)
