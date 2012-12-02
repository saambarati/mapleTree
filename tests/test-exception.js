


var maple = require('../treeRouter.js')
   , tree = new maple.RouteTree({'fifo' : false})
   , assert = require('assert')

var f = function (){}
function validate (err) {
   if (err instanceof Error && err.prototype === (new Error()).prototype) { return true }
   else { return false }
}
function thrower (func) {
  var args = arguments
  return function () {
    func.apply(tree, Array.prototype.slice.call(args, 1))
  }
}

//assert.throws(function () { tree.define('/hello world/', f) }, validate, eName)
assert.throws(thrower(tree.define, '/hello world', f), validate)
assert.throws(thrower(tree.define, '/ helloworld', f), validate)
assert.throws(thrower(tree.define, '/routeWithoutCallback'), validate)

console.log('passed all throwing exception tests')

