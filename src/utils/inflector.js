//
// Largely taken from https://github.com/jeremyruppel/underscore.inflection and Ember.js
//

var plurals      = [];
var singulars    = [];
var uncountables = [];


/**
 * `gsub` is a method that is just slightly different than our
 * standard `String#replace`. The main differences are that it
 * matches globally every time, and if no substitution is made
 * it returns `null`. It accepts a string for `word` and
 * `replacement`, and `rule` can be either a string or a regex.
 */
export function gsub(word, rule, replacement) {
  var pattern = new RegExp(rule.source || rule, 'gi');

  return pattern.test(word) ? word.replace(pattern, replacement) : null;
}

/**
 * `plural` creates a new pluralization rule for the inflector.
 * `rule` can be either a string or a regex.
 */
export function plural(rule, replacement) {
  plurals.unshift([rule, replacement]);
}

/**
 * Pluralizes the string passed to it. It also can accept a
 * number as the second parameter. If a number is provided,
 * it will pluralize the word to match the number. Optionally,
 * you can pass `true` as a third parameter. If found, this
 * will include the count with the output.
 */
export function pluralize(word, count, includeNumber) {
  var result;

  if (count !== undefined) {
    count = parseFloat(count);
    result = (count === 1) ? singularize(word) : pluralize(word);
    result = (includeNumber) ? [count, result].join(' ') : result;
  }
  else
  {
    if (_(uncountables).include(word)) {
      return word;
    }

    result = word;

    _(plurals).detect(function(rule) {
      var res = gsub(word, rule[0], rule[1]);

      return res ? (result = res) : false;
    },
    this);
  }

  return result;
}

/**
 * `singular` creates a new singularization rule for the
 * inflector. `rule` can be either a string or a regex.
 */
export function singular(rule, replacement) {
  singulars.unshift([rule, replacement]);
}

/**
 * `singularize` returns the singular version of the plural
 * passed to it.
 */
export function singularize(word) {
  if (_(uncountables).include(word)) {
    return word;
  }

  var result = word;

  _(singulars).detect(function(rule) {
    var res = gsub(word, rule[0], rule[1]);

    return res ? (result = res) : false;
  },
  this);

  return result;
}

/**
 * `irregular` is a shortcut method to create both a
 * pluralization and singularization rule for the word at
 * the same time. You must supply both the singular form
 * and the plural form as explicit strings.
 */
export function irregular(s, p) {
  plural('\\b' + singular + '\\b', p);
  singular('\\b' + plural + '\\b', s);
}

/**
 * `uncountable` creates a new uncountable rule for `word`.
 * Uncountable words do not get pluralized or singularized.
 */
export function uncountable(word) {
  uncountables.unshift(word);
}

/**
 * `ordinalize` adds an ordinal suffix to `number`.
 */
export function ordinalize(number) {
  if (isNaN(number)) {
    return number;
  }

  number = number.toString();
  var lastDigit = number.slice(-1);
  var lastTwoDigits = number.slice(-2);

  if (lastTwoDigits === '11' || lastTwoDigits === '12' || lastTwoDigits === '13') {
    return number + 'th';
  }

  switch (lastDigit) {
    case '1':
      return number + 'st';
    case '2':
      return number + 'nd';
    case '3':
      return number + 'rd';
    default:
      return number + 'th';
  }
}

/**
 * `titleize` capitalizes the first letter of each word in
 * the string `words`. It preserves the existing whitespace.
 */
export function titleize(words) {
  if (typeof words !== 'string') {
    return words;
  }

  return words.replace(/\S+/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}

/**
 * Resets the inflector's rules to their initial state,
 * clearing out any custom rules that have been added.
 */
export function resetInflections() {
  plurals      = [];
  singulars    = [];
  uncountables = [];

  plural(/$/,                         's');
  plural(/s$/,                        's');
  plural(/(ax|test)is$/,              '$1es');
  plural(/(octop|vir)us$/,            '$1i');
  plural(/(octop|vir)i$/,             '$1i');
  plural(/(alias|status)$/,           '$1es');
  plural(/(bu)s$/,                    '$1ses');
  plural(/(buffal|tomat)o$/,          '$1oes');
  plural(/([ti])um$/,                 '$1a');
  plural(/([ti])a$/,                  '$1a');
  plural(/sis$/,                      'ses');
  plural(/(?:([^f])fe|([lr])?f)$/,     '$1$2ves');
  plural(/(hive)$/,                   '$1s');
  plural(/([^aeiouy]|qu)y$/,          '$1ies');
  plural(/(x|ch|ss|sh)$/,             '$1es');
  plural(/(matr|vert|ind)(?:ix|ex)$/, '$1ices');
  plural(/([m|l])ouse$/,              '$1ice');
  plural(/([m|l])ice$/,               '$1ice');
  plural(/^(ox)$/,                    '$1en');
  plural(/^(oxen)$/,                  '$1');
  plural(/(quiz)$/,                   '$1zes');

  singular(/s$/,                                                            '');
  singular(/(n)ews$/,                                                       '$1ews');
  singular(/([ti])a$/,                                                      '$1um');
  singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/, '$1$2sis');
  singular(/(^analy)ses$/,                                                  '$1sis');
  singular(/([^f])ves$/,                                                    '$1fe');
  singular(/(hive)s$/,                                                      '$1');
  singular(/(tive)s$/,                                                      '$1');
  singular(/([lr])ves$/,                                                    '$1f');
  singular(/([^aeiouy]|qu)ies$/,                                            '$1y');
  singular(/(s)eries$/,                                                     '$1eries');
  singular(/(m)ovies$/,                                                     '$1ovie');
  singular(/(x|ch|ss|sh)es$/,                                               '$1');
  singular(/([m|l])ice$/,                                                   '$1ouse');
  singular(/(bus)es$/,                                                      '$1');
  singular(/(o)es$/,                                                        '$1');
  singular(/(shoe)s$/,                                                      '$1');
  singular(/(cris|ax|test)es$/,                                             '$1is');
  singular(/(octop|vir)i$/,                                                 '$1us');
  singular(/(alias|status)es$/,                                             '$1');
  singular(/^(ox)en/,                                                       '$1');
  singular(/(vert|ind)ices$/,                                               '$1ex');
  singular(/(matr)ices$/,                                                   '$1ix');
  singular(/(quiz)zes$/,                                                    '$1');
  singular(/(database)s$/,                                                  '$1');

  irregular('person', 'people');
  irregular('man',    'men');
  irregular('child',  'children');
  irregular('sex',    'sexes');
  irregular('move',   'moves');
  irregular('cow',    'kine');

  uncountable('equipment');
  uncountable('information');
  uncountable('rice');
  uncountable('money');
  uncountable('species');
  uncountable('series');
  uncountable('fish');
  uncountable('sheep');
  uncountable('jeans');

  return this;
}

resetInflections();

var STRING_DASHERIZE_REGEXP = (/[ _]/g);
var STRING_DASHERIZE_CACHE = {};
var STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
var STRING_CAMELIZE_REGEXP = (/(\-|_|\.|\s)+(.)?/g);
var STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
var STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);

export function decamelize(str) {
  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}

export function dasherize(str) {
  var cache = STRING_DASHERIZE_CACHE,
      hit   = cache.hasOwnProperty(str),
      ret;

  if (hit) {
    return cache[str];
  } else {
    ret = decamelize(str).replace(STRING_DASHERIZE_REGEXP,'-');
    cache[str] = ret;
  }

  return ret;
}

export function camelize(str) {
  return str.replace(STRING_CAMELIZE_REGEXP, function(match, separator, chr) {
    return chr ? chr.toUpperCase() : '';
  }).replace(/^([A-Z])/, function(match, separator, chr) {
    return match.toLowerCase();
  });
}

export function classify(str) {
  var parts = str.split("."),
      out = [];

  for (var i=0, l=parts.length; i<l; i++) {
    var camelized = camelize(parts[i]);
    out.push(camelized.charAt(0).toUpperCase() + camelized.substr(1));
  }

  return out.join(".");
}

export function underscore(str) {
  return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
    replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}
