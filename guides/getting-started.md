# Getting Started

(TODO script tags/bower etc.)

## Setting up the Context

At the core of every application that uses Coalesce is a Context instance. The context serves as a registry for all the model types in an application as well as corresponding configuration.

The first step in using Coalesce is to define your context:


```javascript
import Context from 'coalesce/context';
import Post from 'app/models/post';
import Comment from 'app/models/comment';

var context = new Context({
  types: {
    post: Post,
    comment: Comment
  }
});


// this is the main session for your application
var session = context.session;

// you are good to go, write some application code
var posts = session.query('posts');
```

## Setting the default Adapter

Aside from the models themselves, Adapters are the central point of configuration for your application. The implementation of the Adapter dictates the type of backend your application interfaces with and the behavior of your session. Things such as *url structure*, *caching behavior*, and *serialization* are generally configured on the adapter.

By default, Coalesce uses the `RestAdapter` implementation that is included. TO use a custom default adapter for all types in an application, specify it in the `defaults` section of the context:

```javascript
var context = new Context({
  types: {
    defaults: {
      adapter: MyCustomAdapter 
    },
    post: Post,
    comment: Comment
  }
});
```

Adapters can also be specified per-type:

```javascript
var context = new Context({
  types: {
    post: {
      class: Post,
      adapter: MyCustomAdapter
    },
    comment: Comment
  }
});
```

See the [Adapter Guide](#) for more information on adapters.
