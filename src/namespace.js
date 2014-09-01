/**
  @module coalesce
*/

/**
  @class Coalesce
  @static
*/

var ajax = this.jQuery && this.jQuery.ajax;

var Backburner = this.Backburner;
if(requireModule && typeof requireModule === 'function') {
  try {
    Backburner = requireModule('backburner').Backburner;
  } catch(e) {}
}

var Coalesce = {
  VERSION: 'VERSION_STRING_PLACEHOLDER',
  Promise: Promise,
  ajax: ajax,
  run: Backburner && new Backburner(['actions'])
}

export default Coalesce;
