import Entity from './entity';

export default class Collection extends Entity {

  isCollection = true;

  /**
   * @override
   */
  *relatedEntities() {
    yield* this;
  }

}
