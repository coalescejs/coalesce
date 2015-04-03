`import Container from 'coalesce/container'`
`import ActiveModelAdapter from 'coalesce/active_model/active_model_adapter'`
`import TestActiveRecordAdapter from './_test_adapter'`
setup = ->
  @App = {}
  @container = new Container()

  # TestAdapter already is a subclass
  @RestAdapter = TestActiveRecordAdapter.extend()

  @container.register 'adapter:main', @RestAdapter

  @adapter = @container.lookup('adapter:main')

  @session = @adapter.newSession()

  @container = @adapter.container

  Coalesce.__container__ = @container

`export default setup`
