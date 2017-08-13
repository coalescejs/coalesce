/**
 * Returns true/false based on whether the lhs is a "superset" of the rhs. For
 * a model, this means that the left hand side has at least all of the right
 * hand side's fields loaded. This *does not* require that the fields have the
 * same values, only that they are loaded.
 *
 * @param  {Entity}  lhs
 * @param  {Entity}  rhs
 * @return {boolean}
 */
export default function isSuperset(lhs, rhs) {
  // there is currently no notion of a partially loaded collection
  if (lhs.isCollection) {
    return true;
  }
  console.assert(lhs.schema === rhs.schema, 'Schemas must be the same.');
  let schema = lhs.schema;
  for (let field of schema) {
    if (typeof lhs[field] !== 'undefined' && typeof rhs[field] === 'undefined') {
      return false;
    }
  }
  return true;
}
