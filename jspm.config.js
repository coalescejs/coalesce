SystemJS.config({
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.8"
    }
  },
  transpiler: "plugin-babel",
  packages: {
    "coalesce": {
      "format": "esm",
      "main": "coalesce.js",
      "meta": {
        "*.js": {
          "babelOptions": {
            "presets": [
              "babel-preset-stage-0"
            ]
          }
        }
      }
    },
    "coalesce-tests": {
      "format": "esm",
      "main": "index.js",
      "meta": {
        "*.js": {
          "babelOptions": {
            "presets": [
              "babel-preset-stage-0"
            ]
          }
        }
      }
    },
    "github:coalescejs/coalesce2@dev": {
      "map": {
        "babel-preset-stage-0": "npm:babel-preset-stage-0@6.5.0",
        "inflection": "npm:inflection@1.10.0",
        "babel-types": "npm:babel-types@6.8.1",
        "chai": "npm:chai@3.5.0",
        "whatwg-fetch": "npm:whatwg-fetch@0.11.1",
        "qs": "npm:qs@6.2.1",
        "immutable": "npm:immutable@3.8.1",
        "lodash": "npm:lodash@4.14.2",
        "mocha-lazy-bdd": "npm:mocha-lazy-bdd@0.1.0",
        "fetch-mock": "npm:fetch-mock@4.6.1",
        "coalesce2": "github:coalescejs/coalesce2@dev"
      }
    },
    "npm:fetch-mock@4.6.1": {
      "map": {
        "node-fetch": "npm:node-fetch@1.6.0"
      }
    }
  },
  map: {
    "coalesce2": "github:coalescejs/coalesce2@dev"
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "github:jspm/nodelibs-assert@0.2.0-alpha",
    "babel-preset-stage-0": "npm:babel-preset-stage-0@6.5.0",
    "babel-types": "npm:babel-types@6.8.1",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "chai": "npm:chai@3.5.0",
    "child_process": "github:jspm/nodelibs-child_process@0.2.0-alpha",
    "constants": "github:jspm/nodelibs-constants@0.2.0-alpha",
    "core-js": "npm:core-js@1.2.7",
    "crypto": "github:jspm/nodelibs-crypto@0.2.0-alpha",
    "events": "github:jspm/nodelibs-events@0.2.0-alpha",
    "fetch-mock": "npm:fetch-mock@5.0.5",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "http": "github:jspm/nodelibs-http@0.2.0-alpha",
    "https": "github:jspm/nodelibs-https@0.2.0-alpha",
    "immutable": "npm:immutable@3.8.1",
    "inflection": "npm:inflection@1.10.0",
    "lodash": "npm:lodash@4.14.2",
    "mocha": "npm:mocha@2.5.3",
    "mocha-lazy-bdd": "npm:mocha-lazy-bdd@0.1.0",
    "module": "github:jspm/nodelibs-module@0.2.0-alpha",
    "net": "github:jspm/nodelibs-net@0.2.0-alpha",
    "path": "github:jspm/nodelibs-path@0.2.0-alpha",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "qs": "npm:qs@6.2.1",
    "stream": "github:jspm/nodelibs-stream@0.2.0-alpha",
    "string_decoder": "github:jspm/nodelibs-string_decoder@0.2.0-alpha",
    "tty": "github:jspm/nodelibs-tty@0.2.0-alpha",
    "url": "github:jspm/nodelibs-url@0.2.0-alpha",
    "util": "github:jspm/nodelibs-util@0.2.0-alpha",
    "vm": "github:jspm/nodelibs-vm@0.2.0-alpha",
    "whatwg-fetch": "npm:whatwg-fetch@0.11.1",
    "zlib": "github:jspm/nodelibs-zlib@0.2.0-alpha"
  },
  packages: {
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.9.0"
      }
    },
    "github:jspm/nodelibs-crypto@0.2.0-alpha": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "github:jspm/nodelibs-http@0.2.0-alpha": {
      "map": {
        "http-browserify": "npm:stream-http@2.3.1"
      }
    },
    "github:jspm/nodelibs-stream@0.2.0-alpha": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "github:jspm/nodelibs-string_decoder@0.2.0-alpha": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "github:jspm/nodelibs-url@0.2.0-alpha": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "github:jspm/nodelibs-zlib@0.2.0-alpha": {
      "map": {
        "zlib-browserify": "npm:browserify-zlib@0.1.4"
      }
    },
    "npm:babel-helper-bindify-decorators@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-helper-builder-binary-assignment-operator-visitor@6.8.0": {
      "map": {
        "babel-helper-explode-assignable-expression": "npm:babel-helper-explode-assignable-expression@6.8.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-helper-explode-assignable-expression@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-helper-explode-class@6.8.0": {
      "map": {
        "babel-helper-bindify-decorators": "npm:babel-helper-bindify-decorators@6.8.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-helper-function-name@6.8.0": {
      "map": {
        "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.8.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-template": "npm:babel-template@6.9.0",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-helper-get-function-arity@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:babel-messages@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-async-to-generator@6.8.0": {
      "map": {
        "babel-helper-remap-async-to-generator": "npm:babel-helper-remap-async-to-generator@6.11.2",
        "babel-plugin-syntax-async-functions": "npm:babel-plugin-syntax-async-functions@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-class-constructor-call@6.8.0": {
      "map": {
        "babel-plugin-syntax-class-constructor-call": "npm:babel-plugin-syntax-class-constructor-call@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-template": "npm:babel-template@6.9.0"
      }
    },
    "npm:babel-plugin-transform-do-expressions@6.8.0": {
      "map": {
        "babel-plugin-syntax-do-expressions": "npm:babel-plugin-syntax-do-expressions@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-exponentiation-operator@6.8.0": {
      "map": {
        "babel-helper-builder-binary-assignment-operator-visitor": "npm:babel-helper-builder-binary-assignment-operator-visitor@6.8.0",
        "babel-plugin-syntax-exponentiation-operator": "npm:babel-plugin-syntax-exponentiation-operator@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-export-extensions@6.8.0": {
      "map": {
        "babel-plugin-syntax-export-extensions": "npm:babel-plugin-syntax-export-extensions@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-function-bind@6.8.0": {
      "map": {
        "babel-plugin-syntax-function-bind": "npm:babel-plugin-syntax-function-bind@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-object-rest-spread@6.8.0": {
      "map": {
        "babel-plugin-syntax-object-rest-spread": "npm:babel-plugin-syntax-object-rest-spread@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-preset-stage-0@6.5.0": {
      "map": {
        "babel-plugin-transform-do-expressions": "npm:babel-plugin-transform-do-expressions@6.8.0",
        "babel-plugin-transform-function-bind": "npm:babel-plugin-transform-function-bind@6.8.0",
        "babel-preset-stage-1": "npm:babel-preset-stage-1@6.13.0"
      }
    },
    "npm:babel-types@6.8.1": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "esutils": "npm:esutils@2.0.2",
        "lodash": "npm:lodash@3.10.1",
        "to-fast-properties": "npm:to-fast-properties@1.0.2"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "buffer-xor": "npm:buffer-xor@1.0.3",
        "cipher-base": "npm:cipher-base@1.0.2",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.2",
        "des.js": "npm:des.js@1.0.0",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "elliptic": "npm:elliptic@6.3.1",
        "inherits": "npm:inherits@2.0.1",
        "parse-asn1": "npm:parse-asn1@5.0.0"
      }
    },
    "npm:browserify-zlib@0.1.4": {
      "map": {
        "pako": "npm:pako@0.2.9",
        "readable-stream": "npm:readable-stream@2.1.4"
      }
    },
    "npm:chai@3.5.0": {
      "map": {
        "assertion-error": "npm:assertion-error@1.0.2",
        "deep-eql": "npm:deep-eql@0.1.3",
        "type-detect": "npm:type-detect@1.0.0"
      }
    },
    "npm:chalk@1.1.3": {
      "map": {
        "ansi-styles": "npm:ansi-styles@2.2.1",
        "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
        "has-ansi": "npm:has-ansi@2.0.0",
        "strip-ansi": "npm:strip-ansi@3.0.1",
        "supports-color": "npm:supports-color@2.0.0"
      }
    },
    "npm:cipher-base@1.0.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.1"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.2",
        "inherits": "npm:inherits@2.0.1",
        "ripemd160": "npm:ripemd160@1.0.1",
        "sha.js": "npm:sha.js@2.4.5"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "inherits": "npm:inherits@2.0.1",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:debug@2.2.0": {
      "map": {
        "ms": "npm:ms@0.7.1"
      }
    },
    "npm:deep-eql@0.1.3": {
      "map": {
        "type-detect": "npm:type-detect@0.1.1"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:encoding@0.1.12": {
      "map": {
        "iconv-lite": "npm:iconv-lite@0.4.13"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:has-ansi@2.0.0": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:invariant@2.2.1": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0"
      }
    },
    "npm:loose-envify@1.2.0": {
      "map": {
        "js-tokens": "npm:js-tokens@1.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.5"
      }
    },
    "npm:mocha-lazy-bdd@0.1.0": {
      "map": {
        "escape-string-regexp": "npm:escape-string-regexp@1.0.5"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "asn1.js": "npm:asn1.js@4.8.0",
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.4"
      }
    },
    "npm:pbkdf2@3.0.4": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "create-hash": "npm:create-hash@1.1.2",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:sha.js@2.4.5": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "readable-stream": "npm:readable-stream@2.1.4"
      }
    },
    "npm:strip-ansi@3.0.1": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:babel-preset-stage-1@6.13.0": {
      "map": {
        "babel-plugin-transform-export-extensions": "npm:babel-plugin-transform-export-extensions@6.8.0",
        "babel-preset-stage-2": "npm:babel-preset-stage-2@6.13.0",
        "babel-plugin-transform-class-constructor-call": "npm:babel-plugin-transform-class-constructor-call@6.8.0"
      }
    },
    "npm:babel-traverse@6.13.0": {
      "map": {
        "babel-types": "npm:babel-types@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "lodash": "npm:lodash@4.14.2",
        "globals": "npm:globals@8.18.0",
        "babel-messages": "npm:babel-messages@6.8.0",
        "babel-code-frame": "npm:babel-code-frame@6.11.0",
        "debug": "npm:debug@2.2.0",
        "babylon": "npm:babylon@6.8.4",
        "invariant": "npm:invariant@2.2.1"
      }
    },
    "npm:babel-types@6.13.0": {
      "map": {
        "esutils": "npm:esutils@2.0.2",
        "to-fast-properties": "npm:to-fast-properties@1.0.2",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "lodash": "npm:lodash@4.14.2"
      }
    },
    "npm:babel-runtime@6.11.6": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "regenerator-runtime": "npm:regenerator-runtime@0.9.5"
      }
    },
    "npm:babel-preset-stage-2@6.13.0": {
      "map": {
        "babel-preset-stage-3": "npm:babel-preset-stage-3@6.11.0",
        "babel-plugin-transform-decorators": "npm:babel-plugin-transform-decorators@6.13.0",
        "babel-plugin-transform-class-properties": "npm:babel-plugin-transform-class-properties@6.11.5",
        "babel-plugin-transform-object-rest-spread": "npm:babel-plugin-transform-object-rest-spread@6.8.0"
      }
    },
    "npm:node-fetch@1.6.0": {
      "map": {
        "is-stream": "npm:is-stream@1.1.0",
        "encoding": "npm:encoding@0.1.12"
      }
    },
    "npm:babel-plugin-transform-decorators@6.13.0": {
      "map": {
        "babel-types": "npm:babel-types@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-template": "npm:babel-template@6.9.0",
        "babel-plugin-syntax-decorators": "npm:babel-plugin-syntax-decorators@6.13.0",
        "babel-helper-define-map": "npm:babel-helper-define-map@6.9.0",
        "babel-helper-explode-class": "npm:babel-helper-explode-class@6.8.0"
      }
    },
    "npm:babel-plugin-transform-class-properties@6.11.5": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
        "babel-plugin-syntax-class-properties": "npm:babel-plugin-syntax-class-properties@6.13.0"
      }
    },
    "npm:babel-code-frame@6.11.0": {
      "map": {
        "esutils": "npm:esutils@2.0.2",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "js-tokens": "npm:js-tokens@2.0.0",
        "chalk": "npm:chalk@1.1.3"
      }
    },
    "npm:babel-preset-stage-3@6.11.0": {
      "map": {
        "babel-plugin-transform-exponentiation-operator": "npm:babel-plugin-transform-exponentiation-operator@6.8.0",
        "babel-plugin-transform-async-to-generator": "npm:babel-plugin-transform-async-to-generator@6.8.0",
        "babel-plugin-syntax-trailing-function-commas": "npm:babel-plugin-syntax-trailing-function-commas@6.13.0"
      }
    },
    "npm:babylon@6.8.4": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-template@6.9.0": {
      "map": {
        "babylon": "npm:babylon@6.8.4",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-types": "npm:babel-types@6.13.0",
        "lodash": "npm:lodash@4.14.2",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-helper-define-map@6.9.0": {
      "map": {
        "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
        "lodash": "npm:lodash@4.14.2",
        "babel-types": "npm:babel-types@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:stream-http@2.3.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "builtin-status-codes": "npm:builtin-status-codes@2.0.0",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "xtend": "npm:xtend@4.0.1",
        "readable-stream": "npm:readable-stream@2.1.4"
      }
    },
    "npm:babel-helper-remap-async-to-generator@6.11.2": {
      "map": {
        "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0",
        "babel-template": "npm:babel-template@6.9.0",
        "babel-traverse": "npm:babel-traverse@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-types": "npm:babel-types@6.8.1"
      }
    },
    "npm:buffer@4.9.0": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "ieee754": "npm:ieee754@1.1.6",
        "base64-js": "npm:base64-js@1.1.2"
      }
    },
    "npm:readable-stream@2.1.4": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "isarray": "npm:isarray@1.0.0",
        "string_decoder": "npm:string_decoder@0.10.31",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "core-util-is": "npm:core-util-is@1.0.2"
      }
    },
    "npm:elliptic@6.3.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "hash.js": "npm:hash.js@1.0.3",
        "brorand": "npm:brorand@1.0.5",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:asn1.js@4.8.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:mocha@2.5.3": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.26"
      }
    },
    "npm:fetch-mock@5.0.5": {
      "map": {
        "node-fetch": "npm:node-fetch@1.6.0"
      }
    }
  }
});
