/**
  @module coalesce
*/

/**
  @class Coalesce
  @static
*/

var Coalesce = {
  VERSION: 'VERSION_STRING_PLACEHOLDER'
}

Coalesce.Promise = Promise;
Coalesce.ajax = jQuery.ajax;
Coalesce.run = Ember.run;

export default Coalesce;
