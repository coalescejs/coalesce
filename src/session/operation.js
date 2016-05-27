/**
 * A "node" within a plan that can depend on other operations.
 */
export default class Operation {

  constructor(adapter, entity, shadow, opts, session) {
    this.adapter = adapter;
    this.entity = entity;
    this.shadow = shadow;
    this.session = session;
    this.opts = opts;
    this._deps = new Set();
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  addDependency(op) {
    this._deps.add(op);
  }

  /**
   * Execute this operation.
   * TODO: error handling
   *
   * @return {type}  description
   */
  execute() {
    this._depsPromise().then((res) => {
      this._execute().then((res) => {
        this._resolve(res);
      });
    });
    return this._promise;
  }

  /**
   * @private
   */
  _execute() {
    const {adapter, entity, shadow, opts, session} = this;
    return adapter.persist(entity, shadow, opts, session);
  }

  /**
   * @private
   *
   * The promise of the resolution of all dependencies.
   */
  get _depsPromise() {
    return Promise.all(Array.from(this.deps.values()).map(function(dep) {
      return dep._promise;
    }));
  }


  /**
   * @override
   */
  toString() {
    let deps = Array.from(this._deps.values()),
        depString = "";
    if(deps.length > 0) {
      depString = ` depends on ${deps.map((d) => d.entity.toString()).join(', ')}`;
    }
    return `${this.entity.toString()}${depString}`;
  }

}
