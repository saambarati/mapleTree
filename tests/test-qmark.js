
var maple = require('../treeRouter.js')
  , router = new maple.RouteTree()
  , assert = require('assert')
  , matcher

router.define('/hello/optional?/:sop?/third/:file.:format?', function () { })
router.define('/noqmarks', function () { })
router.define('/site/:user?', function(){})
router.define('/optionalslash/?', function(){})

matcher = router.match('/hello')
assert(matcher.perfect)

matcher = router.match('/hello/optional')
assert(matcher.perfect)

matcher = router.match('/hello/optional/second/')
assert(!matcher.perfect) //not perfect b/c .../third/... is required if /:sop/ is present in the route there

matcher = router.match('/hello/optional/second/third')
assert(matcher.perfect)

matcher = router.match('/hello/optional/test/third')
assert(matcher.perfect)
assert.equal(matcher.params.sop, 'test')


matcher = router.match('/hello/optional/test/third/space.m4a')
assert(matcher.perfect)
assert.equal(matcher.params.file, 'space')
assert.equal(matcher.params.format, 'm4a')

//no ??
matcher = router.match('/noqmarks')
assert(matcher.perfect)

//normal use case
matcher = router.match('/site')
assert(matcher.perfect)
assert(!matcher.params.user)

matcher = router.match('/site/admin')
assert(matcher.perfect)
assert(matcher.params.user)
assert.equal(matcher.params.user, 'admin')

matcher = router.match('/site/user/notexist')
assert(!matcher.perfect)
console.log('passed all questionmark tests')

matcher = router.match('/optionalslash')
assert(matcher.perfect)
matcher = router.match('/optionalslash/')
assert(matcher.perfect)
