// Adapted from: https://github.com/coditect/array-diff

class ArrayDiffElement {
  constructor(item, newIndex, oldIndex) {
    this.item = item;
    this.newIndex = newIndex;
    this.oldIndex = oldIndex;
  }

  get added() {
    return this.oldIndex === undefined;
  }

  get removed() {
    return this.newIndex === undefined;
  }

  get common() {
    return this.oldIndex !== undefined && this.newIndex !== undefined;
  }
}

/**
  Appends an array item to the subsequence of items that were added in the new array.

  @method  added
  @param   item   The array item that was added.
**/
function added(diff, item, newIndex) {
  var element = new ArrayDiffElement(item, newIndex, undefined);
  diff.added.push(element);
  diff.diff.push(element);
}

/**
  Appends an array item to the subsequence of items that were removed from the old array.

  @method  removed
  @param   item     The array item that was added.
**/
function removed(diff, item, oldIndex) {
  var element = new ArrayDiffElement(item, undefined, oldIndex);
  diff.removed.push(element);
  diff.diff.push(element);
}

/**
  Appends an array item to the longest common subsequence between the new and old arrays.

  @method  common
  @param   item    The array item that was added.
**/
function common(diff, item, newIndex, oldIndex) {
  var element = new ArrayDiffElement(item, newIndex, oldIndex);
  diff.common.push(element);
  diff.diff.push(element);
}

/**
  Computes the longest common subsequence between two arrays.

  The LCS algorithm implemented here is based on notes from Professor
  David Eppstein's 1996 lecture:
  http://www.ics.uci.edu/~eppstein/161/960229.html

  @constructor
  @param  {Array}     newArray         The array that will be treated as the current version in the diff.
  @param  {Array}     oldArray         The array that will be treated as the previous version in the diff.
  @param  {Function}  equalityFunction  A function to compare items in the arrays for equality.
**/
function ArrayDiff(newArray, oldArray, equalityFunction) {
  var newLength = newArray.length,
    oldLength = oldArray.length,
    o,
    n = (o = 0),
    table = [],
    equal = typeof equalityFunction === 'function' ? equalityFunction : this.defaultEqualityFunction;

  // Build out the table
  table[newLength] = [];
  for (o = oldLength; o >= 0; table[newLength][o--] = 0){;}
  for (n = newLength - 1; n >= 0; n--) {
    table[n] = [];
    table[n][oldLength] = 0;
    for (o = oldLength - 1; o >= 0; o--) {
      if (equal(newArray[n], oldArray[o])) {
        table[n][o] = table[n + 1][o + 1] + 1;
      } else {
        table[n][o] = Math.max(table[n + 1][o], table[n][o + 1]);
      }
    }
  }

  // Fill in the subsequence arrays
  this.common = [];
  this.added = [];
  this.removed = [];
  this.diff = [];

  n = o = 0;
  while (n < newLength && o < oldLength) {
    if (equal(newArray[n], oldArray[o])) {
      common(this, newArray[n], n, o);
      n++;
      o++;
    } else if (table[n + 1][o] >= table[n][o + 1]) {
      added(this, newArray[n], n);
      n++;
    } else {
      removed(this, oldArray[o], o);
      o++;
    }
  }

  for (; n < newLength; n++) {
    added(this, newArray[n], n);
  }

  for (; o < oldLength; o++) {
    removed(this, oldArray[o], o);
  }
}

/**
  Checks whether or not two items are equal.

  @method  equal
  @param   a          The first item to compare.
  @param   b          The second item to compare.
  @return  {boolean}  True if the items are equal, false if not.
**/
ArrayDiff.prototype.defaultEqualityFunction = function(a, b) {
  return a === b;
};

export { ArrayDiffElement };
export default ArrayDiff;
