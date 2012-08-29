/*
 * returns a regexp that will match against this route
 * @param {string} aRoute
 * @return {
 *    regexp: that matches route
 *    , params: {array}   ---->   /:hello/:world/  => ['hello', 'world']
 * }
 */
function createRoute() {
  var cur = ''
    , myStr = ''
    , curIndex = 0
    , keys = []
    , regEx = ''
    , flags = ['i']
    , reservedChars = {
      '/' : true 
        , '.' : true
        , ':' : true
    }

  function badRoute(token) {
    throw new Error('unexpected token within route: ' + "'" + cur + "'" + ' at index:' + curIndex)  
  }

  function next(token) {
    if (token) {
      if (typeof token === 'string' && token !== cur) {
        return badRoute(cur)
      } else if (token instanceof RegExp && !token.test(cur)) {
        return badRoute(cur) 
      }
    }
    curIndex += 1
      cur = myStr.charAt(curIndex)  //note, when curIndex exceeds the bounds of the string, a blank '' string is returned
      return cur
  }

  function colon () {
    //colons can only be followed by letters, numbers or underscores/
    var range = /[a-zA-Z0-9\_]/
      , aKey = ''
      next(':') //get rid of colon
      while (cur && !reservedChars[cur]) {
        if (range.test(cur)) {
          aKey += cur
            next()
        } else {
          return badRoute(cur)
        }
      }
    keys.push(aKey)

      return '([^\\/]+)'
  } 

  function wildcard () {
    return '(.+)\\/' //capture everything but the final '/'
  }

  function exactPath () {
    var reg = ''
      while (cur && !reservedChars[cur]) {
        reg += cur 
          next() 
      }
    return reg
  }

  function startMatching () {
    regEx = '^' //match from beginning
      while (cur) {
        switch (cur) {
          case '/' : //note, this is not currently being used due to treeRouter's implementation stripping away the forward slashes, but is used for pattern matching API
            regEx += '\\/'
            next()
            break
          case '*' :
            regEx += wildcard()
            return regEx   //we are done
          case ':' : 
            regEx += colon()
            break
          case '.' :
            regEx += '\\.'
            next()
            break
          default : 
            regEx += exactPath()
            break
        }
      }
  }

  function begin (stringToEvaluate, matchTillEnd) {
    myStr = stringToEvaluate
    cur = myStr.charAt(0)
    curIndex = 0
    startMatching()
    if (matchTillEnd) regEx += '$'

    return {
      'params' : (keys.length ? keys : null)
      , 'regexp' : new RegExp(regEx, flags.join(''))
    }
  }


  return begin.apply({}, Array.prototype.slice.call(arguments))
}


module.exports = createRoute


