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
    let parentSession = session;

    fetchMock.mock('/users/1', 'GET', JSON.stringify({
      type: 'user',
      id: 1,
      rev: 1,
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
      id: 2,
      rev: 1,
      title: 'Post B',
      user_id: 1
    }]));

    let posts = await currentUser.posts.load();
    let postsArray = Array.from(posts);
    expect(postsArray.length).to.eq(2);
    expect(postsArray[0].title).to.eq('Post A');

    session = parentSession.child();

    let newPost = session.create(Post, {title: 'New Post', user: currentUser});
    fetchMock.mock('/posts', 'POST', JSON.stringify({
      type: 'post',
      id: 3,
      rev: 1,
      title: 'New Post',
      user_id: 1
    }));
    await session.flush();
    expect(newPost.id).to.eq("3");
    expect(newPost.user.name).to.eq('Brogrammer');

  });

});
