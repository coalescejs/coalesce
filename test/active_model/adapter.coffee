`import ActiveModelAdapter from 'coalesce/active_model/adapter'`

describe "ActiveModelAdapter", ->

  describe '.pathForType', ->

    it 'underscores and pluralizes', ->
      adapter = new ActiveModelAdapter({})
      expect(adapter.pathForType('message_thread')).to.eq('message_threads')
