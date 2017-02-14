import findIndex from 'lodash/findIndex';
import clone from 'lodash/clone';
import find from 'lodash/find';

/**
 * Immutable structure reflecting a chain of middleware.
 */
export default class MiddlewareChain {

  constructor(configs) {
    this.configs = configs.map(this.normalizeConfig);
  }

  use(middleware, ...args) {
    let newConfigs = clone(this.configs);
    let existingIndex = findIndex(newConfigs, ([klass, ...args]) => klass === middleware);
    if(existingIndex !== -1) {
      newConfigs.splice(existingIndex, 1, [middleware, ...args]);
    } else {
      newConfigs.push([middleware, ...args]);
    }
    return new this.constructor(newConfigs);
  }

  replace(existingMiddleware, middleware, ...args) {
    let newConfigs = clone(this.configs);
    let existingIndex = findIndex(newConfigs, ([klass, ...args]) => klass === existingMiddleware);
    newConfigs.splice(existingIndex, 1, [middleware, ...args]);
    return new this.constructor(newConfigs);
  }

  insertBefore(existingMiddleware, middleware, ...args) {
    let newConfigs = clone(this.configs);
    let existingIndex = findIndex(newConfigs, ([klass, ...args]) => klass === existingMiddleware);
    newConfigs.splice(existingIndex, 0, [middleware, ...args]);
    return new this.constructor(newConfigs);
  }

  insertAfter(existingMiddleware, middleware, ...args) {
    let newConfigs = clone(this.configs);
    let existingIndex = findIndex(newConfigs, ([klass, ...args]) => klass === existingMiddleware);
    newConfigs.splice(existingIndex+1, 0, [middleware, ...args]);
    return new this.constructor(newConfigs);
  }

  detect(middleware) {
    return find(this.configs, ([klass, ...args]) => klass === middleware);
  }

  normalizeConfig(config) {
    if(Array.isArray(config)) {
      return config;
    } else {
      return [config];
    }
  }

  instantiate(container) {
    return this.configs.map(([klass, ...args]) => {
      return container.get(klass, ...args);
    });
  }

}
