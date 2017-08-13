import { expect } from 'chai';

import fetchMock from 'fetch-mock';

import Container, { User, Tag, Prospect, Profile, Permission, Stage, Account } from '../support/prospect-tags';
import Model from 'coalesce/model';
import Adapter from 'coalesce/adapter';
import Session from 'coalesce/session';
import Graph from 'coalesce/graph';
import Query from 'coalesce/query';

describe('acceptance/performance', function() {
  lazy('container', () => new Container());
  lazy('session', function() {
    return this.container.get(Session);
  });

  beforeEach(function() {
    fetchMock.restore();
  });

  it('loads lots of data', async function() {
    this.timeout(1000 * 60);

    for (let i = 1; i <= 1000; i++) {
      let attrs = {};
      for (let j = 0; j < 100; j++) {
        attrs[i] = `string${j}`;
      }

      let tags = [];
      for (let k = 0; k < 10; k++) {
        tags.push({
          name: `tag${k}`,
          prospect: i
        });
      }

      fetchMock.once(
        `/prospects/${i}`,
        JSON.stringify({
          id: i,
          account: i,
          stage: 1,
          rev: 2,
          name: `Prospect${i}`,
          user: i,
          tags,
          ...attrs
        })
      );

      let prospect = await this.session.find(Prospect, i);

      fetchMock.once(
        `/users/${i}`,
        JSON.stringify({
          id: i,
          rev: 2,
          name: `User${i}`,
          profile: 2
        })
      );

      await prospect.user.load();
    }
  });
});
