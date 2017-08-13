import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, { Post, Comment, User } from '../support/simple-hierarchy';
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
    let { session } = this;
    let parentSession = session;

    //
    // Loading
    //
    fetchMock.once(
      '/users/1',
      JSON.stringify({
        type: 'user',
        id: 1,
        rev: 1,
        name: 'Brogrammer'
      })
    );

    let currentUser = await session.find(User, 1);
    expect(currentUser.name).to.eq('Brogrammer');

    fetchMock.once(
      '/posts?user=1',
      JSON.stringify([
        {
          type: 'post',
          id: 1,
          rev: 1,
          title: 'Post A',
          user: 1
        },
        {
          type: 'post',
          id: 2,
          rev: 1,
          title: 'Post B',
          user: 1
        }
      ])
    );

    let posts = await currentUser.posts.load();
    let postsArray = Array.from(posts);
    expect(postsArray.length).to.eq(2);
    expect(postsArray[0].title).to.eq('Post A');

    session = parentSession.child();

    //
    // Creating
    //
    let newPost = session.create(Post, { title: 'New Post', user: currentUser });
    let newComment = session.create(Comment, { body: 'Looks new.', user: currentUser, post: newPost });

    fetchMock.post(
      '/posts',
      JSON.stringify({
        type: 'post',
        id: 3,
        rev: 1,
        title: 'New Post',
        user: 1
      })
    );
    fetchMock.post(
      '/comments',
      JSON.stringify({
        type: 'comment',
        id: 4,
        rev: 1,
        body: 'Looks new.',
        user: 1,
        post: 3
      })
    );

    await session.flush();
    expect(newPost.id).to.eq('3');
    expect(newPost.user.name).to.eq('Brogrammer');
    expect(newComment.id).to.eq('4');
    expect(newComment.post).to.eq(newPost);
    let parentNewPost = parentSession.get(newPost);
    expect(parentNewPost).to.not.eq(newPost);
    expect(parentNewPost.id).to.eq(newPost.id);

    //
    // Updating
    //
    session = parentSession.child();
    let user2 = session.fetchBy(User, { id: 7 });
    newPost = session.get(newPost);

    newPost.title = 'Updated Title';
    newPost.user = user2;
    let promise = session.flush();

    expect(parentSession.get(newPost).title).to.eq('New Post');

    fetchMock.put('/posts/3', (url, { body }) => {
      body = JSON.parse(body);
      expect(body.title).to.eq('Updated Title');
      expect(body.user).to.eq(7);
      return JSON.stringify({
        type: 'post',
        id: 3,
        rev: 2,
        title: 'Updated Title',
        user: 7
      });
    });
    await promise;

    expect(newPost.title).to.eq('Updated Title');
    expect(newPost.user).to.eq(user2);
    expect(parentSession.get(newPost).title).to.eq('Updated Title');

    //
    // Destroying
    //
    session = parentSession.child();

    let comment = session.getBy(Comment, { id: 4 });
    session.destroy(comment);

    expect(comment.isDeleted).to.be.true;
    expect(parentSession.get(comment).isDeleted).to.be.false;
    fetchMock.delete('/comments/4', JSON.stringify({}));

    await session.flush();

    expect(parentSession.get(comment).isDeleted).to.be.true;
  });

  it('loads and refreshes existing hierarchy', async function() {
    let { session } = this;

    fetchMock.once(
      '/users/1',
      JSON.stringify({
        type: 'user',
        id: 1,
        rev: 1,
        name: 'Brogrammer',
        posts: [2, 3]
      })
    );

    let user = session.fetchBy(User, { id: 1 });
    let posts = user.posts;
    expect(posts.size).to.eq(0);

    await session.load(user);
    let postIds = Array.from(posts).map(p => p.id);
    expect(postIds).to.eql(['2', '3']);
  });

  it('merges edits cleanly', async function() {
    fetchMock.once(
      '/posts/1',
      JSON.stringify({
        type: 'post',
        id: 1,
        rev: 1,
        title: 'Rough Draft',
        content: 'This needs some improvement',
        user: 2,
        comments: [3, 4]
      })
    );

    fetchMock.once(
      '/comments/3',
      JSON.stringify({
        type: 'comment',
        id: 3,
        rev: 3,
        body: 'First',
        user: 2,
        post: 1
      })
    );

    fetchMock.once(
      '/comments/4',
      JSON.stringify({
        type: 'comment',
        id: 4,
        rev: 3,
        body: 'Second',
        user: 2,
        post: 1
      })
    );

    let { session } = this;
    let parentSession = session;

    let post = await session.find(Post, 1);
    let comment1 = await post.comments.get(0).load();
    let comment2 = await post.comments.get(1).load();

    session = parentSession.child();
    post = session.fetch(post);

    post.comments.push(session.create(Comment, { body: 'Third' }));
    post.title = 'Rough Draft 2';

    fetchMock.once(
      '/posts/1',
      JSON.stringify({
        type: 'post',
        id: 1,
        rev: 2,
        title: 'Rough Draft',
        content: 'This is some different content',
        user: 2,
        comments: [3, 4, 5]
      })
    );

    await post.refresh();
    session.merge(parentSession.get(post.comments));

    expect(post.title).to.eq('Rough Draft 2');
    expect(post.content).to.eq('This is some different content');
    expect(post.comments.size).to.eq(4);
    expect(post.isDirty).to.be.true;
  });
});
