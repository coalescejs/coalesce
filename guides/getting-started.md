# Getting Started

## Installation

TODO: 


## Creating the Context

The very first piece of code required to use Coalesce is to instantiate a context:

```javascript
import Context from 'coalesce/context';

var context = new Context({
  // configuration goes here
})
```

Once the context has been instantiated, the primary session can be retrieved:

```
var session = context.session;

// do whatever you want with the session
session.load('post', 1).then(function(post) {
  
});
```

## Defining Types
