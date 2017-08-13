import isEqual from './is-equal';

/**
 * Computes the differences between two models.
 *
 * @return {iterator}  the differences
 */
export default function* diff(lhs, rhs) {
  console.assert(lhs && lhs.isModel, 'Must have a left hand side');
  console.assert(!rhs || rhs.isModel, 'Can only diff models');
  console.assert(!rhs || lhs.schema === rhs.schema, 'Schemas do not match');

  let schema = lhs.schema;

  for (let field of schema.dataFields()) {
    if (field.kind === 'meta') {
      continue;
    }

    let left = lhs[field.name],
      right = rhs && rhs[field.name];

    if (!isEqual(left, right)) {
      yield {
        lhs: left,
        rhs: right,
        field: field
      };
    }
  }
}
