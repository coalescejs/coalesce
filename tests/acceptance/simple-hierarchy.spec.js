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

  it('loads, creates, updates, and destroys', async function() {
    let {session} = this;
    let parentSession = session;

    //
    // Loading
    //
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

    //
    // Creating
    //
    let newPost = session.create(Post, {title: 'New Post', user: currentUser});
    let newComment = session.create(Comment, {body: 'Looks new.', user: currentUser, post: newPost});

    fetchMock.mock('/posts', 'POST', JSON.stringify({
      type: 'post',
      id: 3,
      rev: 1,
      title: 'New Post',
      user_id: 1
    }));
    fetchMock.mock('/comments', 'POST', JSON.stringify({
      type: 'comment',
      id: 4,
      rev: 1,
      body: 'Looks new.',
      user_id: 1,
      post_id: 3
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

    fetchMock.mock('/posts/3', 'PUT', JSON.stringify({
      type: 'post',
      id: 3,
      rev: 2,
      title: 'Updated Title',
      user_id: 1
    }));
    await promise;

    expect(newPost.title).to.eq('Updated Title');
    expect(parentSession.get(newPost).title).to.eq('Updated Title');

    //
    // Destroying
    //
    session = parentSession.child();

    let comment = session.getBy(Comment, 4);
    session.destroy(comment);

    expect(comment.isDeleted).to.be.true
    expect(parentSession.get(comment).isDeleted).to.be.false
    fetchMock.mock('/comments/4', 'DELETE', JSON.stringify({}));

    await session.flush();

    expect(parentSession.get(comment).isDeleted).to.be.true;
  });

});
