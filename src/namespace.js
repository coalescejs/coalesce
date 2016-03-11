/**
  @module coalesce
*/

/**
  @class Coalesce
  @static
*/

//
// Required global libraries
//

var global = (this || window);

var ajax = global.jQuery && global.jQuery.ajax,
    Backburner = global.Backburner;

var Coalesce = {
  VERSION: 'VERSION_STRING_PLACEHOLDER',
  Promise: Promise,
  ajax: ajax
};

if(Backburner) {
  Coalesce.backburner = new Backburner(['actions']);
}

export default Coalesce;
