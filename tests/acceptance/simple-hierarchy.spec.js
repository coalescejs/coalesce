import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, {Post, Comment, User} from '../support/simple-hierarchy';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';

describe('acceptance/simple hierarchy of models', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });

  beforeEach(function() {
    fetchMock.restore();
  });

  it('loads, creates, updates, and destroys', async function() {
    let {session} = this;
    let parentSession = session;

    //
    // Loading
    //
    fetchMock.get('/users/1', JSON.stringify({
      type: 'user',
      id: 1,
      rev: 1,
      name: 'Brogrammer'
    }));

    let currentUser = await session.find(User, 1);
    expect(currentUser.name).to.eq('Brogrammer');

    fetchMock.get('/posts?user=1', JSON.stringify([{
      type: 'post',
      id: 1,
      rev: 1,
      title: 'Post A',
      user: 1
    }, {
      type: 'post',
      id: 2,
      rev: 1,
      title: 'Post B',
      user: 1
    }]));

    let posts = await currentUser.posts.load();
    let postsArray = Array.from(posts);
    expect(postsArray.length).to.eq(2);
    expect(postsArray[0].title).to.eq('Post A');

    session = parentSession.child();

    //
    // Creating
    //
    let newPost = session.create(Post, {title: 'New Post', user: currentUser});
    let newComment = session.create(Comment, {body: 'Looks new.', user: currentUser, post: newPost});

    fetchMock.post('/posts', JSON.stringify({
      type: 'post',
      id: 3,
      rev: 1,
      title: 'New Post',
      user: 1
    }));
    fetchMock.post('/comments', JSON.stringify({
      type: 'comment',
      id: 4,
      rev: 1,
      body: 'Looks new.',
      user: 1,
      post: 3
    }));

    await session.flush();
    expect(newPost.id).to.eq("3");
    expect(newPost.user.name).to.eq('Brogrammer');
    expect(newComment.id).to.eq("4");
    expect(newComment.post).to.eq(newPost);
    let parentNewPost = parentSession.get(newPost)
    expect(parentNewPost).to.not.eq(newPost);
    expect(parentNewPost.id).to.eq(newPost.id);

    //
    // Updating
    //
    session = parentSession.child();
    newPost = session.get(newPost);

    newPost.title = "Updated Title";
    let promise = session.flush();

    expect(parentSession.get(newPost).title).to.eq('New Post');

    fetchMock.put('/posts/3', (url, {body}) => {
      expect(body).to.not.be.undefined
      return JSON.stringify({
        type: 'post',
        id: 3,
        rev: 2,
        title: 'Updated Title',
        user: 1
      });
    });
    await promise;

    expect(newPost.title).to.eq('Updated Title');
    expect(parentSession.get(newPost).title).to.eq('Updated Title');

    //
    // Destroying
    //
    session = parentSession.child();

    let comment = session.getBy(Comment, {id: 4});
    session.destroy(comment);

    expect(comment.isDeleted).to.be.true
    expect(parentSession.get(comment).isDeleted).to.be.false
    fetchMock.delete('/comments/4', JSON.stringify({}));

    await session.flush();

    expect(parentSession.get(comment).isDeleted).to.be.true;
  });

  it('loads and refreshes existing hierarchy', async function() {
    let {session} = this;

    fetchMock.get('/users/1', JSON.stringify({
      type: 'user',
      id: 1,
      rev: 1,
      name: 'Brogrammer',
      posts: [2, 3]
    }));

    let user = session.fetchBy(User, {id: 1});
    let posts = user.posts;
    expect(posts.size).to.eq(0);

    await session.load(user);
    let postIds = Array.from(posts).map((p) => p.id);
    expect(postIds).to.eql(['2', '3']);
  });

});
