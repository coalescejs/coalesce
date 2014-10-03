# Offline Usage

The architecture of Coalesce.js allows for offline usage. Applications which want to take advantage of this feature, however, must be explicitly aware of when the application is offline.

The `session` object is the primary client-side store of data.

In the online case, when models are mutated, calling `session.flush()` sends all of the local changes down to the server.

```javascript
// online scenario
var user = session.create('user', {name: "Wes"});

// attempt to send the local changes down to the server
session.flush().then(function() {
  // the remote server will have the changes here
});
```

In the offline case, calling `session.flush()` will fail and the local changes will remain dirty in the session:


```javascript
// offline scenario
var user = session.create('user', {name: "Wes"});

// attempt to send the local changes down to the server
session.flush().then(function() {
  // this will not be hit
}, function() {
  // remote server will not have the data, check here if the error is related to being offline and show appropriate ui
});
```

It is the responsibility of the application to detect when the system is back online and to call `session.flush()` again to persist the changes.

## Current Considerations

1. **Persisting** - Data needs to be preserved if the browser window is closed. This data also needs to be reloaded when the page is accessed again.
1. **Querying** - currently, only the loading of individual models is cached at the session level. In order to support applications which spend a non-trivial amount of time offline, query caching (and live-updating) should be supported.
1. **Preloading** - In a predictably offline scenario, there should be a mechanism to preload a corpus of data for the user to interact with. This could be treated as an application-level concern. The application (or a custom adapter) could make an initial request to populate the session. A socket or polling mechanism could also be used to continually bring in new data. This should be supported today.
1. **Data Size** - Depending on the scenario, it might be desirable to not keep all data in memory. Technologies such as WebSQL and IndexDB could be used to accomplish this. However, it seems that the default limits for these technologies could be [prohibitive](http://stackoverflow.com/questions/10988569/what-are-the-storage-limits-for-the-indexed-db-on-googles-chrome-browser).


## Development Roadmap

### Session Serialization

This is part of the solution for #1 above. Much like models and other objects, sessions should be serializable. This would involve creating a session serializer and a session JSON format. This could be very much like the `payload` object that is serialized today in the rest adapter.

### Session Durability/Initialization

To take advantage of session serialization/deserialization, there needs to be both a mechanism to use Coalesce.js with an existing session as well as to persist the current session for future use.

Currently, Coalesce.js uses container.js (extracted from Ember.js) for dependency injection and configuration. The main session is constructed via the containter. This creates an issue– namely, that the container is responsible for constructing the session and there is no obvious way to register an existing session:

```javascript
var session = sessionSerializer.deserialize(json); // assuming a session serializer existed

container.register('sesssion:application', session); // this currently won't work because `register` expects a class not an instance.
```

In the future, Coalesce.js will have a different configuration API (maybe based on [di.js](https://github.com/angular/di.js/)), but in the short term, a mechanism needs to be developed to allow for an existing session to be registered on the container. In the case of Coalesce-Ember, a natural place for this to be added to the container will be in an initializer.

Storing and retrieving the session into/from local storage can either be provided as a Coalesce.js API or just left up to the developer. Projects like [localForage](https://github.com/angular/di.js/) might come in handy here.

### Session Indexing and Querying

Today, session-level data is stored very simply in `Set`-like collections. Model instances are stored in the following collections:

* **models** - stores all models
* **shadows** - stores last known version from the server. As an optimization, this is only updated when a model becomes dirty on the client. A model is considered dirty if it has an entry in this collection (or the `newModels` collection)
* **originals** - after a flush, the client eagerly updates the `shadows` collection. This keeps a copy of the original shadow for merging in the event that the `flush()` call fails.
* **newModels** - similar to `shadows`, but is semantically different since there is no corresponding model on the server (since it was newly created on the client).

Because of this simplistic storage scheme, only `session.load` takes advantage of cached data– skipping a trip to the server and instead just returning the already loaded model. The goal is to allow `session.query` to take advantage of local data as well.

The solution here will be to introduce two new session-level concepts: a single model `Store` and a variable number of model `Index` objects. Internally, these objects will utilize technologies such as WebSQL or IndexDB. These objects will not replace the existing collections, but will supplement them and allow `models` to become a [*weak*[(https://code.google.com/p/es-lab/source/browse/trunk/src/ses/WeakMap.js)] collection.
