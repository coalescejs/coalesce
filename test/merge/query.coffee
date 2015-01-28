`import QueryMerge from 'coalesce/merge/query'`
`import Query from 'coalesce/entities/query'`
`import Context from 'coalesce/context/default'`

q = ->
  query = new Query()
  for arg in arguments
    query.push(clientId: arg)
  query

describe 'QueryMerge', ->
  
  lazy 'session', ->
    s = {}
    s.merge = (e) -> e
    s
  
  describe '.merge', ->
    
    lazy 'ours', -> q()
    lazy 'ancestor', -> q()
    lazy 'theirs', -> q()
    
    subject -> new QueryMerge().merge(@ours, @ancestor, @theirs, @session)

    context 'when new element added in theirs', ->
      
      lazy 'theirs', -> q('a')
      
      it 'adds', ->
        
        expect(@subject.toArray()).to.eql([clientId: 'a'])
        
    context 'when new element added in both', ->
      
      lazy 'theirs', -> q('a')
      lazy 'ours', -> q('b')
      
      it 'adds', ->
        
        expect(@subject.toArray()).to.eql([{clientId: 'a'}, {clientId: 'b'}])


    context 'when element removed in theirs', ->
      
      lazy 'ours', -> q('a')
      lazy 'ancestor', -> q('a')
      lazy 'theirs', -> q()
      
      it 'removes', ->
        
        expect(@subject.toArray()).to.eql([])
        
    
    context 'when element added in ours and removed in theirs', ->
      
      lazy 'ours', -> q('a', 'b')
      lazy 'ancestor', -> q('a')
      lazy 'theirs', -> q()
      
      it 'removes', ->
        expect(@subject.toArray()).to.eql([{clientId: 'b'}])
