import IdManager from '../id-manager';

/**
 * Query params are "normalized" to use clientIds and here we need to transform
 * them back to normal ids.
 */
export default class QueryParamsMiddleware {

  static singleton = true;

  async call(ctx, next) {
    if(ctx.entity && ctx.entity.isQuery) {
      ctx.query = this.serializeParams(ctx.entity);
    }

    return next();
  }

  serializeParams(query) {
    const {schema} = query.type;
    let {type, params} = query;
    params = {...params};

    for(var key in params) {
      let field = schema[key];
      if(field && field.kind === 'belongsTo') {
        let value = params[key];
        if(typeof value === 'string') {
          value = query.graph.fetchBy(query.type, {clientId: value});
          if(value && value.id) {
            params[key] = value.id;
          }
        }
      }
    }

    return params;
  }

}
