import Backburner from 'backburner';
Backburner = Backburner.Backburner;

/**
  @module coalesce
*/

/**
  @class Coalesce
  @static
*/

var Coalesce = {
  VERSION: 'VERSION_STRING_PLACEHOLDER',
  Promise: Promise,
  ajax: jQuery.ajax,
  run: new Backburner(['actions'])
}

export default Coalesce;
