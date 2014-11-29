# Adapters

In a Coalesce application, the adapter is responsible for communicating with the backend and storing configuration options on a default or per-type basis.

The `Adapter` class has various properties that can be overridden by a specific implementation:

* *serializer* - The `Serializer` instance that will be used to serialize/deserialize models that go through this adapter.
* *modelCache* - The `ModelCache` instance that will be consulted by the session when loading models.
* *queryCache* - The `QueryCache` instance that will be consulted by the session when performing queries.
* *mergeStrategy* - The `MergeStrategy` instance that will be used when merging data into the session.
