
//only two reserver charachters for our mini syntax
var reservedChars = [
  '*'
  , ':'
]

var escapedChars = [
  '.'
  , '-'
  , '/'
  , '+'
]

function isEscapedChar(aChar) {
  return escapedChars.indexOf(aChar) !== -1
}
function isReservedChar(aChar) {
  return reservedChars.indexOf(aChar) !== -1
}

/*
 * returns a regexp that will match against this route
 * @param {string} aRoute
 * @param {boolean} matchTillEnd, whether or not to add the Regexp dollar sign match till end identifier
 * @return {
 *    regexp:  {RegExp}   =>  that matches the route
 *    , params: {array}   =>  /:hello/:world/  => ['hello', 'world']
 * }
 */
function createRoute() {
  var cur = ''
    , myStr = ''
    , curIndex = 0
    , keys = []
    , regEx = ''
    , flags = ['i'] //for regexp constructor
    , prev = ''


  function canProceed() {
    if (isEscapedChar(cur) || isReservedChar(cur)) return false
    else return true
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

    prev = cur
    curIndex += 1
    cur = myStr.charAt(curIndex)  //note, when curIndex exceeds the bounds of the string, a blank '' string is returned
    return cur
  }

  function colon () {
    //colons can only be followed by letters, numbers or underscores/
    var range = /[a-zA-Z0-9\_]/
      , aKey = ''

    next(':') //get rid of colon
    while (cur && canProceed()) {
      if (range.test(cur)) {
        aKey += cur
        next()
      } else {
        return badRoute(cur)
      }
    }

    keys.push(aKey)

    return '([^\\/]+)' //match everything except a '/'
  }

  function wildcard () {
    return '(.+)' //capture everything but the final '/'
  }

  function exactPath () {
    var exact = ''
    while (cur && canProceed()) {
      exact += cur
      next()
    }
    return exact
  }

  function startMatching () {
    regEx = '^' //match from beginning
    // NOTE to self, be careful about using question mark's for the {0, 1} previous match because it allows partial routes match one another.
    // this is especially pertinent to ('/') slashes where '/file/' could match '/files/' if the slash is optional
    while (cur) {
      switch (cur) {
        case '*' :
          regEx += wildcard()
          return regEx   //we are done
        case ':' :
          regEx += colon()
          break
        default :
          if (isEscapedChar(cur)) {
            regEx += '\\' + cur
            next() //get rid of escaped char
          } else { //default letters such as '/hello'
            regEx += exactPath()
          }
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


  return begin.apply({}, [].slice.call(arguments))
}


module.exports = createRoute


