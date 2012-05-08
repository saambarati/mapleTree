
mapleTree
=========

Maple is a small, recursive router for Node.js. It works by creating a routing tree and searching for full and partial matches.
Maple is designed to be minimal. It is written with the intention that other libraries can be built on top of it or extend its functionality.

####Install
    npm install mapleTree
#### From Source
    git clone git://github.com/saambarati/mapleTree.git
    cd mapleTree
    npm link

API
---

### Simple Routing
     var mapleTree = require('mapleTree') 
       , router = new mapleTree.RouteTree()
      
     router.define('/foo/bar/', function () {
       console.log('foo/bar route')
     })
     
     router.define('/hello/:foo', function () {
       console.log('hello/:foo')
     })
     
     router.define('/files/:file.:format/', function () {
       console.log('file callback')
       console.log('filename =>' + this.params.file + '.'+ this.params.format)
     })
    
     /*
      *  the matcher object
      *  contains a few important properties
      *  matcher.cbs = {Array}                           //collection of callbacks, the closest match first
      *  matcher.fn = {function}                         //placeholder for best matching function
      *  matcher.perfect = {boolean} default => false    //were we able to match an exact path, or did we only match partially?
      *  matcher.extras = {Array}                        //match a regexp capture group that isn't part of params
      *  matcher.params = {Object}                       //collection of colon args
     */ 
     var match = router.match('/foo/bar/')
     match.fn()  //prints 'foo/bar route'
     
     match = router.match('/hello/world')
     match.fn()        //prints 'hello/:foo'
     console.log(match.params.foo) //prints 'world'
     
     match = router.match('/files/index.html') 
     match.fn()  //prints 'filename => index.html'
     
  
### Partial Matches -- *first in first out / first in last out*
     var mapleTree = require('mapleTree') 
       , router = new mapleTree.RouteTree({'fifo' : false })
  
     router.define('/hello/', function () {
       console.log('/hello/')
       this.next()
     })
     router.define('/hello/world/', function () {
       console.log('/hello/world/')
       this.next()
     })
     router.define('/hello/world/foo/', function () {
       console.log('/hello/world/foo/')
       this.next()
     })
  
     var match = router.match('/hello/world/foo')
     match.fn()
     /* PRINTS =>
      *  /hello/world/foo
      *  /hello/world/ 
      *  /hello/
     */
  
     router.fifo = true  //first match is invoked first now
     //or when creating the router you can pass an options obj  => new maple.RouteTree({'fifo' : true})
     match = router.match('/hello/world/foo')
     match.fn()
     /* PRINTS =>
      *  /hello/
      *  /hello/world/ 
      *  /hello/world/foo/
     */
  
