import Coalesce from 'coalesce/namespace';

//
// Wrapper around sinon fake server
//


export class Server {
  
  constructor(sinon) {
    this.sinon = sinon;
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = (xhr) =>  {
      this.handleRequest(xhr);
    };
    this.handlers = {};
    // history
    this.h = [];
  }
  
  restore() {
    this.xhr.restore();
  }
  
  r(str, fn) {
    if(typeof fn !== 'function') {
      var orig = fn;
      fn = function() { return orig; }
    }
    
    this.handlers[str] = fn;
  }
  
  handleRequest(xhr) {
    setTimeout(() => {
      var path = xhr.url.split('?')[0],
          str = xhr.method + ':' + path,
          fn = this.handlers[str],
          h = this.h;
          
      console.assert(fn, `No handler defined for ${str}`);
      
      var result = Coalesce.Promise.resolve(fn(xhr));
      result.then( function (res) {
        h.push(str);
        if(xhr.readyState === 4) return;
        xhr.respond(200, { "Content-Type": "application/json" }, JSON.stringify(res));
      }, function (res) {
        h.push(str);
        if(xhr.readyState === 4) return;
        xhr.respond(500, { "Content-Type": "application/json" }, JSON.stringify(res));
      });
    }, 10);
  }
  
}

// setup automatically for all tests
beforeEach(function() {
  this.server = new Server(sinon);
});

afterEach(function() {
  this.server.restore();
});
