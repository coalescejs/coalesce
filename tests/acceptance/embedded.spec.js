import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, {Group, Member, User} from '../support/groups-members';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('acceptance/groups with embedded members', function() {

  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });

  beforeEach(function() {
    fetchMock.restore();
  });

  it('creating a new group and deleting a member', async function() {
    let {session} = this;
    let parentSession = session;

    session = parentSession.child();

    let user = session.create('user', {name: 'wes'});

    fetchMock.post('/users', JSON.stringify({
      type: 'user',
      id: 1,
      clientId: user.clientId,
      rev: 1,
      name: 'wes'
    }));

    await session.flush();

    expect(user.id).to.not.be.null
    expect(fetchMock.called('/users')).to.be.true

    session = parentSession.child();

    let group = session.create('group', {name: 'brogrammers', user: user});
    user.groups.push(group);

    let member = session.create('member', {role: 'chief', user: user, group: group});
    group.members.push(member);
    user.members.push(member);

    let member2 = session.create('member', {role: 'servant', user: user, group: group});
    group.members.push(member2);
    user.members.push(member2);

    fetchMock.post('/groups', (url, {body}) => {
      return {
        type: 'group',
        client_id: group.clientId,
        id: 2,
        name: "brogrammers",
        members: [{
          client_id: member.clientId,
          id: 3,
          type: 'member',
          role: "chief",
          group: 2,
          user: 1
        }, {
          client_id: member2.clientId,
          id: 4,
          type: 'member',
          role: "servant",
          group: 2,
          user: 1
        }],
        user: 1
      };
    });

    await session.flush();

    expect(fetchMock.called('/groups')).to.be.true
    expect(group.members.size).to.eq(2);
    expect(member.id).to.eq('3');
    expect(member2.id).to.eq('4');

    session = parentSession.child();

    group = session.get(group);
    member = group.members.get(0);

    session.destroy(member);

    fetchMock.put('/groups/2', (url, {body}) => {
      return {
        type: 'group',
        client_id: group.clientId,
        id: 2,
        name: "brogrammers",
        members: [{
          client_id: member2.clientId,
          id: 4,
          type: 'member',
          role: "servant",
          group: 2,
          user: 1
        }],
        user: 1
      };
    });

    await session.flush();

    expect(group.members.size).to.eq(1);
  });

  it('deleting a group with members', async function() {

    let {session} = this;
    let parentSession = session;

    fetchMock.get('/groups/1', JSON.stringify({
      type: 'group',
      id: 1,
      name: "brogrammers",
      members: [{
        id: 4,
        type: 'member',
        role: "servant",
        group: 1,
        user: 1
      }],
      user: 1
    }));

    let group = await session.load('group', 1);
    expect(group.members.length).to.eq(1);
    expect(group.members.get(0).role).to.eq("servant");

    session = parentSession.child();

    group = session.get(group);
    let member = group.members.get(0);

    fetchMock.delete('/groups/1', JSON.stringify({}));

    session.destroy(group);

    expect(group.isDeleted).to.be.true;
    expect(member.isDeleted).to.be.true;

    await session.flush();

    expect(group.isDeleted).to.be.true;
    expect(member.isDeleted).to.be.true;
  });

});
