
var util = require('util')
   , events = require('events')
   , compile = require('./compile.js')
   , assert = require('assert')

//for testing purposes
//   , DEBUG = false
//   , debug
//
//if (DEBUG) {
//  debug = function() {
//    console.log.apply(console, [].slice.call(arguments))
//  }
//} else {
//  debug = function(){}
//}


/*
 * @param {RegExp} reg_exp
 * @param {Array} params_a    =>  represents 'colon' in '/hello/:colon'
 * @param {Function} cb  => callback
 */
var RouteNode = function (reg_exp, params_a, cb) {
  if (!(this instanceof RouteNode)) { return new RouteNode(reg_exp) }
  if (!reg_exp) { throw new Error('route needs a regexp to be defined') }
  if (typeof params_a === 'function' && !cb) {
    cb = params_a
    params_a = null
  }

  var self = this

  self.children = []
  self.regexp = reg_exp
  self.key = self.regexp.toString()
  self.callback = cb  //callback is optional, if we don't have a callback, it means that we aren't an executable route,
  if (params_a) { self.params = params_a }
}

/*
 * @param {object} options
 * flags => 'fifo' : true or false (false default)  //represents order of how we match routes
 */
var RouteTree = function (options) {
   this.root = new RouteNode(/^$/)
   if (!options) {
     options = {'fifo' : false}
   }
   this.fifo = !!options.fifo
}

/*
 * gather array of potential paths, may include '?' may not
 * @param {string} path
 * @return {array} of potential paths
 *
 * this function works based on the assumption that if the latter question mark routes match
 * then the earlier question marks in the route are assumed to be matching as well, therefore we can remove the ?marks
 * this function continually adds the path preceding the earliest ?mark into the paths array,
 * stripping the ?mark, and reapplying the same logic to the rest of the string
*/
function getQMarkPaths(apath, paths) {
  var qi = apath.indexOf('?') //returns first occuring index
    , i = qi
    , prev

  if (qi === -1) { //recursion has finished
    paths.push(apath)
    return paths
  }
  //take away ? mark and recursively add paths to support more than 1 qmark.
  while (apath.charAt(--i) !== '/')
    ;

  paths.push(apath.slice(0, i)) //add current matching path without qmark and without ending '/'
  return getQMarkPaths(apath.slice(0, qi) + apath.slice(qi+1), paths) //remove current ? mark in question, and reapply logic to next potential ?mark
}



/*
 * @param {string|regexp} path
 * @param {function} callback
 */
RouteTree.prototype.define = function (path, callback) {
   if (!path || !callback) { throw new Error('mapleTree needs a path and a callback to define a route') }
   var prereq = / /g
      , i
      , j
      , paths

   if (typeof path === 'string') {
      if (prereq.test(path)) {
        throw new Error('defined path cannot contain spaces path => ' + path)
      }
      if (path === '/') {
         var rootNode = new RouteNode(/^\/$/, callback)
         this.root.children.unshift(rootNode) //keep root at front of array to optimize the match against root. Will stay O(1)
      } else {
         //generate questionmark paths
         paths = getQMarkPaths(path, [])
         paths.forEach(function (apath) {
           var portions = []
             , sliceTo

           while (apath.length) {
             sliceTo = apath.indexOf('/', 1) //don't match the '/' that is at the beginning but the one following the one at index 0
             if (sliceTo !== -1) { //more slahes ('/') left
               portions.push( apath.slice(0, sliceTo) ) //add current route i.e => '/hello' in '/hello/world'
               apath = apath.slice(sliceTo) //before apath = '/hello/world' after apath = '/world'
             } else { //whats left in apath is final portion of route being defined => '/someRoute' or '/'
               portions.push(apath)
               apath = ''
             }
           }
           for (i = 0; i < portions.length; i+=1) portions[i] = compile(portions[i])  //returns {regexp:reg , params:[id1,id2,...]}
           this._defineRecursiveHelper(this.root, portions, callback, path) //note original path here for redefine warnings
         }.bind(this))
      }
   } else if (path instanceof RegExp) {
      //TODO figure out an elegant way to handle this that doesn't involve only definining it as root's child
      var newNode = new RouteNode(path, callback)
      this.root.children.push(newNode)
   }
}

RouteTree.prototype._defineRecursiveHelper = function (curNode, paths, cb, fullPath) {
  var currentRoute = paths.shift()
     , newNode
     , i
     , curKey = currentRoute.regexp.toString()

  for (i = 0; i < curNode.children.length; i++) {    //does a child node with same key already exist?
    if (curNode.children[i].key === curKey) {
      if (paths.length) { this._defineRecursiveHelper(curNode.children[i], paths, cb, fullPath) }
      else {
        //redefine callback, maybew throw error in future, or warn the user
        if (curNode.children[i].callback) { console.warn('WARNING: redefining route, this will create routing conflicts. Conflicted path => ' + fullPath) }
        curNode.children[i].callback = cb
      }
      return //don't allow anything else to happen on current call frame
    }
  }
  newNode = new RouteNode(currentRoute.regexp, currentRoute.params)
  curNode.children.push(newNode)
  if (paths.length) {
    this._defineRecursiveHelper(newNode, paths, cb, fullPath)
  } else {
    //end of recursion, we have a matching function
    newNode.callback = cb
  }
}


/*
 * @param {string} path
 * @return an instance of Matcher
 */
RouteTree.prototype.match = function (path) {
  var matcher = new Matcher()
    , decodedPath

  try {
    decodedPath = decodeURIComponent(path)
  } catch (err) {
    decodedPath = path   //oh well
  }

  this._matchRecursiveHelper(this.root, decodedPath, matcher)

  //callbacks are added in preorder fashion, so if we want filo, we must reverse the order of fns
  if (!this.fifo) { matcher.cbs.reverse() } //TODO, consider optimizing this so this.fifo has to be reversed because !this.fifo === default setting
  matcher.fn = matcher.cbs.shift()

  return matcher
}

/*
 * @param {RouteNode} curNode
 * @param {String} curPath
 * @param {Matcher} matcher
*/
RouteTree.prototype._matchRecursiveHelper = function (curNode, curPath, matcher) {
   var i
      , j
      , exe
      , mNode
      , mPath
      , slicer

   for (i = 0; i < curNode.children.length; i+=1) {
      exe = curNode.children[i].regexp.exec(curPath)
      if (exe) {
         mNode = curNode.children[i]
         mNode.regexp.lastIndex = 0 //keep matching from start of str
         mPath = exe[0]
         slicer = curPath.slice(mPath.length)
         //incorrect partial match when slicer[0] !== '/' i.e => '/hell' will match '/hello/world' but not be correct b/c slicer[0] === 'o' instead of '/'
         //or if mPath === curPath, slicer === '' and we have a perfect match
         if (mPath.length !== curPath.length && slicer.charAt(0) !== '/') continue

         if (exe.length > 1) {
           if (mNode.params) {  //colon args
             for (j = 0; j < mNode.params.length && (j+1) < exe.length; j++) {
               matcher.params[mNode.params[j]] = exe[j+1] //mNode.params[j] contains the colon arg named string. i.e in => '/hello/:foo', mNode.params[j] === 'foo'
             }
           } else {  //regex capture groups that aren't part of colon args, this will mostly be for wildcard routes '/*'
             for (j = 1; j < exe.length; j++) {
               matcher.extras.push(exe[j])
             }
           }
         }

         curPath = curPath.slice(mPath.length)
         if (curPath.length) {
           if (mNode.callback) { matcher.cbs.push(mNode.callback) } //TODO, should I add callbacks consecutively if they are the same function from ? mark routes
           this._matchRecursiveHelper(mNode, curPath, matcher) //continute recursive search
         } else {
           if (mNode.callback) { //callback indicates this route was explicitly declared, not just a branch of another route, recursion ends
             matcher.perfect = true
             matcher.cbs.push(mNode.callback)
           }
         }
         return //dive deeper into the tree, don't allow more matches at this level in the tree
      }
   }
}



var Matcher = function () {
  this.cbs = []          //collection of callbacks, the closest match first
  this.fn = null         //placeholder for best matching function
  this.perfect = false   //were we able to match an exact path, or did we only match partially?
  this.extras = []       //match regexp capture groups that isn't part of params
  this.params = {}       //colon args
}

Matcher.prototype.next = function () {
  this.fn = this.cbs.shift()
  if (this.fn) { this.fn.apply(this, Array.prototype.slice.call(arguments)) }
}


/*
 * pattern matching API
 *
 * @param {string} toMatch => similary type string that you would use in router.define
 * @return a function that when executed with string as its argument, will return a boolean
*/

function pattern(toMatch) {
  var regexps = getQMarkPaths(toMatch, [])

  //reassign array to compiled regular expressions
  regexps.forEach(function(aPath, ix) {
    regexps[ix] = compile(aPath, true).regexp //'true' tells regexp compiler to math till end => '$'
  })


  if (regexps.length === 1) { //fast case
    regexps = regexps[0]
    return function (testAgainst) {
      return regexps.test(testAgainst)
    }
  } else { //test each potential path
    return function (testAgainst) {
      for (var i = 0; i < regexps.length; i++) {
        if (regexps[i].test(testAgainst)) return true
      }

      return false
    }
  }
}

//EXPORTS
exports.RouteTree = RouteTree
exports.pattern = pattern

