

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')


//the purpose of this test is to make sure similar routes don't interfere with one another. I made this because I had an early bug where routes differing by 1 letter would sometimes match
function a(){}
function b(){}
function c(){}

tree.define('/trees.e/', a)
tree.define('/trees/', b)
tree.define('/tree/', c)

var matcher

matcher = tree.match('/trees.e')
assert(matcher.fn === a)

matcher = tree.match('/trees')
assert(matcher.fn === b)

matcher = tree.match('/tree')
assert(matcher.fn === c)

