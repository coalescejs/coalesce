import Operation from './operation';
import Graph from '../graph';
import Container from '../container';

/**
 * A plan represents a plan of action for persisting a collection of models.
 */
export default class Plan {

  static dependencies = [Container];

  constructor(container, session, iterable) {
    this.container = container;
    this.session = session;
    this.operations = new Map();
    this.entities = container.get(Graph);
    this.shadows = container.get(Graph);
    if(iterable) {
      for(var entity of iterable) {
        this.add(entity);
      }
    }
  }

  /**
   * Add an entity to this plan.
   *
   * @param  {Entity}    entity the entity to add
   * @return {Operation} the operation for this entity
   */
  add(entity, opts={}) {
    console.assert(entity.session === this.session, "Entity is not part of the same session as the plan");
    let op = this.operations.get(entity);
    if(op) {
      return op;
    }

    let type;
    if(entity.isCollection) {
      type = entity.type;
    } else {
      type = entity.constructor;
    }

    const adapter = this.container.adapterFor(type),
          shadow = this.session.shadows.get(entity),
          session = this.session;

    // Snapshot the entity and the shadow since the execution of the operations
    // will be asynchronous and we want to persist the state of the graph when
    // the plan was created (as oppposed to including future modifications).
    let copiedEntity = this.entities.update(entity),
        copiedShadow = shadow && this.shadows.update(shadow);

    op = new Operation(adapter, copiedEntity, copiedShadow, opts, session);
    // NOTE: important to add the operation here to break recursion
    this.operations.set(copiedEntity, op);

    // provide the adapter the opportunity to add dependencies
    adapter.plan(entity, shadow, this);

    return op;
  }

  /**
   * Indicate that the entity is dependent on another entity.
   *
   * @param  {Entity} entity     description
   * @param  {Entity} dependency description
   */
  addDependency(entity, dependency) {
    this.add(entity).addDependency(this.add(dependency));
  }

  /**
   * Execute the plan.
   *
   * @return {Promise}  promise resolving to the set of all affected entities.
   */
  execute() {
    return Promise.all(Array.from(this.operations.values()).map((op) => {
      return op.execute();
    }));
  }

  /**
   * @override
   */
  toString() {
    let res = "Plan:";
    for(let op of this.operations.values()) {
      res += `\n${op.toString()}`;
    }
    return res;
  }

}
