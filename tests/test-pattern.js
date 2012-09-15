

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')


var match = maple.pattern('/test/:var')
assert(match('/test/var/not/') === false)
assert(match('/test/var') === true)
assert(match('/test/') === false)

match = maple.pattern('/foo/bar/')
assert(match('/foo/bar') === true)
assert(match('/foo/bar/') === true)
assert(match('/foo/') === false)
assert(match('/foo/bars') === false)
assert(match('/bar/') === false)

match = maple.pattern('/wildcard/*')
assert(match('/wildcard/') === false)
assert(match('/wildcard') === false)
assert(match('/wildcard/foo/') === true) //keep with ending and not ending slash
assert(match('/wildcard/foo') === true)
assert(match('/wildcard/foo/bar') === true)
assert(match('/wildcard/foo/bar/') === true)

match = maple.pattern('/question/mark?/')
assert(match('/question/') === true)
assert(match('/question/mark/') === true)
assert(match('/question/mark') === true)
assert(match('/question/mark/no') === false)
assert(match('/question/nope') === false)

match = maple.pattern('/question/second/:mark?/')
assert(match('/question/second/') === true)
assert(match('/question/second/yes') === true)
assert(match('/question/second/yessir') === true)
assert(match('/question/second/hello/nope') === false)
assert(match('/question/nope') === false)
assert(match('/question/') === false)

match = maple.pattern('/prefix-*')
assert(match('/prefix-hello') === true)
assert(match('/prefix') === false)
assert(match('/prefix-') === false)
assert(match('/prefix-a') === true)

