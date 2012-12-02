

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')
   , f = function(){}

tree.define('/dash-dash/hello-:dash', f)
tree.define('/hello.world', f)
tree.define('/plus+', f)
tree.define('/hey+world', f)
tree.define('/amp&', f)

var matcher

matcher = tree.match('/dash-dash/hello-anything')
assert(matcher.perfect)
assert(matcher.params.dash === 'anything')

matcher = tree.match('/hello.world')
assert(matcher.perfect)

matcher = tree.match('/plus+')
assert(matcher.perfect)

matcher = tree.match('/hey+world')
assert(matcher.perfect)

matcher = tree.match('/amp&')
assert(matcher.perfect)
