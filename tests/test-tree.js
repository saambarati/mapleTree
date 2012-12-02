

var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree()
   , assert = require('assert')

tree.define('/hello/world', function () {
  console.log('hello world')
})

tree.define('/hello/saam', function () {
   console.log('hello saam')
})

function cdef () {}
tree.define('/colon/:a/definite', cdef)
//note, above route will hold preference because it was defined first
//note, when routes overlap, it is good practice to name the colon arguments the same, because otherwise, you may run into funky behavior
function cab () {}
tree.define('/colon/:a/:b', cab)

function wc () {}
tree.define('/wildcard/*', wc)

function root () {}
tree.define('/', root)

tree.define(/\/regexp\/match\//, function () {
   console.log('regexp match')
})
tree.define(/\/regexp\/(\w+)\/?/, function () {
  console.log('regexp with word group')
})

tree.define('/files/:file.:format', function () {
   console.log('file and format')
   this.next.call(this, 'testing', 'argument', 'list')
   //will call below routes function ...
})
tree.define('/files', function () {
  console.log('arguments to next() length => ' + arguments.length)
  console.log('next() was correctly invoked')
})

tree.define('/form.json', function () {
   console.log('form.json')
})

assert.throws(function() {
  tree.define('/:willthrow@', function(){})
})

var matcher
matcher = tree.match('/hello/saam')
assert.ok(matcher.perfect)

matcher = tree.match('/hello/world')
assert.ok(matcher.perfect)

matcher = tree.match('/')
assert(matcher.perfect)
assert(matcher.fn === root)

matcher = tree.match('/colon/saam/last')
console.log(JSON.stringify(matcher.params))
assert.ok(matcher.perfect)
assert(matcher.fn === cab)
assert.equal(matcher.params.a, 'saam')
assert.equal(matcher.params.b, 'last')

matcher = tree.match('/colon/saam')
assert(false === matcher.perfect)
assert(matcher.params.a === 'saam') //notice route doesn't match perfectly, but the param should still exist

matcher = tree.match('/colon/saam/definite')
assert(matcher.perfect)
assert.equal(matcher.params.a, 'saam')
assert(matcher.fn === cdef)

matcher = tree.match('/colon/hello%20world/definite') //test decodeURIComponent
assert.ok(matcher.perfect)
assert.equal(matcher.params.a, 'hello world')

matcher = tree.match('/wildcard/i/can/match/anything')
assert(matcher.perfect)
assert(matcher.fn === wc)
console.log(matcher.extras)
assert.equal(matcher.extras[0], 'i/can/match/anything')

matcher = tree.match('/wildcard/i/am')
assert.ok(matcher.perfect)
console.log(matcher.extras)
assert.equal(matcher.extras[0], 'i/am')

matcher = tree.match('/wildcard/oneleveldeep')
assert.ok(matcher.perfect)
console.log(matcher.extras)

matcher = tree.match('/wildcard/')
if (matcher.fn) { throw new Error("this route should not match")}

matcher = tree.match('/regexp/match')
assert.ok(matcher.perfect)

matcher = tree.match('/regexp/wordgroup')
assert.ok(matcher.perfect)
assert.equal(matcher.extras[0], 'wordgroup')

matcher = tree.match('/')
assert.ok(matcher.perfect)

matcher = tree.match('/files/index_one.html')
assert.ok(matcher.perfect)
assert.equal(matcher.params.file, 'index_one')
assert.equal(matcher.params.format, 'html')

matcher = tree.match('/files/ind_ex.html/doesnt_exist')
assert.equal(false, matcher.perfect)

matcher = tree.match('/form.json')
assert.ok(matcher.fn)


console.log('tests have passed in test-tree.js')





