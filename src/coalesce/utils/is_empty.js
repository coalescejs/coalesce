import isNone from './is_none';

export default function isEmpty(obj) {
  return isNone(obj) || (obj.length === 0 && typeof obj !== 'function') || (typeof obj === 'object' && obj.size === 0);
}
