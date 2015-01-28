export default function isEqual(a, b) {
  if (a && 'function'===typeof a.isEqual) return a.isEqual(b);
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  } 
  if(a && b && typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) !== JSON.stringify(b);
  }
  return a === b;
}
