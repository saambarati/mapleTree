

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')

tree.define('/hello\\world', function () {})
tree.define('/doop-dippy/dippy-doop', function () {})
tree.define('/hello.world/', function () {})
tree.define('/partial-[\\\\w]\\+', function(){}) //sudo regex
tree.define('/example_[a\\-z]\\+', function(){}) //sudo regex


var matcher = tree.match('/hello\\world')
assert(matcher.perfect)

matcher = tree.match('/doop-dippy/dippy-doop')
assert(matcher.perfect)

matcher = tree.match('/hello.world/')
assert(matcher.perfect)

matcher = tree.match('/partial-words')
assert(matcher.perfect)

matcher = tree.match('/example_alpha')
assert(matcher.perfect)

matcher = tree.match('/example_alpha78')
assert(!matcher.perfect)
