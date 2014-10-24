# Advanced Configuration

At the core of every application that uses Coalesce is a `Context` instance.

The context serves as a registry for all the *model types* in an application as well as corresponding configuration. A Type is a concrete class that serves as a model in the application. Other object's such as adapters and serializers are also defined and configured within a context.

The default context can be configured via a *configuration object* that is passed into its constructor:

```javascript
import Context from 'coalesce/context';
var context = new Context({
  // config goes here
});
```

The remainder of this document discusses high level concepts and the structure of the configuration object. For specific API, check out the API docs.

## Types

Types are configured in a top level `types` property in the configuration object:

```javascript
{
  types: {
    post: {
      class: Post
      ...
    },
    comment: {
      class: Comment
      ...
    }
  }
}
```

Each type can be individually configured:

```javascript
post: {
  class: Post,
  queryCache: false,
  serializer: MyPostSerializer
}
```

The above configuration sets the `post` type to use the `Post` class, to not use a `queryCache` provider, and to use a custom serializer implementation, `MyPostSerializer`.

Default configuration can also be provided for all types in a context:

```javascript
{
  types: {
    defaults: {
      serializer: MyModelSerializer
    },
    post: {
      class: Post
    },
    comment: {
      class: Comment
    }
  }
}
```

The `defaults` key within the `types` section is special and does not correspond to an actual type, but rather configuration for *all* types.

## Providers

So far, we've seen types be defined and configured to use a custom serializer and query cache. It turns out that types, serializers and query caches are all types of **providers**. Providers can all be defined and configured in the same manner. In the above example, the serializer `MyModelSerializer` is just defined inline, but it could also be defined as a *named provider*, similarly to how the types are defined:

```javascript
{
  serializers: {
    mySerializer: {
      class: MyModelSerializer
    }
  },
  types: {
    defaults: {
      serializer: 'mySerializer'
    },
    post: {
      class: Post
    },
    comment: {
      class: Comment
    }
  }
}

```

In this case, a named serializer, `mySerializer`, is defined and the type configuration uses the name rather than an inline definition.

In more detail, the `serializer` configuration property of a type expects a provider. If a configuration property that expects a provider is specified to be a string, a named provider is expected to exist with that name. Otherwise, it is expected to be a provider definition. All three of the following configurations are equivalent:

```javascript
{
  types: {
    post: {
      class: Post,
      serializer: { // inline provider definition
        class: MyModelSerializer
      }
    }
  }
}
```

```javascript
{
  types: {
    post: {
      class: Post,
      serializer: MyModelSerializer // inline provider definition shorthand
    }
  }
}
```

```javascript
{
  serializers: {
    mySerializer: {
      class: MyModelSerializer
    }
  },
  types: {
    post: {
      class: Post,
      serializer: 'mySerializer' // named provider
    }
  }
}
```

If a type does not have any custom configuration, you can simplify things by using the provider definition shorthand there as well:

```javascript
types: {
  // provider definition shorthands
  post: Post,
  comment: Comment
}
```

## Field-Level Configuration

Outside of the context, field configurations (attributes and relationships) are frequently configured on the model classes themselves:

```javascript
class Post extends Model {};
Post.defineSchema({
  typeKey: 'post',
  attributes: {
    title: {type: 'string'}
  }
});
```

In fact, the `defineSchema` method is equivalent to defining configuration on the type in the context:

```javascript
{
  types: {
    post: {
      class: Post,
      typeKey: 'post',
      attributes: {
        title: {type: 'string'}
      }
    }
  }
}
```

## Kinds of Providers

Most things that one would expect to be configurable are providers in Coalesce. The following classes correspond to providers:

* `Model`
* `Adapter`
* `Session`
* `Serializer`
* `ModelCache`
* `QueryCache`
* `MergeStrategy`
