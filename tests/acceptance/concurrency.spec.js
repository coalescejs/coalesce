import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, {Post, Comment, User} from '../support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';

describe('acceptance/concurrent operations', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });

  beforeEach(function() {
    fetchMock.restore();
  });

  it('create followed by immediate update', async function() {

    let {session} = this;

    fetchMock.post('/users', new Promise(res => setTimeout(res, 200)).then(() => {
      fetchMock.put('/users/1', JSON.stringify({
        type: 'user',
        id: 1,
        rev: 2,
        name: 'Brogrammer2'
      }));

      return JSON.stringify({
        type: 'user',
        id: 1,
        rev: 1,
        name: 'Brogrammer'
      });
    }));

    let user = session.create(User, {name: 'Brogrammer'});

    session.flush();

    user.name = 'Brogrammer2';

    await session.flush();

    expect(user.id).to.eq('1');
    expect(user.name).to.eq('Brogrammer2');

  });

});
