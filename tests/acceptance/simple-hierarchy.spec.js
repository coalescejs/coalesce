import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, {Post, Comment, User} from '../support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('acceptance/simple hierarchy of models', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });

  beforeEach(function() {
    fetchMock.restore();
  });

  it('loads, creates, updates, and deletes', async function() {
    let {session} = this;

    fetchMock.mock('/users/1', 'GET', JSON.stringify({
      type: 'user',
      id: 1,
      name: 'Brogrammer'
    }));

    let currentUser = await session.find(User, 1);
    expect(currentUser.name).to.eq('Brogrammer');

    fetchMock.mock('/posts?user_id=1', 'GET', JSON.stringify([{
      type: 'post',
      id: 1,
      rev: 1,
      title: 'Post A',
      user_id: 1
    }, {
      type: 'post',
      id: 1,
      rev: 1,
      title: 'Post B',
      user_id: 1
    }]));

    let posts = await currentUser.posts.load();
    expect(Array.from(posts).length).to.eq(2);

  });

});
