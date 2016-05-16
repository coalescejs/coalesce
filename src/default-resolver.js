import Resolver from './resolver';

import BooleanSerializer from './serializers/boolean';
import DateSerializer from './serializers/date';
import IdSerializer from './serializers/id';
import NumberSerializer from './serializers/number';
import RevisionSerializer from './serializers/revision';
import StringSerializer from './serializers/string';

const DEFAULT_SERIALIZERS = {
  boolean: BooleanSerializer,
  date: DateSerializer,
  id: IdSerializer,
  number: NumberSerializer,
  revision: RevisionSerializer,
  string: StringSerializer
};


/**
 * Default resolver which has some sensible implementations for some primitives.
 */
export default class DefaultResolver extends Resolver {

  constructor() {
    super();
    for(var key in DEFAULT_SERIALIZERS) {
      let provider = DEFAULT_SERIALIZERS[key];
      this.registerProvider(key, 'serializer', provider)
    }
  }

}
