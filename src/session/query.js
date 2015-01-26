import ModelArray from '../collections/model_array';  

/**
  TODO: Query refactor:
  
  1) hasMany's that are not owned should now be queries
      a. come up with way to specify custom hasMany types
  2) store "shadow" queries when queries are modified (a la models)
  3) store `rev` of each model in the query when added
  4) query merging:
      a. for each operation in the diff:
          i. use server's version if model in session has newer rev
          ii. use client's version if model in session has same rev
      
*/
export default class Query extends ModelArray {
  
  constructor(session, type, params) {
    this.session = session;
    this._type = type;
    this._params = params;
    this._hints = {};
    super();
  }
  
  get params() {
    return this._params;
  }
  
  get type() {
    return this._type;
  }
  
  load(opts) {
    return this.session.loadQuery(this, opts);
  }
  
  invalidate() {
    return this.session.invalidateQuery(this);
  }
  
  refresh(opts) {
    defaults(opts, {skipCache: true});
    return this.load(opts);
  }
  
  populate(models) {
    this.meta = models.meta;
    this.replace(0, this.length, models);
    return this;
  }
  
  get key() {
    return this.constructor.key(this.type, this.params);
  }
  
  static key(type, params) {
    return type.typeKey + '$' + JSON.stringify(params);
  }
  
}
