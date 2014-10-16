# Caching

Caching data is a core piece of the functionality of Coalesce. By default, both models and queries are cached:

```javascript
var postPromise = session.load(Post, 1);
// later in the application
session.load(Post, 1); // will return the same promise as above
```

```javascript
var postsPromise = session.query(Post);
// later in the application
session.query(Post); // will return the same promise as above

session.query(Post, {title: null}); // this *will* return a different promise since queries are keyed on parameters
```

This drastically reduces unnecessary trips to the server. A practical ramification of this, however, is that stale data can be encountered.

## Skipping the Cache

To avoid the cache, use the `refresh` and `refreshQuery` methods. These methods will ensure that the server is hit:

```javascript
var postPromise = session.load(Post, 1);
postPromise.then(function(post) {
  session.refresh(post); // can also be done via `post.refresh()`
});
```

```javascript
var postsPromise = session.query(Post);
postsPromise.then(function(posts) {
  session.refreshQuery(posts); // can also be done via `posts.refresh()`
});
```

## Avoiding the Server

In some cases, it is desirable to synchronously return cached data, skipping the server entirely. To accomplish this, use the `fetch` and `fetchQuery` methods:

```javascript
var postPromise = session.load(Post, 1);
session.fetch(Post, 1); // returns the a Post instance immediately
```

The caveat here is that it is possible that the cache will not contain any data. In this case, a `Post` instance will still be returned with its identifiers set, but all of its fields will be *unloaded*. Coalesce supports fully and partially unloaded models. Once data does make it down from the server, this instance will be mutated to contain the data.

Similarly for queries:

```javascript
var posts = session.query(Post);
session.fetchQuery(posts); // returns a Query instance immediately
```

## Invalidating the Cache

It is also possible to invalidate the cache so that future calls to `load` and `query` will miss the cache:

```javascript
session.invalidate(post); // or post.invalidate()
```

```javascript
session.invalidateQuery(posts); // or posts.invalidate()
```

As a convenience, you can also invalidate all queries corresponding to a type:

```javascript
session.invalidateQueries(Post);
```

## Updating Queries

When new models are created/updated on the client, it can be desired to have these changes be reflected in any cached queries. At this time, Coalesce does *not* automatically update queries.

There are currently two options:

1. Have the application invalidate any queries known to be affected by an action.
2. Manually perform the mutations on the query using normal Array methods.

## Future Roadmap

These are features that are planned/in development:

1. Allow the application to specify custom cache implementations.
2. Supply some default cache implementations with additional caching strategies such as TTL and size.
3. Support client-side only querying and explore *live-updating* queries that automatically respond to client-side changes.
