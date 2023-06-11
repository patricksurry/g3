(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.g3 = {}));
}(this, (function (exports) { 'use strict';

    (function() {
        const env = {};
        try {
            if (process) {
                process.env = Object.assign({}, process.env);
                Object.assign(process.env, env);
                return;
            }
        } catch (e) {} // avoid ReferenceError: process is not defined
        globalThis.process = { env:env };
    })();

    /*

    Based off glamor's StyleSheet, thanks Sunil ❤️

    high performance StyleSheet for css-in-js systems

    - uses multiple style tags behind the scenes for millions of rules
    - uses `insertRule` for appending in production for *much* faster performance

    // usage

    import { StyleSheet } from '@emotion/sheet'

    let styleSheet = new StyleSheet({ key: '', container: document.head })

    styleSheet.insert('#box { border: 1px solid red; }')
    - appends a css rule into the stylesheet

    styleSheet.flush()
    - empties the stylesheet of all its contents

    */
    // $FlowFixMe
    function sheetForTag(tag) {
      if (tag.sheet) {
        // $FlowFixMe
        return tag.sheet;
      } // this weirdness brought to you by firefox

      /* istanbul ignore next */


      for (var i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].ownerNode === tag) {
          // $FlowFixMe
          return document.styleSheets[i];
        }
      }
    }

    function createStyleElement(options) {
      var tag = document.createElement('style');
      tag.setAttribute('data-emotion', options.key);

      if (options.nonce !== undefined) {
        tag.setAttribute('nonce', options.nonce);
      }

      tag.appendChild(document.createTextNode(''));
      tag.setAttribute('data-s', '');
      return tag;
    }

    var StyleSheet = /*#__PURE__*/function () {
      function StyleSheet(options) {
        var _this = this;

        this._insertTag = function (tag) {
          var before;

          if (_this.tags.length === 0) {
            before = _this.prepend ? _this.container.firstChild : _this.before;
          } else {
            before = _this.tags[_this.tags.length - 1].nextSibling;
          }

          _this.container.insertBefore(tag, before);

          _this.tags.push(tag);
        };

        this.isSpeedy = options.speedy === undefined ? process.env.NODE_ENV === 'production' : options.speedy;
        this.tags = [];
        this.ctr = 0;
        this.nonce = options.nonce; // key is the value of the data-emotion attribute, it's used to identify different sheets

        this.key = options.key;
        this.container = options.container;
        this.prepend = options.prepend;
        this.before = null;
      }

      var _proto = StyleSheet.prototype;

      _proto.hydrate = function hydrate(nodes) {
        nodes.forEach(this._insertTag);
      };

      _proto.insert = function insert(rule) {
        // the max length is how many rules we have per style tag, it's 65000 in speedy mode
        // it's 1 in dev because we insert source maps that map a single rule to a location
        // and you can only have one source map per style tag
        if (this.ctr % (this.isSpeedy ? 65000 : 1) === 0) {
          this._insertTag(createStyleElement(this));
        }

        var tag = this.tags[this.tags.length - 1];

        if (process.env.NODE_ENV !== 'production') {
          var isImportRule = rule.charCodeAt(0) === 64 && rule.charCodeAt(1) === 105;

          if (isImportRule && this._alreadyInsertedOrderInsensitiveRule) {
            // this would only cause problem in speedy mode
            // but we don't want enabling speedy to affect the observable behavior
            // so we report this error at all times
            console.error("You're attempting to insert the following rule:\n" + rule + '\n\n`@import` rules must be before all other types of rules in a stylesheet but other rules have already been inserted. Please ensure that `@import` rules are before all other rules.');
          }
          this._alreadyInsertedOrderInsensitiveRule = this._alreadyInsertedOrderInsensitiveRule || !isImportRule;
        }

        if (this.isSpeedy) {
          var sheet = sheetForTag(tag);

          try {
            // this is the ultrafast version, works across browsers
            // the big drawback is that the css won't be editable in devtools
            sheet.insertRule(rule, sheet.cssRules.length);
          } catch (e) {
            if (process.env.NODE_ENV !== 'production' && !/:(-moz-placeholder|-ms-input-placeholder|-moz-read-write|-moz-read-only){/.test(rule)) {
              console.error("There was a problem inserting the following rule: \"" + rule + "\"", e);
            }
          }
        } else {
          tag.appendChild(document.createTextNode(rule));
        }

        this.ctr++;
      };

      _proto.flush = function flush() {
        // $FlowFixMe
        this.tags.forEach(function (tag) {
          return tag.parentNode.removeChild(tag);
        });
        this.tags = [];
        this.ctr = 0;

        if (process.env.NODE_ENV !== 'production') {
          this._alreadyInsertedOrderInsensitiveRule = false;
        }
      };

      return StyleSheet;
    }();

    var MS = '-ms-';
    var MOZ = '-moz-';
    var WEBKIT = '-webkit-';

    var COMMENT = 'comm';
    var RULESET = 'rule';
    var DECLARATION = 'decl';
    var IMPORT = '@import';
    var KEYFRAMES = '@keyframes';

    /**
     * @param {number}
     * @return {number}
     */
    var abs$1 = Math.abs;

    /**
     * @param {number}
     * @return {string}
     */
    var from = String.fromCharCode;

    /**
     * @param {string} value
     * @param {number} length
     * @return {number}
     */
    function hash (value, length) {
    	return (((((((length << 2) ^ charat(value, 0)) << 2) ^ charat(value, 1)) << 2) ^ charat(value, 2)) << 2) ^ charat(value, 3)
    }

    /**
     * @param {string} value
     * @return {string}
     */
    function trim (value) {
    	return value.trim()
    }

    /**
     * @param {string} value
     * @param {RegExp} pattern
     * @return {string?}
     */
    function match (value, pattern) {
    	return (value = pattern.exec(value)) ? value[0] : value
    }

    /**
     * @param {string} value
     * @param {(string|RegExp)} pattern
     * @param {string} replacement
     * @return {string}
     */
    function replace (value, pattern, replacement) {
    	return value.replace(pattern, replacement)
    }

    /**
     * @param {string} value
     * @param {string} value
     * @return {number}
     */
    function indexof (value, search) {
    	return value.indexOf(search)
    }

    /**
     * @param {string} value
     * @param {number} index
     * @return {number}
     */
    function charat (value, index) {
    	return value.charCodeAt(index) | 0
    }

    /**
     * @param {string} value
     * @param {number} begin
     * @param {number} end
     * @return {string}
     */
    function substr (value, begin, end) {
    	return value.slice(begin, end)
    }

    /**
     * @param {string} value
     * @return {number}
     */
    function strlen (value) {
    	return value.length
    }

    /**
     * @param {any[]} value
     * @return {number}
     */
    function sizeof (value) {
    	return value.length
    }

    /**
     * @param {any} value
     * @param {any[]} array
     * @return {any}
     */
    function append (value, array) {
    	return array.push(value), value
    }

    /**
     * @param {string[]} array
     * @param {function} callback
     * @return {string}
     */
    function combine (array, callback) {
    	return array.map(callback).join('')
    }

    var line$1 = 1;
    var column = 1;
    var length = 0;
    var position = 0;
    var character = 0;
    var characters = '';

    /**
     * @param {string} value
     * @param {object} root
     * @param {object?} parent
     * @param {string} type
     * @param {string[]} props
     * @param {object[]} children
     * @param {number} length
     */
    function node (value, root, parent, type, props, children, length) {
    	return {value: value, root: root, parent: parent, type: type, props: props, children: children, line: line$1, column: column, length: length, return: ''}
    }

    /**
     * @param {string} value
     * @param {object} root
     * @param {string} type
     */
    function copy$1 (value, root, type) {
    	return node(value, root.root, root.parent, type, root.props, root.children, 0)
    }

    /**
     * @return {number}
     */
    function char () {
    	return character
    }

    /**
     * @return {number}
     */
    function prev () {
    	character = position > 0 ? charat(characters, --position) : 0;

    	if (column--, character === 10)
    		column = 1, line$1--;

    	return character
    }

    /**
     * @return {number}
     */
    function next () {
    	character = position < length ? charat(characters, position++) : 0;

    	if (column++, character === 10)
    		column = 1, line$1++;

    	return character
    }

    /**
     * @return {number}
     */
    function peek () {
    	return charat(characters, position)
    }

    /**
     * @return {number}
     */
    function caret () {
    	return position
    }

    /**
     * @param {number} begin
     * @param {number} end
     * @return {string}
     */
    function slice (begin, end) {
    	return substr(characters, begin, end)
    }

    /**
     * @param {number} type
     * @return {number}
     */
    function token (type) {
    	switch (type) {
    		// \0 \t \n \r \s whitespace token
    		case 0: case 9: case 10: case 13: case 32:
    			return 5
    		// ! + , / > @ ~ isolate token
    		case 33: case 43: case 44: case 47: case 62: case 64: case 126:
    		// ; { } breakpoint token
    		case 59: case 123: case 125:
    			return 4
    		// : accompanied token
    		case 58:
    			return 3
    		// " ' ( [ opening delimit token
    		case 34: case 39: case 40: case 91:
    			return 2
    		// ) ] closing delimit token
    		case 41: case 93:
    			return 1
    	}

    	return 0
    }

    /**
     * @param {string} value
     * @return {any[]}
     */
    function alloc (value) {
    	return line$1 = column = 1, length = strlen(characters = value), position = 0, []
    }

    /**
     * @param {any} value
     * @return {any}
     */
    function dealloc (value) {
    	return characters = '', value
    }

    /**
     * @param {number} type
     * @return {string}
     */
    function delimit (type) {
    	return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)))
    }

    /**
     * @param {number} type
     * @return {string}
     */
    function whitespace (type) {
    	while (character = peek())
    		if (character < 33)
    			next();
    		else
    			break

    	return token(type) > 2 || token(character) > 3 ? '' : ' '
    }

    /**
     * @param {number} index
     * @param {number} count
     * @return {string}
     */
    function escaping (index, count) {
    	while (--count && next())
    		// not 0-9 A-F a-f
    		if (character < 48 || character > 102 || (character > 57 && character < 65) || (character > 70 && character < 97))
    			break

    	return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32))
    }

    /**
     * @param {number} type
     * @return {number}
     */
    function delimiter (type) {
    	while (next())
    		switch (character) {
    			// ] ) " '
    			case type:
    				return position
    			// " '
    			case 34: case 39:
    				return delimiter(type === 34 || type === 39 ? type : character)
    			// (
    			case 40:
    				if (type === 41)
    					delimiter(type);
    				break
    			// \
    			case 92:
    				next();
    				break
    		}

    	return position
    }

    /**
     * @param {number} type
     * @param {number} index
     * @return {number}
     */
    function commenter (type, index) {
    	while (next())
    		// //
    		if (type + character === 47 + 10)
    			break
    		// /*
    		else if (type + character === 42 + 42 && peek() === 47)
    			break

    	return '/*' + slice(index, position - 1) + '*' + from(type === 47 ? type : next())
    }

    /**
     * @param {number} index
     * @return {string}
     */
    function identifier (index) {
    	while (!token(peek()))
    		next();

    	return slice(index, position)
    }

    /**
     * @param {string} value
     * @return {object[]}
     */
    function compile (value) {
    	return dealloc(parse('', null, null, null, [''], value = alloc(value), 0, [0], value))
    }

    /**
     * @param {string} value
     * @param {object} root
     * @param {object?} parent
     * @param {string[]} rule
     * @param {string[]} rules
     * @param {string[]} rulesets
     * @param {number[]} pseudo
     * @param {number[]} points
     * @param {string[]} declarations
     * @return {object}
     */
    function parse (value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
    	var index = 0;
    	var offset = 0;
    	var length = pseudo;
    	var atrule = 0;
    	var property = 0;
    	var previous = 0;
    	var variable = 1;
    	var scanning = 1;
    	var ampersand = 1;
    	var character = 0;
    	var type = '';
    	var props = rules;
    	var children = rulesets;
    	var reference = rule;
    	var characters = type;

    	while (scanning)
    		switch (previous = character, character = next()) {
    			// " ' [ (
    			case 34: case 39: case 91: case 40:
    				characters += delimit(character);
    				break
    			// \t \n \r \s
    			case 9: case 10: case 13: case 32:
    				characters += whitespace(previous);
    				break
    			// \
    			case 92:
    				characters += escaping(caret() - 1, 7);
    				continue
    			// /
    			case 47:
    				switch (peek()) {
    					case 42: case 47:
    						append(comment(commenter(next(), caret()), root, parent), declarations);
    						break
    					default:
    						characters += '/';
    				}
    				break
    			// {
    			case 123 * variable:
    				points[index++] = strlen(characters) * ampersand;
    			// } ; \0
    			case 125 * variable: case 59: case 0:
    				switch (character) {
    					// \0 }
    					case 0: case 125: scanning = 0;
    					// ;
    					case 59 + offset:
    						if (property > 0 && (strlen(characters) - length))
    							append(property > 32 ? declaration(characters + ';', rule, parent, length - 1) : declaration(replace(characters, ' ', '') + ';', rule, parent, length - 2), declarations);
    						break
    					// @ ;
    					case 59: characters += ';';
    					// { rule/at-rule
    					default:
    						append(reference = ruleset(characters, root, parent, index, offset, rules, points, type, props = [], children = [], length), rulesets);

    						if (character === 123)
    							if (offset === 0)
    								parse(characters, root, reference, reference, props, rulesets, length, points, children);
    							else
    								switch (atrule) {
    									// d m s
    									case 100: case 109: case 115:
    										parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length), children), rules, children, length, points, rule ? props : children);
    										break
    									default:
    										parse(characters, reference, reference, reference, [''], children, length, points, children);
    								}
    				}

    				index = offset = property = 0, variable = ampersand = 1, type = characters = '', length = pseudo;
    				break
    			// :
    			case 58:
    				length = 1 + strlen(characters), property = previous;
    			default:
    				if (variable < 1)
    					if (character == 123)
    						--variable;
    					else if (character == 125 && variable++ == 0 && prev() == 125)
    						continue

    				switch (characters += from(character), character * variable) {
    					// &
    					case 38:
    						ampersand = offset > 0 ? 1 : (characters += '\f', -1);
    						break
    					// ,
    					case 44:
    						points[index++] = (strlen(characters) - 1) * ampersand, ampersand = 1;
    						break
    					// @
    					case 64:
    						// -
    						if (peek() === 45)
    							characters += delimit(next());

    						atrule = peek(), offset = strlen(type = characters += identifier(caret())), character++;
    						break
    					// -
    					case 45:
    						if (previous === 45 && strlen(characters) == 2)
    							variable = 0;
    				}
    		}

    	return rulesets
    }

    /**
     * @param {string} value
     * @param {object} root
     * @param {object?} parent
     * @param {number} index
     * @param {number} offset
     * @param {string[]} rules
     * @param {number[]} points
     * @param {string} type
     * @param {string[]} props
     * @param {string[]} children
     * @param {number} length
     * @return {object}
     */
    function ruleset (value, root, parent, index, offset, rules, points, type, props, children, length) {
    	var post = offset - 1;
    	var rule = offset === 0 ? rules : [''];
    	var size = sizeof(rule);

    	for (var i = 0, j = 0, k = 0; i < index; ++i)
    		for (var x = 0, y = substr(value, post + 1, post = abs$1(j = points[i])), z = value; x < size; ++x)
    			if (z = trim(j > 0 ? rule[x] + ' ' + y : replace(y, /&\f/g, rule[x])))
    				props[k++] = z;

    	return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length)
    }

    /**
     * @param {number} value
     * @param {object} root
     * @param {object?} parent
     * @return {object}
     */
    function comment (value, root, parent) {
    	return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0)
    }

    /**
     * @param {string} value
     * @param {object} root
     * @param {object?} parent
     * @param {number} length
     * @return {object}
     */
    function declaration (value, root, parent, length) {
    	return node(value, root, parent, DECLARATION, substr(value, 0, length), substr(value, length + 1, -1), length)
    }

    /**
     * @param {string} value
     * @param {number} length
     * @return {string}
     */
    function prefix (value, length) {
    	switch (hash(value, length)) {
    		// color-adjust
    		case 5103:
    			return WEBKIT + 'print-' + value + value
    		// animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
    		case 5737: case 4201: case 3177: case 3433: case 1641: case 4457: case 2921:
    		// text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
    		case 5572: case 6356: case 5844: case 3191: case 6645: case 3005:
    		// mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
    		case 6391: case 5879: case 5623: case 6135: case 4599: case 4855:
    		// background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
    		case 4215: case 6389: case 5109: case 5365: case 5621: case 3829:
    			return WEBKIT + value + value
    		// appearance, user-select, transform, hyphens, text-size-adjust
    		case 5349: case 4246: case 4810: case 6968: case 2756:
    			return WEBKIT + value + MOZ + value + MS + value + value
    		// flex, flex-direction
    		case 6828: case 4268:
    			return WEBKIT + value + MS + value + value
    		// order
    		case 6165:
    			return WEBKIT + value + MS + 'flex-' + value + value
    		// align-items
    		case 5187:
    			return WEBKIT + value + replace(value, /(\w+).+(:[^]+)/, WEBKIT + 'box-$1$2' + MS + 'flex-$1$2') + value
    		// align-self
    		case 5443:
    			return WEBKIT + value + MS + 'flex-item-' + replace(value, /flex-|-self/, '') + value
    		// align-content
    		case 4675:
    			return WEBKIT + value + MS + 'flex-line-pack' + replace(value, /align-content|flex-|-self/, '') + value
    		// flex-shrink
    		case 5548:
    			return WEBKIT + value + MS + replace(value, 'shrink', 'negative') + value
    		// flex-basis
    		case 5292:
    			return WEBKIT + value + MS + replace(value, 'basis', 'preferred-size') + value
    		// flex-grow
    		case 6060:
    			return WEBKIT + 'box-' + replace(value, '-grow', '') + WEBKIT + value + MS + replace(value, 'grow', 'positive') + value
    		// transition
    		case 4554:
    			return WEBKIT + replace(value, /([^-])(transform)/g, '$1' + WEBKIT + '$2') + value
    		// cursor
    		case 6187:
    			return replace(replace(replace(value, /(zoom-|grab)/, WEBKIT + '$1'), /(image-set)/, WEBKIT + '$1'), value, '') + value
    		// background, background-image
    		case 5495: case 3959:
    			return replace(value, /(image-set\([^]*)/, WEBKIT + '$1' + '$`$1')
    		// justify-content
    		case 4968:
    			return replace(replace(value, /(.+:)(flex-)?(.*)/, WEBKIT + 'box-pack:$3' + MS + 'flex-pack:$3'), /s.+-b[^;]+/, 'justify') + WEBKIT + value + value
    		// (margin|padding)-inline-(start|end)
    		case 4095: case 3583: case 4068: case 2532:
    			return replace(value, /(.+)-inline(.+)/, WEBKIT + '$1$2') + value
    		// (min|max)?(width|height|inline-size|block-size)
    		case 8116: case 7059: case 5753: case 5535:
    		case 5445: case 5701: case 4933: case 4677:
    		case 5533: case 5789: case 5021: case 4765:
    			// stretch, max-content, min-content, fill-available
    			if (strlen(value) - 1 - length > 6)
    				switch (charat(value, length + 1)) {
    					// (m)ax-content, (m)in-content
    					case 109:
    						// -
    						if (charat(value, length + 4) !== 45)
    							break
    					// (f)ill-available, (f)it-content
    					case 102:
    						return replace(value, /(.+:)(.+)-([^]+)/, '$1' + WEBKIT + '$2-$3' + '$1' + MOZ + (charat(value, length + 3) == 108 ? '$3' : '$2-$3')) + value
    					// (s)tretch
    					case 115:
    						return ~indexof(value, 'stretch') ? prefix(replace(value, 'stretch', 'fill-available'), length) + value : value
    				}
    			break
    		// position: sticky
    		case 4949:
    			// (s)ticky?
    			if (charat(value, length + 1) !== 115)
    				break
    		// display: (flex|inline-flex)
    		case 6444:
    			switch (charat(value, strlen(value) - 3 - (~indexof(value, '!important') && 10))) {
    				// stic(k)y
    				case 107:
    					return replace(value, ':', ':' + WEBKIT) + value
    				// (inline-)?fl(e)x
    				case 101:
    					return replace(value, /(.+:)([^;!]+)(;|!.+)?/, '$1' + WEBKIT + (charat(value, 14) === 45 ? 'inline-' : '') + 'box$3' + '$1' + WEBKIT + '$2$3' + '$1' + MS + '$2box$3') + value
    			}
    			break
    		// writing-mode
    		case 5936:
    			switch (charat(value, length + 11)) {
    				// vertical-l(r)
    				case 114:
    					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb') + value
    				// vertical-r(l)
    				case 108:
    					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'tb-rl') + value
    				// horizontal(-)tb
    				case 45:
    					return WEBKIT + value + MS + replace(value, /[svh]\w+-[tblr]{2}/, 'lr') + value
    			}

    			return WEBKIT + value + MS + value + value
    	}

    	return value
    }

    /**
     * @param {object[]} children
     * @param {function} callback
     * @return {string}
     */
    function serialize (children, callback) {
    	var output = '';
    	var length = sizeof(children);

    	for (var i = 0; i < length; i++)
    		output += callback(children[i], i, children, callback) || '';

    	return output
    }

    /**
     * @param {object} element
     * @param {number} index
     * @param {object[]} children
     * @param {function} callback
     * @return {string}
     */
    function stringify (element, index, children, callback) {
    	switch (element.type) {
    		case IMPORT: case DECLARATION: return element.return = element.return || element.value
    		case COMMENT: return ''
    		case RULESET: element.value = element.props.join(',');
    	}

    	return strlen(children = serialize(element.children, callback)) ? element.return = element.value + '{' + children + '}' : ''
    }

    /**
     * @param {function[]} collection
     * @return {function}
     */
    function middleware (collection) {
    	var length = sizeof(collection);

    	return function (element, index, children, callback) {
    		var output = '';

    		for (var i = 0; i < length; i++)
    			output += collection[i](element, index, children, callback) || '';

    		return output
    	}
    }

    /**
     * @param {function} callback
     * @return {function}
     */
    function rulesheet (callback) {
    	return function (element) {
    		if (!element.root)
    			if (element = element.return)
    				callback(element);
    	}
    }

    /**
     * @param {object} element
     * @param {number} index
     * @param {object[]} children
     * @param {function} callback
     */
    function prefixer (element, index, children, callback) {
    	if (!element.return)
    		switch (element.type) {
    			case DECLARATION: element.return = prefix(element.value, element.length);
    				break
    			case KEYFRAMES:
    				return serialize([copy$1(replace(element.value, '@', '@' + WEBKIT), element, '')], callback)
    			case RULESET:
    				if (element.length)
    					return combine(element.props, function (value) {
    						switch (match(value, /(::plac\w+|:read-\w+)/)) {
    							// :read-(only|write)
    							case ':read-only': case ':read-write':
    								return serialize([copy$1(replace(value, /:(read-\w+)/, ':' + MOZ + '$1'), element, '')], callback)
    							// :placeholder
    							case '::placeholder':
    								return serialize([
    									copy$1(replace(value, /:(plac\w+)/, ':' + WEBKIT + 'input-$1'), element, ''),
    									copy$1(replace(value, /:(plac\w+)/, ':' + MOZ + '$1'), element, ''),
    									copy$1(replace(value, /:(plac\w+)/, MS + 'input-$1'), element, '')
    								], callback)
    						}

    						return ''
    					})
    		}
    }

    var weakMemoize = function weakMemoize(func) {
      // $FlowFixMe flow doesn't include all non-primitive types as allowed for weakmaps
      var cache = new WeakMap();
      return function (arg) {
        if (cache.has(arg)) {
          // $FlowFixMe
          return cache.get(arg);
        }

        var ret = func(arg);
        cache.set(arg, ret);
        return ret;
      };
    };

    function memoize(fn) {
      var cache = Object.create(null);
      return function (arg) {
        if (cache[arg] === undefined) cache[arg] = fn(arg);
        return cache[arg];
      };
    }

    var last = function last(arr) {
      return arr.length ? arr[arr.length - 1] : null;
    };

    var toRules = function toRules(parsed, points) {
      // pretend we've started with a comma
      var index = -1;
      var character = 44;

      do {
        switch (token(character)) {
          case 0:
            // &\f
            if (character === 38 && peek() === 12) {
              // this is not 100% correct, we don't account for literal sequences here - like for example quoted strings
              // stylis inserts \f after & to know when & where it should replace this sequence with the context selector
              // and when it should just concatenate the outer and inner selectors
              // it's very unlikely for this sequence to actually appear in a different context, so we just leverage this fact here
              points[index] = 1;
            }

            parsed[index] += identifier(position - 1);
            break;

          case 2:
            parsed[index] += delimit(character);
            break;

          case 4:
            // comma
            if (character === 44) {
              // colon
              parsed[++index] = peek() === 58 ? '&\f' : '';
              points[index] = parsed[index].length;
              break;
            }

          // fallthrough

          default:
            parsed[index] += from(character);
        }
      } while (character = next());

      return parsed;
    };

    var getRules = function getRules(value, points) {
      return dealloc(toRules(alloc(value), points));
    }; // WeakSet would be more appropriate, but only WeakMap is supported in IE11


    var fixedElements = /* #__PURE__ */new WeakMap();
    var compat = function compat(element) {
      if (element.type !== 'rule' || !element.parent || // .length indicates if this rule contains pseudo or not
      !element.length) {
        return;
      }

      var value = element.value,
          parent = element.parent;
      var isImplicitRule = element.column === parent.column && element.line === parent.line;

      while (parent.type !== 'rule') {
        parent = parent.parent;
        if (!parent) return;
      } // short-circuit for the simplest case


      if (element.props.length === 1 && value.charCodeAt(0) !== 58
      /* colon */
      && !fixedElements.get(parent)) {
        return;
      } // if this is an implicitly inserted rule (the one eagerly inserted at the each new nested level)
      // then the props has already been manipulated beforehand as they that array is shared between it and its "rule parent"


      if (isImplicitRule) {
        return;
      }

      fixedElements.set(element, true);
      var points = [];
      var rules = getRules(value, points);
      var parentRules = parent.props;

      for (var i = 0, k = 0; i < rules.length; i++) {
        for (var j = 0; j < parentRules.length; j++, k++) {
          element.props[k] = points[i] ? rules[i].replace(/&\f/g, parentRules[j]) : parentRules[j] + " " + rules[i];
        }
      }
    };
    var removeLabel = function removeLabel(element) {
      if (element.type === 'decl') {
        var value = element.value;

        if ( // charcode for l
        value.charCodeAt(0) === 108 && // charcode for b
        value.charCodeAt(2) === 98) {
          // this ignores label
          element["return"] = '';
          element.value = '';
        }
      }
    };
    var ignoreFlag = 'emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason';

    var isIgnoringComment = function isIgnoringComment(element) {
      return !!element && element.type === 'comm' && element.children.indexOf(ignoreFlag) > -1;
    };

    var createUnsafeSelectorsAlarm = function createUnsafeSelectorsAlarm(cache) {
      return function (element, index, children) {
        if (element.type !== 'rule') return;
        var unsafePseudoClasses = element.value.match(/(:first|:nth|:nth-last)-child/g);

        if (unsafePseudoClasses && cache.compat !== true) {
          var prevElement = index > 0 ? children[index - 1] : null;

          if (prevElement && isIgnoringComment(last(prevElement.children))) {
            return;
          }

          unsafePseudoClasses.forEach(function (unsafePseudoClass) {
            console.error("The pseudo class \"" + unsafePseudoClass + "\" is potentially unsafe when doing server-side rendering. Try changing it to \"" + unsafePseudoClass.split('-child')[0] + "-of-type\".");
          });
        }
      };
    };

    var isImportRule = function isImportRule(element) {
      return element.type.charCodeAt(1) === 105 && element.type.charCodeAt(0) === 64;
    };

    var isPrependedWithRegularRules = function isPrependedWithRegularRules(index, children) {
      for (var i = index - 1; i >= 0; i--) {
        if (!isImportRule(children[i])) {
          return true;
        }
      }

      return false;
    }; // use this to remove incorrect elements from further processing
    // so they don't get handed to the `sheet` (or anything else)
    // as that could potentially lead to additional logs which in turn could be overhelming to the user


    var nullifyElement = function nullifyElement(element) {
      element.type = '';
      element.value = '';
      element["return"] = '';
      element.children = '';
      element.props = '';
    };

    var incorrectImportAlarm = function incorrectImportAlarm(element, index, children) {
      if (!isImportRule(element)) {
        return;
      }

      if (element.parent) {
        console.error("`@import` rules can't be nested inside other rules. Please move it to the top level and put it before regular rules. Keep in mind that they can only be used within global styles.");
        nullifyElement(element);
      } else if (isPrependedWithRegularRules(index, children)) {
        console.error("`@import` rules can't be after other rules. Please put your `@import` rules before your other rules.");
        nullifyElement(element);
      }
    };

    var isBrowser$1 = typeof document !== 'undefined';
    var getServerStylisCache = isBrowser$1 ? undefined : weakMemoize(function () {
      return memoize(function () {
        var cache = {};
        return function (name) {
          return cache[name];
        };
      });
    });
    var defaultStylisPlugins = [prefixer];

    var createCache = function createCache(options) {
      var key = options.key;

      if (process.env.NODE_ENV !== 'production' && !key) {
        throw new Error("You have to configure `key` for your cache. Please make sure it's unique (and not equal to 'css') as it's used for linking styles to your cache.\n" + "If multiple caches share the same key they might \"fight\" for each other's style elements.");
      }

      if (isBrowser$1 && key === 'css') {
        var ssrStyles = document.querySelectorAll("style[data-emotion]:not([data-s])"); // get SSRed styles out of the way of React's hydration
        // document.head is a safe place to move them to(though note document.head is not necessarily the last place they will be)
        // note this very very intentionally targets all style elements regardless of the key to ensure
        // that creating a cache works inside of render of a React component

        Array.prototype.forEach.call(ssrStyles, function (node) {
          // we want to only move elements which have a space in the data-emotion attribute value
          // because that indicates that it is an Emotion 11 server-side rendered style elements
          // while we will already ignore Emotion 11 client-side inserted styles because of the :not([data-s]) part in the selector
          // Emotion 10 client-side inserted styles did not have data-s (but importantly did not have a space in their data-emotion attributes)
          // so checking for the space ensures that loading Emotion 11 after Emotion 10 has inserted some styles
          // will not result in the Emotion 10 styles being destroyed
          var dataEmotionAttribute = node.getAttribute('data-emotion');

          if (dataEmotionAttribute.indexOf(' ') === -1) {
            return;
          }
          document.head.appendChild(node);
          node.setAttribute('data-s', '');
        });
      }

      var stylisPlugins = options.stylisPlugins || defaultStylisPlugins;

      if (process.env.NODE_ENV !== 'production') {
        // $FlowFixMe
        if (/[^a-z-]/.test(key)) {
          throw new Error("Emotion key must only contain lower case alphabetical characters and - but \"" + key + "\" was passed");
        }
      }

      var inserted = {}; // $FlowFixMe

      var container;
      var nodesToHydrate = [];

      if (isBrowser$1) {
        container = options.container || document.head;
        Array.prototype.forEach.call( // this means we will ignore elements which don't have a space in them which
        // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
        document.querySelectorAll("style[data-emotion^=\"" + key + " \"]"), function (node) {
          var attrib = node.getAttribute("data-emotion").split(' '); // $FlowFixMe

          for (var i = 1; i < attrib.length; i++) {
            inserted[attrib[i]] = true;
          }

          nodesToHydrate.push(node);
        });
      }

      var _insert;

      var omnipresentPlugins = [compat, removeLabel];

      if (process.env.NODE_ENV !== 'production') {
        omnipresentPlugins.push(createUnsafeSelectorsAlarm({
          get compat() {
            return cache.compat;
          }

        }), incorrectImportAlarm);
      }

      if (isBrowser$1) {
        var currentSheet;
        var finalizingPlugins = [stringify, process.env.NODE_ENV !== 'production' ? function (element) {
          if (!element.root) {
            if (element["return"]) {
              currentSheet.insert(element["return"]);
            } else if (element.value && element.type !== COMMENT) {
              // insert empty rule in non-production environments
              // so @emotion/jest can grab `key` from the (JS)DOM for caches without any rules inserted yet
              currentSheet.insert(element.value + "{}");
            }
          }
        } : rulesheet(function (rule) {
          currentSheet.insert(rule);
        })];
        var serializer = middleware(omnipresentPlugins.concat(stylisPlugins, finalizingPlugins));

        var stylis = function stylis(styles) {
          return serialize(compile(styles), serializer);
        };

        _insert = function insert(selector, serialized, sheet, shouldCache) {
          currentSheet = sheet;

          if (process.env.NODE_ENV !== 'production' && serialized.map !== undefined) {
            currentSheet = {
              insert: function insert(rule) {
                sheet.insert(rule + serialized.map);
              }
            };
          }

          stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);

          if (shouldCache) {
            cache.inserted[serialized.name] = true;
          }
        };
      } else {
        var _finalizingPlugins = [stringify];

        var _serializer = middleware(omnipresentPlugins.concat(stylisPlugins, _finalizingPlugins));

        var _stylis = function _stylis(styles) {
          return serialize(compile(styles), _serializer);
        }; // $FlowFixMe


        var serverStylisCache = getServerStylisCache(stylisPlugins)(key);

        var getRules = function getRules(selector, serialized) {
          var name = serialized.name;

          if (serverStylisCache[name] === undefined) {
            serverStylisCache[name] = _stylis(selector ? selector + "{" + serialized.styles + "}" : serialized.styles);
          }

          return serverStylisCache[name];
        };

        _insert = function _insert(selector, serialized, sheet, shouldCache) {
          var name = serialized.name;
          var rules = getRules(selector, serialized);

          if (cache.compat === undefined) {
            // in regular mode, we don't set the styles on the inserted cache
            // since we don't need to and that would be wasting memory
            // we return them so that they are rendered in a style tag
            if (shouldCache) {
              cache.inserted[name] = true;
            }

            if ( // using === development instead of !== production
            // because if people do ssr in tests, the source maps showing up would be annoying
            process.env.NODE_ENV === 'development' && serialized.map !== undefined) {
              return rules + serialized.map;
            }

            return rules;
          } else {
            // in compat mode, we put the styles on the inserted cache so
            // that emotion-server can pull out the styles
            // except when we don't want to cache it which was in Global but now
            // is nowhere but we don't want to do a major right now
            // and just in case we're going to leave the case here
            // it's also not affecting client side bundle size
            // so it's really not a big deal
            if (shouldCache) {
              cache.inserted[name] = rules;
            } else {
              return rules;
            }
          }
        };
      }

      var cache = {
        key: key,
        sheet: new StyleSheet({
          key: key,
          container: container,
          nonce: options.nonce,
          speedy: options.speedy,
          prepend: options.prepend
        }),
        nonce: options.nonce,
        inserted: inserted,
        registered: {},
        insert: _insert
      };
      cache.sheet.hydrate(nodesToHydrate);
      return cache;
    };

    /* eslint-disable */
    // Inspired by https://github.com/garycourt/murmurhash-js
    // Ported from https://github.com/aappleby/smhasher/blob/61a0530f28277f2e850bfc39600ce61d02b518de/src/MurmurHash2.cpp#L37-L86
    function murmur2(str) {
      // 'm' and 'r' are mixing constants generated offline.
      // They're not really 'magic', they just happen to work well.
      // const m = 0x5bd1e995;
      // const r = 24;
      // Initialize the hash
      var h = 0; // Mix 4 bytes at a time into the hash

      var k,
          i = 0,
          len = str.length;

      for (; len >= 4; ++i, len -= 4) {
        k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;
        k =
        /* Math.imul(k, m): */
        (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16);
        k ^=
        /* k >>> r: */
        k >>> 24;
        h =
        /* Math.imul(k, m): */
        (k & 0xffff) * 0x5bd1e995 + ((k >>> 16) * 0xe995 << 16) ^
        /* Math.imul(h, m): */
        (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      } // Handle the last few bytes of the input array


      switch (len) {
        case 3:
          h ^= (str.charCodeAt(i + 2) & 0xff) << 16;

        case 2:
          h ^= (str.charCodeAt(i + 1) & 0xff) << 8;

        case 1:
          h ^= str.charCodeAt(i) & 0xff;
          h =
          /* Math.imul(h, m): */
          (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      } // Do a few final mixes of the hash to ensure the last few
      // bytes are well-incorporated.


      h ^= h >>> 13;
      h =
      /* Math.imul(h, m): */
      (h & 0xffff) * 0x5bd1e995 + ((h >>> 16) * 0xe995 << 16);
      return ((h ^ h >>> 15) >>> 0).toString(36);
    }

    var unitlessKeys = {
      animationIterationCount: 1,
      borderImageOutset: 1,
      borderImageSlice: 1,
      borderImageWidth: 1,
      boxFlex: 1,
      boxFlexGroup: 1,
      boxOrdinalGroup: 1,
      columnCount: 1,
      columns: 1,
      flex: 1,
      flexGrow: 1,
      flexPositive: 1,
      flexShrink: 1,
      flexNegative: 1,
      flexOrder: 1,
      gridRow: 1,
      gridRowEnd: 1,
      gridRowSpan: 1,
      gridRowStart: 1,
      gridColumn: 1,
      gridColumnEnd: 1,
      gridColumnSpan: 1,
      gridColumnStart: 1,
      msGridRow: 1,
      msGridRowSpan: 1,
      msGridColumn: 1,
      msGridColumnSpan: 1,
      fontWeight: 1,
      lineHeight: 1,
      opacity: 1,
      order: 1,
      orphans: 1,
      tabSize: 1,
      widows: 1,
      zIndex: 1,
      zoom: 1,
      WebkitLineClamp: 1,
      // SVG-related properties
      fillOpacity: 1,
      floodOpacity: 1,
      stopOpacity: 1,
      strokeDasharray: 1,
      strokeDashoffset: 1,
      strokeMiterlimit: 1,
      strokeOpacity: 1,
      strokeWidth: 1
    };

    var ILLEGAL_ESCAPE_SEQUENCE_ERROR = "You have illegal escape sequence in your template literal, most likely inside content's property value.\nBecause you write your CSS inside a JavaScript string you actually have to do double escaping, so for example \"content: '\\00d7';\" should become \"content: '\\\\00d7';\".\nYou can read more about this here:\nhttps://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#ES2018_revision_of_illegal_escape_sequences";
    var UNDEFINED_AS_OBJECT_KEY_ERROR = "You have passed in falsy value as style object's key (can happen when in example you pass unexported component as computed key).";
    var hyphenateRegex = /[A-Z]|^ms/g;
    var animationRegex = /_EMO_([^_]+?)_([^]*?)_EMO_/g;

    var isCustomProperty = function isCustomProperty(property) {
      return property.charCodeAt(1) === 45;
    };

    var isProcessableValue = function isProcessableValue(value) {
      return value != null && typeof value !== 'boolean';
    };

    var processStyleName = /* #__PURE__ */memoize(function (styleName) {
      return isCustomProperty(styleName) ? styleName : styleName.replace(hyphenateRegex, '-$&').toLowerCase();
    });

    var processStyleValue = function processStyleValue(key, value) {
      switch (key) {
        case 'animation':
        case 'animationName':
          {
            if (typeof value === 'string') {
              return value.replace(animationRegex, function (match, p1, p2) {
                cursor = {
                  name: p1,
                  styles: p2,
                  next: cursor
                };
                return p1;
              });
            }
          }
      }

      if (unitlessKeys[key] !== 1 && !isCustomProperty(key) && typeof value === 'number' && value !== 0) {
        return value + 'px';
      }

      return value;
    };

    if (process.env.NODE_ENV !== 'production') {
      var contentValuePattern = /(attr|counters?|url|(((repeating-)?(linear|radial))|conic)-gradient)\(|(no-)?(open|close)-quote/;
      var contentValues = ['normal', 'none', 'initial', 'inherit', 'unset'];
      var oldProcessStyleValue = processStyleValue;
      var msPattern = /^-ms-/;
      var hyphenPattern = /-(.)/g;
      var hyphenatedCache = {};

      processStyleValue = function processStyleValue(key, value) {
        if (key === 'content') {
          if (typeof value !== 'string' || contentValues.indexOf(value) === -1 && !contentValuePattern.test(value) && (value.charAt(0) !== value.charAt(value.length - 1) || value.charAt(0) !== '"' && value.charAt(0) !== "'")) {
            throw new Error("You seem to be using a value for 'content' without quotes, try replacing it with `content: '\"" + value + "\"'`");
          }
        }

        var processed = oldProcessStyleValue(key, value);

        if (processed !== '' && !isCustomProperty(key) && key.indexOf('-') !== -1 && hyphenatedCache[key] === undefined) {
          hyphenatedCache[key] = true;
          console.error("Using kebab-case for css properties in objects is not supported. Did you mean " + key.replace(msPattern, 'ms-').replace(hyphenPattern, function (str, _char) {
            return _char.toUpperCase();
          }) + "?");
        }

        return processed;
      };
    }

    function handleInterpolation(mergedProps, registered, interpolation) {
      if (interpolation == null) {
        return '';
      }

      if (interpolation.__emotion_styles !== undefined) {
        if (process.env.NODE_ENV !== 'production' && interpolation.toString() === 'NO_COMPONENT_SELECTOR') {
          throw new Error('Component selectors can only be used in conjunction with @emotion/babel-plugin.');
        }

        return interpolation;
      }

      switch (typeof interpolation) {
        case 'boolean':
          {
            return '';
          }

        case 'object':
          {
            if (interpolation.anim === 1) {
              cursor = {
                name: interpolation.name,
                styles: interpolation.styles,
                next: cursor
              };
              return interpolation.name;
            }

            if (interpolation.styles !== undefined) {
              var next = interpolation.next;

              if (next !== undefined) {
                // not the most efficient thing ever but this is a pretty rare case
                // and there will be very few iterations of this generally
                while (next !== undefined) {
                  cursor = {
                    name: next.name,
                    styles: next.styles,
                    next: cursor
                  };
                  next = next.next;
                }
              }

              var styles = interpolation.styles + ";";

              if (process.env.NODE_ENV !== 'production' && interpolation.map !== undefined) {
                styles += interpolation.map;
              }

              return styles;
            }

            return createStringFromObject(mergedProps, registered, interpolation);
          }

        case 'function':
          {
            if (mergedProps !== undefined) {
              var previousCursor = cursor;
              var result = interpolation(mergedProps);
              cursor = previousCursor;
              return handleInterpolation(mergedProps, registered, result);
            } else if (process.env.NODE_ENV !== 'production') {
              console.error('Functions that are interpolated in css calls will be stringified.\n' + 'If you want to have a css call based on props, create a function that returns a css call like this\n' + 'let dynamicStyle = (props) => css`color: ${props.color}`\n' + 'It can be called directly with props or interpolated in a styled call like this\n' + "let SomeComponent = styled('div')`${dynamicStyle}`");
            }

            break;
          }

        case 'string':
          if (process.env.NODE_ENV !== 'production') {
            var matched = [];
            var replaced = interpolation.replace(animationRegex, function (match, p1, p2) {
              var fakeVarName = "animation" + matched.length;
              matched.push("const " + fakeVarName + " = keyframes`" + p2.replace(/^@keyframes animation-\w+/, '') + "`");
              return "${" + fakeVarName + "}";
            });

            if (matched.length) {
              console.error('`keyframes` output got interpolated into plain string, please wrap it with `css`.\n\n' + 'Instead of doing this:\n\n' + [].concat(matched, ["`" + replaced + "`"]).join('\n') + '\n\nYou should wrap it with `css` like this:\n\n' + ("css`" + replaced + "`"));
            }
          }

          break;
      } // finalize string values (regular strings and functions interpolated into css calls)


      if (registered == null) {
        return interpolation;
      }

      var cached = registered[interpolation];
      return cached !== undefined ? cached : interpolation;
    }

    function createStringFromObject(mergedProps, registered, obj) {
      var string = '';

      if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          string += handleInterpolation(mergedProps, registered, obj[i]) + ";";
        }
      } else {
        for (var _key in obj) {
          var value = obj[_key];

          if (typeof value !== 'object') {
            if (registered != null && registered[value] !== undefined) {
              string += _key + "{" + registered[value] + "}";
            } else if (isProcessableValue(value)) {
              string += processStyleName(_key) + ":" + processStyleValue(_key, value) + ";";
            }
          } else {
            if (_key === 'NO_COMPONENT_SELECTOR' && process.env.NODE_ENV !== 'production') {
              throw new Error('Component selectors can only be used in conjunction with @emotion/babel-plugin.');
            }

            if (Array.isArray(value) && typeof value[0] === 'string' && (registered == null || registered[value[0]] === undefined)) {
              for (var _i = 0; _i < value.length; _i++) {
                if (isProcessableValue(value[_i])) {
                  string += processStyleName(_key) + ":" + processStyleValue(_key, value[_i]) + ";";
                }
              }
            } else {
              var interpolated = handleInterpolation(mergedProps, registered, value);

              switch (_key) {
                case 'animation':
                case 'animationName':
                  {
                    string += processStyleName(_key) + ":" + interpolated + ";";
                    break;
                  }

                default:
                  {
                    if (process.env.NODE_ENV !== 'production' && _key === 'undefined') {
                      console.error(UNDEFINED_AS_OBJECT_KEY_ERROR);
                    }

                    string += _key + "{" + interpolated + "}";
                  }
              }
            }
          }
        }
      }

      return string;
    }

    var labelPattern = /label:\s*([^\s;\n{]+)\s*(;|$)/g;
    var sourceMapPattern;

    if (process.env.NODE_ENV !== 'production') {
      sourceMapPattern = /\/\*#\ssourceMappingURL=data:application\/json;\S+\s+\*\//g;
    } // this is the cursor for keyframes
    // keyframes are stored on the SerializedStyles object as a linked list


    var cursor;
    var serializeStyles = function serializeStyles(args, registered, mergedProps) {
      if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && args[0].styles !== undefined) {
        return args[0];
      }

      var stringMode = true;
      var styles = '';
      cursor = undefined;
      var strings = args[0];

      if (strings == null || strings.raw === undefined) {
        stringMode = false;
        styles += handleInterpolation(mergedProps, registered, strings);
      } else {
        if (process.env.NODE_ENV !== 'production' && strings[0] === undefined) {
          console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
        }

        styles += strings[0];
      } // we start at 1 since we've already handled the first arg


      for (var i = 1; i < args.length; i++) {
        styles += handleInterpolation(mergedProps, registered, args[i]);

        if (stringMode) {
          if (process.env.NODE_ENV !== 'production' && strings[i] === undefined) {
            console.error(ILLEGAL_ESCAPE_SEQUENCE_ERROR);
          }

          styles += strings[i];
        }
      }

      var sourceMap;

      if (process.env.NODE_ENV !== 'production') {
        styles = styles.replace(sourceMapPattern, function (match) {
          sourceMap = match;
          return '';
        });
      } // using a global regex with .exec is stateful so lastIndex has to be reset each time


      labelPattern.lastIndex = 0;
      var identifierName = '';
      var match; // https://esbench.com/bench/5b809c2cf2949800a0f61fb5

      while ((match = labelPattern.exec(styles)) !== null) {
        identifierName += '-' + // $FlowFixMe we know it's not null
        match[1];
      }

      var name = murmur2(styles) + identifierName;

      if (process.env.NODE_ENV !== 'production') {
        // $FlowFixMe SerializedStyles type doesn't have toString property (and we don't want to add it)
        return {
          name: name,
          styles: styles,
          map: sourceMap,
          next: cursor,
          toString: function toString() {
            return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop).";
          }
        };
      }

      return {
        name: name,
        styles: styles,
        next: cursor
      };
    };

    var isBrowser = typeof document !== 'undefined';
    function getRegisteredStyles(registered, registeredStyles, classNames) {
      var rawClassName = '';
      classNames.split(' ').forEach(function (className) {
        if (registered[className] !== undefined) {
          registeredStyles.push(registered[className] + ";");
        } else {
          rawClassName += className + " ";
        }
      });
      return rawClassName;
    }
    var insertStyles = function insertStyles(cache, serialized, isStringTag) {
      var className = cache.key + "-" + serialized.name;

      if ( // we only need to add the styles to the registered cache if the
      // class name could be used further down
      // the tree but if it's a string tag, we know it won't
      // so we don't have to add it to registered cache.
      // this improves memory usage since we can avoid storing the whole style string
      (isStringTag === false || // we need to always store it if we're in compat mode and
      // in node since emotion-server relies on whether a style is in
      // the registered cache to know whether a style is global or not
      // also, note that this check will be dead code eliminated in the browser
      isBrowser === false && cache.compat !== undefined) && cache.registered[className] === undefined) {
        cache.registered[className] = serialized.styles;
      }

      if (cache.inserted[serialized.name] === undefined) {
        var stylesForSSR = '';
        var current = serialized;

        do {
          var maybeStyles = cache.insert(serialized === current ? "." + className : '', current, cache.sheet, true);

          if (!isBrowser && maybeStyles !== undefined) {
            stylesForSSR += maybeStyles;
          }

          current = current.next;
        } while (current !== undefined);

        if (!isBrowser && stylesForSSR.length !== 0) {
          return stylesForSSR;
        }
      }
    };

    function insertWithoutScoping(cache, serialized) {
      if (cache.inserted[serialized.name] === undefined) {
        return cache.insert('', serialized, cache.sheet, true);
      }
    }

    function merge(registered, css, className) {
      var registeredStyles = [];
      var rawClassName = getRegisteredStyles(registered, registeredStyles, className);

      if (registeredStyles.length < 2) {
        return className;
      }

      return rawClassName + css(registeredStyles);
    }

    var createEmotion = function createEmotion(options) {
      var cache = createCache(options); // $FlowFixMe

      cache.sheet.speedy = function (value) {
        if (process.env.NODE_ENV !== 'production' && this.ctr !== 0) {
          throw new Error('speedy must be changed before any rules are inserted');
        }

        this.isSpeedy = value;
      };

      cache.compat = true;

      var css = function css() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var serialized = serializeStyles(args, cache.registered, undefined);
        insertStyles(cache, serialized, false);
        return cache.key + "-" + serialized.name;
      };

      var keyframes = function keyframes() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var serialized = serializeStyles(args, cache.registered);
        var animation = "animation-" + serialized.name;
        insertWithoutScoping(cache, {
          name: serialized.name,
          styles: "@keyframes " + animation + "{" + serialized.styles + "}"
        });
        return animation;
      };

      var injectGlobal = function injectGlobal() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        var serialized = serializeStyles(args, cache.registered);
        insertWithoutScoping(cache, serialized);
      };

      var cx = function cx() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        return merge(cache.registered, css, classnames(args));
      };

      return {
        css: css,
        cx: cx,
        injectGlobal: injectGlobal,
        keyframes: keyframes,
        hydrate: function hydrate(ids) {
          ids.forEach(function (key) {
            cache.inserted[key] = true;
          });
        },
        flush: function flush() {
          cache.registered = {};
          cache.inserted = {};
          cache.sheet.flush();
        },
        // $FlowFixMe
        sheet: cache.sheet,
        cache: cache,
        getRegisteredStyles: getRegisteredStyles.bind(null, cache.registered),
        merge: merge.bind(null, cache.registered, css)
      };
    };

    var classnames = function classnames(args) {
      var cls = '';

      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg == null) continue;
        var toAdd = void 0;

        switch (typeof arg) {
          case 'boolean':
            break;

          case 'object':
            {
              if (Array.isArray(arg)) {
                toAdd = classnames(arg);
              } else {
                toAdd = '';

                for (var k in arg) {
                  if (arg[k] && k) {
                    toAdd && (toAdd += ' ');
                    toAdd += k;
                  }
                }
              }

              break;
            }

          default:
            {
              toAdd = arg;
            }
        }

        if (toAdd) {
          cls && (cls += ' ');
          cls += toAdd;
        }
      }

      return cls;
    };

    var _createEmotion = createEmotion({
      key: 'css'
    }),
        injectGlobal = _createEmotion.injectGlobal,
        css = _createEmotion.css;

    function range(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    var noop = {value: () => {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames$1(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames$1(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get$1(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set$1(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    // Given something array like (or null), returns something that is strictly an
    // array. This is used to ensure that array-like objects passed to d3.selectAll
    // or selection.selectAll are converted into proper arrays when creating a
    // selection; we don’t ever want to create a selection backed by a live
    // HTMLCollection or NodeList. However, note that selection.selectAll will use a
    // static NodeList as a group, since it safely derived from querySelectorAll.
    function array$1(x) {
      return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function arrayAll(select) {
      return function() {
        return array$1(select.apply(this, arguments));
      };
    }

    function selection_selectAll(select) {
      if (typeof select === "function") select = arrayAll(select);
      else select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection$1(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function childMatcher(selector) {
      return function(node) {
        return node.matches(selector);
      };
    }

    var find = Array.prototype.find;

    function childFind(match) {
      return function() {
        return find.call(this.children, match);
      };
    }

    function childFirst() {
      return this.firstElementChild;
    }

    function selection_selectChild(match) {
      return this.select(match == null ? childFirst
          : childFind(typeof match === "function" ? match : childMatcher(match)));
    }

    var filter = Array.prototype.filter;

    function children() {
      return Array.from(this.children);
    }

    function childrenFilter(match) {
      return function() {
        return filter.call(this.children, match);
      };
    }

    function selection_selectChildren(match) {
      return this.selectAll(match == null ? children
          : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant$2(x) {
      return function() {
        return x;
      };
    }

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = new Map,
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
          if (nodeByKeyValue.has(keyValue)) {
            exit[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = key.call(parent, data[i], i, data) + "";
        if (node = nodeByKeyValue.get(keyValue)) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue.delete(keyValue);
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
          exit[i] = node;
        }
      }
    }

    function datum(node) {
      return node.__data__;
    }

    function selection_data(value, key) {
      if (!arguments.length) return Array.from(this, datum);

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant$2(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection$1(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    // Given some data, this returns an array-like view of it: an object that
    // exposes a length property and allows numeric indexing. Note that unlike
    // selectAll, this isn’t worried about “live” collections because the resulting
    // array will only be used briefly while data is being bound. (It is possible to
    // cause the data to change while iterating by using a key function, but please
    // don’t; we’d rather avoid a gratuitous copy.)
    function arraylike(data) {
      return typeof data === "object" && "length" in data
        ? data // Array, TypedArray, NodeList, array-like
        : Array.from(data); // Map, Set, iterable, string, or anything else
    }

    function selection_exit() {
      return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      if (typeof onenter === "function") {
        enter = onenter(enter);
        if (enter) enter = enter.selection();
      } else {
        enter = enter.append(onenter + "");
      }
      if (onupdate != null) {
        update = onupdate(update);
        if (update) update = update.selection();
      }
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(context) {
      var selection = context.selection ? context.selection() : context;

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection$1(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending$1;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection$1(sortgroups, this._parents).order();
    }

    function ascending$1(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      return Array.from(this);
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      let size = 0;
      for (const node of this) ++size; // eslint-disable-line no-unused-vars
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS$1(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction$1(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS$1(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction$1(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove$1 : typeof value === "function"
                ? styleFunction$1
                : styleConstant$1)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction$1
              : textConstant$1)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    function contextListener(listener) {
      return function(event) {
        listener.call(this, event, this.__data__);
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, options) {
      return function() {
        var on = this.__on, o, listener = contextListener(value);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, options);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, options) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    function* selection_iterator() {
      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) yield node;
        }
      }
    }

    var root = [null];

    function Selection$1(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection$1([[document.documentElement]], root);
    }

    function selection_selection() {
      return this;
    }

    Selection$1.prototype = selection.prototype = {
      constructor: Selection$1,
      select: selection_select,
      selectAll: selection_selectAll,
      selectChild: selection_selectChild,
      selectChildren: selection_selectChildren,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      selection: selection_selection,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch,
      [Symbol.iterator]: selection_iterator
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
          : new Selection$1([[selector]], root);
    }

    function selectAll(selector) {
      return typeof selector === "string"
          ? new Selection$1([document.querySelectorAll(selector)], [document.documentElement])
          : new Selection$1([array$1(selector)], root);
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant$1 = x => () => x;

    function linear$2(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear$2(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate$1(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate$1(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    var degrees = 180 / Math.PI;

    var identity$3 = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var svgNode;

    /* eslint-disable no-undef */
    function parseCss(value) {
      const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
      return m.isIdentity ? identity$3 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    function parseSvg(value) {
      if (value == null) return identity$3;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity$3;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var frame = 0, // is an animation frame pending?
        timeout$1 = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout$1 = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout$1) timeout$1 = clearTimeout(timeout$1);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(elapsed => {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init(node, id) {
      var schedule = get(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set(node, id) {
      var schedule = get(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get(node, id).value[name];
      };
    }

    function interpolate(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
          : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get(this.node(), id).ease;
    }

    function easeVarying(id, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (typeof v !== "function") throw new Error;
        set(this, id).ease = v;
      };
    }

    function transition_easeVarying(value) {
      if (typeof value !== "function") throw new Error;
      return this.each(easeVarying(this._id, value));
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init : set;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection = selection.prototype.constructor;

    function transition_selection() {
      return new Selection(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction(tweenValue(this, "text", value))
          : textConstant(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });

        // The selection was empty, resolve end immediately
        if (size === 0) resolve();
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      selectChild: selection_prototype.selectChild,
      selectChildren: selection_prototype.selectChildren,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      easeVarying: transition_easeVarying,
      end: transition_end,
      [Symbol.iterator]: selection_prototype[Symbol.iterator]
    };

    const linear$1 = t => +t;

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          throw new Error(`transition ${id} not found`);
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    const pi$1 = Math.PI,
        tau$1 = 2 * pi$1,
        epsilon$1 = 1e-6,
        tauEpsilon = tau$1 - epsilon$1;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon$1));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi$1 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon$1) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau$1 + tau$1;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon$1) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi$1)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number$1(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    bisector(number$1).center;

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        let r0 = Math.round(start / step), r1 = Math.round(stop / step);
        if (r0 * step < start) ++r0;
        if (r1 * step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) * step;
      } else {
        step = -step;
        let r0 = Math.round(start * step), r1 = Math.round(stop * step);
        if (r0 / step < start) ++r0;
        if (r1 / step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number(x) {
      return +x;
    }

    var unit$1 = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit$1,
          range = unit$1,
          interpolate = interpolate$1,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity$1, identity$1),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity$1, identity$1)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function constant(x) {
      return function constant() {
        return x;
      };
    }

    var abs = Math.abs;
    var atan2 = Math.atan2;
    var cos = Math.cos;
    var max = Math.max;
    var min = Math.min;
    var sin = Math.sin;
    var sqrt = Math.sqrt;

    var epsilon = 1e-12;
    var pi = Math.PI;
    var halfPi = pi / 2;
    var tau = 2 * pi;

    function acos(x) {
      return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
    }

    function asin(x) {
      return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
    }

    function arcInnerRadius(d) {
      return d.innerRadius;
    }

    function arcOuterRadius(d) {
      return d.outerRadius;
    }

    function arcStartAngle(d) {
      return d.startAngle;
    }

    function arcEndAngle(d) {
      return d.endAngle;
    }

    function arcPadAngle(d) {
      return d && d.padAngle; // Note: optional!
    }

    function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
      var x10 = x1 - x0, y10 = y1 - y0,
          x32 = x3 - x2, y32 = y3 - y2,
          t = y32 * x10 - x32 * y10;
      if (t * t < epsilon) return;
      t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
      return [x0 + t * x10, y0 + t * y10];
    }

    // Compute perpendicular offset line of length rc.
    // http://mathworld.wolfram.com/Circle-LineIntersection.html
    function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
      var x01 = x0 - x1,
          y01 = y0 - y1,
          lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
          ox = lo * y01,
          oy = -lo * x01,
          x11 = x0 + ox,
          y11 = y0 + oy,
          x10 = x1 + ox,
          y10 = y1 + oy,
          x00 = (x11 + x10) / 2,
          y00 = (y11 + y10) / 2,
          dx = x10 - x11,
          dy = y10 - y11,
          d2 = dx * dx + dy * dy,
          r = r1 - rc,
          D = x11 * y10 - x10 * y11,
          d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
          cx0 = (D * dy - dx * d) / d2,
          cy0 = (-D * dx - dy * d) / d2,
          cx1 = (D * dy + dx * d) / d2,
          cy1 = (-D * dx + dy * d) / d2,
          dx0 = cx0 - x00,
          dy0 = cy0 - y00,
          dx1 = cx1 - x00,
          dy1 = cy1 - y00;

      // Pick the closer of the two intersection points.
      // TODO Is there a faster way to determine which intersection to use?
      if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

      return {
        cx: cx0,
        cy: cy0,
        x01: -ox,
        y01: -oy,
        x11: cx0 * (r1 / r - 1),
        y11: cy0 * (r1 / r - 1)
      };
    }

    function arc() {
      var innerRadius = arcInnerRadius,
          outerRadius = arcOuterRadius,
          cornerRadius = constant(0),
          padRadius = null,
          startAngle = arcStartAngle,
          endAngle = arcEndAngle,
          padAngle = arcPadAngle,
          context = null;

      function arc() {
        var buffer,
            r,
            r0 = +innerRadius.apply(this, arguments),
            r1 = +outerRadius.apply(this, arguments),
            a0 = startAngle.apply(this, arguments) - halfPi,
            a1 = endAngle.apply(this, arguments) - halfPi,
            da = abs(a1 - a0),
            cw = a1 > a0;

        if (!context) context = buffer = path();

        // Ensure that the outer radius is always larger than the inner radius.
        if (r1 < r0) r = r1, r1 = r0, r0 = r;

        // Is it a point?
        if (!(r1 > epsilon)) context.moveTo(0, 0);

        // Or is it a circle or annulus?
        else if (da > tau - epsilon) {
          context.moveTo(r1 * cos(a0), r1 * sin(a0));
          context.arc(0, 0, r1, a0, a1, !cw);
          if (r0 > epsilon) {
            context.moveTo(r0 * cos(a1), r0 * sin(a1));
            context.arc(0, 0, r0, a1, a0, cw);
          }
        }

        // Or is it a circular or annular sector?
        else {
          var a01 = a0,
              a11 = a1,
              a00 = a0,
              a10 = a1,
              da0 = da,
              da1 = da,
              ap = padAngle.apply(this, arguments) / 2,
              rp = (ap > epsilon) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
              rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
              rc0 = rc,
              rc1 = rc,
              t0,
              t1;

          // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
          if (rp > epsilon) {
            var p0 = asin(rp / r0 * sin(ap)),
                p1 = asin(rp / r1 * sin(ap));
            if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
            else da0 = 0, a00 = a10 = (a0 + a1) / 2;
            if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
            else da1 = 0, a01 = a11 = (a0 + a1) / 2;
          }

          var x01 = r1 * cos(a01),
              y01 = r1 * sin(a01),
              x10 = r0 * cos(a10),
              y10 = r0 * sin(a10);

          // Apply rounded corners?
          if (rc > epsilon) {
            var x11 = r1 * cos(a11),
                y11 = r1 * sin(a11),
                x00 = r0 * cos(a00),
                y00 = r0 * sin(a00),
                oc;

            // Restrict the corner radius according to the sector angle.
            if (da < pi && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
              var ax = x01 - oc[0],
                  ay = y01 - oc[1],
                  bx = x11 - oc[0],
                  by = y11 - oc[1],
                  kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
                  lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
              rc0 = min(rc, (r0 - lc) / (kc - 1));
              rc1 = min(rc, (r1 - lc) / (kc + 1));
            }
          }

          // Is the sector collapsed to a line?
          if (!(da1 > epsilon)) context.moveTo(x01, y01);

          // Does the sector’s outer ring have rounded corners?
          else if (rc1 > epsilon) {
            t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
            t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

            context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
              context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the outer ring just a circular arc?
          else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

          // Is there no inner ring, and it’s a circular sector?
          // Or perhaps it’s an annular sector collapsed due to padding?
          if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);

          // Does the sector’s inner ring (or point) have rounded corners?
          else if (rc0 > epsilon) {
            t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
            t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

            context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

            // Have the corners merged?
            if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

            // Otherwise, draw the two corners and the ring.
            else {
              context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
              context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
              context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
            }
          }

          // Or is the inner ring just a circular arc?
          else context.arc(0, 0, r0, a10, a00, cw);
        }

        context.closePath();

        if (buffer) return context = null, buffer + "" || null;
      }

      arc.centroid = function() {
        var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
            a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
        return [cos(a) * r, sin(a) * r];
      };

      arc.innerRadius = function(_) {
        return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
      };

      arc.outerRadius = function(_) {
        return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
      };

      arc.cornerRadius = function(_) {
        return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
      };

      arc.padRadius = function(_) {
        return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
      };

      arc.startAngle = function(_) {
        return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
      };

      arc.endAngle = function(_) {
        return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
      };

      arc.padAngle = function(_) {
        return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
      };

      arc.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), arc) : context;
      };

      return arc;
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // falls through
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function line(x$1, y$1) {
      var defined = constant(true),
          context = null,
          curve = curveLinear,
          output = null;

      x$1 = typeof x$1 === "function" ? x$1 : (x$1 === undefined) ? x : constant(x$1);
      y$1 = typeof y$1 === "function" ? y$1 : (y$1 === undefined) ? y : constant(y$1);

      function line(data) {
        var i,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), line) : x$1;
      };

      line.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), line) : y$1;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

    const identity = v => v;


    function appendId(typ) {
        return typ + (++appendId.nextId).toString(36);
    }
    appendId.nextId = 0;


    function stylable(f) {
        var kls = [],
            style;

        f.stylable = function (selection) {
            if (kls.length) selection.attr('class', f.class());
            if (style) selection.attr('style', f.style());
        };
        f.css = function(_) {
            return arguments.length ? (kls.push(css(_)), f) : kls.join(' ');
        };
        f.class = function(_) {
            return arguments.length ? (kls = kls.concat(_.split(' ')), f) : kls.join(' ');
        };
        f.style = function(_) {
            return arguments.length ? (style = _, f): style;
        };
        return f;
    }


    function transformable(f) {
        var x=0, y=0, scalex=1, scaley=1, rotate=0;

        f.transformable = function(selection) {
            selection.attr('transform', `translate(${x}, ${y}) rotate(${rotate}) scale(${scalex}, ${scaley})`);
        };
        f.x = function(_) {
            return arguments.length ? (x = _, f) : x;
        };
        f.y = function(_) {
            return arguments.length ? (y = _, f) : y;
        };
        f.scale = function(x, y) {
            return arguments.length ? (scalex = x, scaley = y ?? x, f) : [scalex, scaley];
        };
        f.rotate = function(_) {
            return arguments.length ? (rotate = _, f) : rotate;
        };
        return f;
    }


    function interactable(f) {
        var handlers = {};

        f.interactable = function(selection, ...args) {
            Object.entries(handlers).map(([type, v]) => {
                let [handler, opts] = v;
                selection.on(type, (e) => handler(e, ...args), opts);
            });
        };
        f.on = function(type, handler, opts) {
            return arguments.length ? (handlers[type] = [handler, opts], f): handlers;
        };
        return f;
    }


    function appendable(f) {
        var defs = [],
            kids = [];

        f.appendable = function(sel, g) {
            if (defs.length) {
                let _ = select(sel.node().ownerSVGElement).select('defs');
                if (_.empty()) throw "Couldn't find svg defs element"
                _.selectAll(null)
                    .data(defs)
                  .enter().each(function(d) { select(this).call(d, g);});
            }
            sel.selectAll(null)
                .data(kids)
              .enter().each(function(d) { select(this).call(d, g); });
        };
        f.defs = function(..._) {
            return arguments.length ? (defs = defs.concat(_), f) : defs;
        };
        f.append = function(..._) {
            return arguments.length ? (kids = kids.concat(_), f) : kids;
        };
        return f;
    }

    var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
    /**
     * Represents a conversion path
     */
    var Converter = /** @class */ (function () {
        function Converter(measures, value) {
            this.val = 0;
            this.destination = null;
            this.origin = null;
            if (typeof value === 'number') {
                this.val = value;
            }
            if (typeof measures !== 'object') {
                throw new Error('Measures cannot be blank');
            }
            this.measureData = measures;
        }
        /**
         * Lets the converter know the source unit abbreviation
         */
        Converter.prototype.from = function (from) {
            if (this.destination != null)
                throw new Error('.from must be called before .to');
            this.origin = this.getUnit(from);
            if (this.origin == null) {
                this.throwUnsupportedUnitError(from);
            }
            return this;
        };
        /**
         * Converts the unit and returns the value
         */
        Converter.prototype.to = function (to) {
            var _a, _b;
            if (this.origin == null)
                throw new Error('.to must be called after .from');
            this.destination = this.getUnit(to);
            if (this.destination == null) {
                this.throwUnsupportedUnitError(to);
            }
            var destination = this.destination;
            var origin = this.origin;
            // Don't change the value if origin and destination are the same
            if (origin.abbr === destination.abbr) {
                return this.val;
            }
            // You can't go from liquid to mass, for example
            if (destination.measure != origin.measure) {
                throw new Error("Cannot convert incompatible measures of " + destination.measure + " and " + origin.measure);
            }
            /**
             * Convert from the source value to its anchor inside the system
             */
            var result = this.val * origin.unit.to_anchor;
            /**
             * For some changes it's a simple shift (C to K)
             * So we'll add it when convering into the unit (later)
             * and subtract it when converting from the unit
             */
            if (origin.unit.anchor_shift) {
                result -= origin.unit.anchor_shift;
            }
            /**
             * Convert from one system to another through the anchor ratio. Some conversions
             * aren't ratio based or require more than a simple shift. We can provide a custom
             * transform here to provide the direct result
             */
            if (origin.system != destination.system) {
                var measure = this.measureData[origin.measure];
                var anchors = measure.anchors;
                if (anchors == null) {
                    throw new Error("Unable to convert units. Anchors are missing for \"" + origin.measure + "\" and \"" + destination.measure + "\" measures.");
                }
                var anchor = anchors[origin.system];
                if (anchor == null) {
                    throw new Error("Unable to find anchor for \"" + origin.measure + "\" to \"" + destination.measure + "\". Please make sure it is defined.");
                }
                var transform = (_a = anchor[destination.system]) === null || _a === void 0 ? void 0 : _a.transform;
                var ratio = (_b = anchor[destination.system]) === null || _b === void 0 ? void 0 : _b.ratio;
                if (typeof transform === 'function') {
                    result = transform(result);
                }
                else if (typeof ratio === 'number') {
                    result *= ratio;
                }
                else {
                    throw new Error('A system anchor needs to either have a defined ratio number or a transform function.');
                }
            }
            /**
             * This shift has to be done after the system conversion business
             */
            if (destination.unit.anchor_shift) {
                result += destination.unit.anchor_shift;
            }
            /**
             * Convert to another unit inside the destination system
             */
            return result / destination.unit.to_anchor;
        };
        /**
         * Converts the unit to the best available unit.
         */
        Converter.prototype.toBest = function (options) {
            var _a, _b, _c;
            if (this.origin == null)
                throw new Error('.toBest must be called after .from');
            var exclude = [];
            var cutOffNumber = 1;
            var system = this.origin.system;
            if (typeof options === 'object') {
                exclude = (_a = options.exclude) !== null && _a !== void 0 ? _a : [];
                cutOffNumber = (_b = options.cutOffNumber) !== null && _b !== void 0 ? _b : 1;
                system = (_c = options.system) !== null && _c !== void 0 ? _c : this.origin.system;
            }
            var best = null;
            /**
              Looks through every possibility for the 'best' available unit.
              i.e. Where the value has the fewest numbers before the decimal point,
              but is still higher than 1.
            */
            for (var _i = 0, _d = this.possibilities(); _i < _d.length; _i++) {
                var possibility = _d[_i];
                var unit = this.describe(possibility);
                var isIncluded = exclude.indexOf(possibility) === -1;
                if (isIncluded && unit.system === system) {
                    var result = this.to(possibility);
                    if (result < cutOffNumber) {
                        continue;
                    }
                    if (best == null || (result >= cutOffNumber && result < best.val)) {
                        best = {
                            val: result,
                            unit: possibility,
                            singular: unit.singular,
                            plural: unit.plural,
                        };
                    }
                }
            }
            return best;
        };
        /**
         * Finds the unit
         */
        Converter.prototype.getUnit = function (abbr) {
            var found = null;
            for (var _i = 0, _a = Object.entries(this.measureData); _i < _a.length; _i++) {
                var _b = _a[_i], measureName = _b[0], measure = _b[1];
                for (var _c = 0, _d = Object.entries(measure.systems); _c < _d.length; _c++) {
                    var _e = _d[_c], systemName = _e[0], system = _e[1];
                    for (var _f = 0, _g = Object.entries(system); _f < _g.length; _f++) {
                        var _h = _g[_f], testAbbr = _h[0], unit = _h[1];
                        if (testAbbr == abbr) {
                            return {
                                abbr: abbr,
                                measure: measureName,
                                system: systemName,
                                unit: unit,
                            };
                        }
                    }
                }
            }
            return found;
        };
        /**
         * An alias for getUnit
         */
        Converter.prototype.describe = function (abbr) {
            var result = this.getUnit(abbr);
            if (result != null) {
                return this.describeUnit(result);
            }
            this.throwUnsupportedUnitError(abbr);
        };
        Converter.prototype.describeUnit = function (unit) {
            return {
                abbr: unit.abbr,
                measure: unit.measure,
                system: unit.system,
                singular: unit.unit.name.singular,
                plural: unit.unit.name.plural,
            };
        };
        /**
         * Detailed list of all supported units
         *
         * If a measure is supplied the list will only contain
         * details about that measure. Otherwise the list will contain
         * details abaout all measures.
         *
         * However, if the measure doesn't exist, an empty array will be
         * returned
         *
         */
        Converter.prototype.list = function (measureName) {
            var list = [];
            if (measureName == null) {
                for (var _i = 0, _a = Object.entries(this.measureData); _i < _a.length; _i++) {
                    var _b = _a[_i], name_1 = _b[0], measure = _b[1];
                    for (var _c = 0, _d = Object.entries(measure.systems); _c < _d.length; _c++) {
                        var _e = _d[_c], systemName = _e[0], units = _e[1];
                        for (var _f = 0, _g = Object.entries(units); _f < _g.length; _f++) {
                            var _h = _g[_f], abbr = _h[0], unit = _h[1];
                            list.push(this.describeUnit({
                                abbr: abbr,
                                measure: name_1,
                                system: systemName,
                                unit: unit,
                            }));
                        }
                    }
                }
            }
            else if (!(measureName in this.measureData)) {
                throw new Error("Meausre \"" + measureName + "\" not found.");
            }
            else {
                var measure = this.measureData[measureName];
                for (var _j = 0, _k = Object.entries(measure.systems); _j < _k.length; _j++) {
                    var _l = _k[_j], systemName = _l[0], units = _l[1];
                    for (var _m = 0, _o = Object.entries(units); _m < _o.length; _m++) {
                        var _p = _o[_m], abbr = _p[0], unit = _p[1];
                        list.push(this.describeUnit({
                            abbr: abbr,
                            measure: measureName,
                            system: systemName,
                            unit: unit,
                        }));
                    }
                }
            }
            return list;
        };
        Converter.prototype.throwUnsupportedUnitError = function (what) {
            var validUnits = [];
            for (var _i = 0, _a = Object.values(this.measureData); _i < _a.length; _i++) {
                var measure = _a[_i];
                for (var _b = 0, _c = Object.values(measure.systems); _b < _c.length; _b++) {
                    var systems = _c[_b];
                    validUnits = validUnits.concat(Object.keys(systems));
                }
            }
            throw new Error("Unsupported unit " + what + ", use one of: " + validUnits.join(', '));
        };
        /**
         * Returns the abbreviated measures that the value can be
         * converted to.
         */
        Converter.prototype.possibilities = function (forMeasure) {
            var possibilities = [];
            var list_measures = [];
            if (typeof forMeasure == 'string') {
                list_measures.push(forMeasure);
            }
            else if (this.origin != null) {
                list_measures.push(this.origin.measure);
            }
            else {
                list_measures = Object.keys(this.measureData);
            }
            for (var _i = 0, list_measures_1 = list_measures; _i < list_measures_1.length; _i++) {
                var measure = list_measures_1[_i];
                var systems = this.measureData[measure].systems;
                for (var _a = 0, _b = Object.values(systems); _a < _b.length; _a++) {
                    var system = _b[_a];
                    possibilities = __spreadArray(__spreadArray([], possibilities, true), Object.keys(system), true);
                }
            }
            return possibilities;
        };
        /**
         * Returns the abbreviated measures that the value can be
         * converted to.
         */
        Converter.prototype.measures = function () {
            return Object.keys(this.measureData);
        };
        return Converter;
    }());
    function configMeasurements (measures) {
        return function (value) {
            return new Converter(measures, value);
        };
    }

    var metric$c = {
        'g-force': {
            name: {
                singular: 'g-force',
                plural: 'g-forces',
            },
            to_anchor: 9.80665,
        },
        'm/s2': {
            name: {
                singular: 'Metre per second squared',
                plural: 'Metres per second squared',
            },
            to_anchor: 1,
        },
    };
    var measure$q = {
        systems: {
            metric: metric$c,
        },
    };

    var SI$b = {
        rad: {
            name: {
                singular: 'radian',
                plural: 'radians',
            },
            to_anchor: 180 / Math.PI,
        },
        deg: {
            name: {
                singular: 'degree',
                plural: 'degrees',
            },
            to_anchor: 1,
        },
        grad: {
            name: {
                singular: 'gradian',
                plural: 'gradians',
            },
            to_anchor: 9 / 10,
        },
        arcmin: {
            name: {
                singular: 'arcminute',
                plural: 'arcminutes',
            },
            to_anchor: 1 / 60,
        },
        arcsec: {
            name: {
                singular: 'arcsecond',
                plural: 'arcseconds',
            },
            to_anchor: 1 / 3600,
        },
    };
    var measure$p = {
        systems: {
            SI: SI$b,
        },
    };

    var SI$a = {
        VA: {
            name: {
                singular: 'Volt-Ampere',
                plural: 'Volt-Amperes',
            },
            to_anchor: 1,
        },
        mVA: {
            name: {
                singular: 'Millivolt-Ampere',
                plural: 'Millivolt-Amperes',
            },
            to_anchor: 0.001,
        },
        kVA: {
            name: {
                singular: 'Kilovolt-Ampere',
                plural: 'Kilovolt-Amperes',
            },
            to_anchor: 1000,
        },
        MVA: {
            name: {
                singular: 'Megavolt-Ampere',
                plural: 'Megavolt-Amperes',
            },
            to_anchor: 1000000,
        },
        GVA: {
            name: {
                singular: 'Gigavolt-Ampere',
                plural: 'Gigavolt-Amperes',
            },
            to_anchor: 1000000000,
        },
    };
    var measure$o = {
        systems: {
            SI: SI$a,
        },
    };

    var metric$b = {
        nm2: {
            name: {
                singular: 'Square Nanometer',
                plural: 'Square Nanometers',
            },
            to_anchor: 1e-18,
        },
        μm2: {
            name: {
                singular: 'Square Micrometer',
                plural: 'Square Micrometers',
            },
            to_anchor: 1e-12,
        },
        mm2: {
            name: {
                singular: 'Square Millimeter',
                plural: 'Square Millimeters',
            },
            to_anchor: 1 / 1000000,
        },
        cm2: {
            name: {
                singular: 'Square Centimeter',
                plural: 'Square Centimeters',
            },
            to_anchor: 1 / 10000,
        },
        m2: {
            name: {
                singular: 'Square Meter',
                plural: 'Square Meters',
            },
            to_anchor: 1,
        },
        ha: {
            name: {
                singular: 'Hectare',
                plural: 'Hectares',
            },
            to_anchor: 10000,
        },
        km2: {
            name: {
                singular: 'Square Kilometer',
                plural: 'Square Kilometers',
            },
            to_anchor: 1000000,
        },
    };
    var imperial$a = {
        in2: {
            name: {
                singular: 'Square Inch',
                plural: 'Square Inches',
            },
            to_anchor: 1 / 144,
        },
        yd2: {
            name: {
                singular: 'Square Yard',
                plural: 'Square Yards',
            },
            to_anchor: 9,
        },
        ft2: {
            name: {
                singular: 'Square Foot',
                plural: 'Square Feet',
            },
            to_anchor: 1,
        },
        ac: {
            name: {
                singular: 'Acre',
                plural: 'Acres',
            },
            to_anchor: 43560,
        },
        mi2: {
            name: {
                singular: 'Square Mile',
                plural: 'Square Miles',
            },
            to_anchor: 27878400,
        },
    };
    var measure$n = {
        systems: {
            metric: metric$b,
            imperial: imperial$a,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 10.7639,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 10.7639,
                },
            },
        },
    };

    var SI$9 = {
        c: {
            name: {
                singular: 'Coulomb',
                plural: 'Coulombs',
            },
            to_anchor: 1,
        },
        mC: {
            name: {
                singular: 'Millicoulomb',
                plural: 'Millicoulombs',
            },
            to_anchor: 1 / 1000,
        },
        μC: {
            name: {
                singular: 'Microcoulomb',
                plural: 'Microcoulombs',
            },
            to_anchor: 1 / 1000000,
        },
        nC: {
            name: {
                singular: 'Nanocoulomb',
                plural: 'Nanocoulombs',
            },
            to_anchor: 1e-9,
        },
        pC: {
            name: {
                singular: 'Picocoulomb',
                plural: 'Picocoulombs',
            },
            to_anchor: 1e-12,
        },
    };
    var measure$m = {
        systems: {
            SI: SI$9,
        },
    };

    var SI$8 = {
        A: {
            name: {
                singular: 'Ampere',
                plural: 'Amperes',
            },
            to_anchor: 1,
        },
        mA: {
            name: {
                singular: 'Milliampere',
                plural: 'Milliamperes',
            },
            to_anchor: 0.001,
        },
        kA: {
            name: {
                singular: 'Kiloampere',
                plural: 'Kiloamperes',
            },
            to_anchor: 1000,
        },
    };
    var measure$l = {
        systems: {
            SI: SI$8,
        },
    };

    var bits = {
        b: {
            name: {
                singular: 'Bit',
                plural: 'Bits',
            },
            to_anchor: 1,
        },
        Kb: {
            name: {
                singular: 'Kilobit',
                plural: 'Kilobits',
            },
            to_anchor: 1024,
        },
        Mb: {
            name: {
                singular: 'Megabit',
                plural: 'Megabits',
            },
            to_anchor: 1048576,
        },
        Gb: {
            name: {
                singular: 'Gigabit',
                plural: 'Gigabits',
            },
            to_anchor: 1073741824,
        },
        Tb: {
            name: {
                singular: 'Terabit',
                plural: 'Terabits',
            },
            to_anchor: 1099511627776,
        },
    };
    var bytes = {
        B: {
            name: {
                singular: 'Byte',
                plural: 'Bytes',
            },
            to_anchor: 1,
        },
        KB: {
            name: {
                singular: 'Kilobyte',
                plural: 'Kilobytes',
            },
            to_anchor: 1024,
        },
        MB: {
            name: {
                singular: 'Megabyte',
                plural: 'Megabytes',
            },
            to_anchor: 1048576,
        },
        GB: {
            name: {
                singular: 'Gigabyte',
                plural: 'Gigabytes',
            },
            to_anchor: 1073741824,
        },
        TB: {
            name: {
                singular: 'Terabyte',
                plural: 'Terabytes',
            },
            to_anchor: 1099511627776,
        },
    };
    var measure$k = {
        systems: {
            bits: bits,
            bytes: bytes,
        },
        anchors: {
            bits: {
                bytes: {
                    ratio: 1 / 8,
                },
            },
            bytes: {
                bits: {
                    ratio: 8,
                },
            },
        },
    };

    var metric$a = {
        ea: {
            name: {
                singular: 'Each',
                plural: 'Each',
            },
            to_anchor: 1,
        },
        dz: {
            name: {
                singular: 'Dozen',
                plural: 'Dozens',
            },
            to_anchor: 12,
        },
    };
    var measure$j = {
        systems: {
            metric: metric$a,
        },
    };

    var SI$7 = {
        Wh: {
            name: {
                singular: 'Watt-hour',
                plural: 'Watt-hours',
            },
            to_anchor: 3600,
        },
        mWh: {
            name: {
                singular: 'Milliwatt-hour',
                plural: 'Milliwatt-hours',
            },
            to_anchor: 3.6,
        },
        kWh: {
            name: {
                singular: 'Kilowatt-hour',
                plural: 'Kilowatt-hours',
            },
            to_anchor: 3600000,
        },
        MWh: {
            name: {
                singular: 'Megawatt-hour',
                plural: 'Megawatt-hours',
            },
            to_anchor: 3600000000,
        },
        GWh: {
            name: {
                singular: 'Gigawatt-hour',
                plural: 'Gigawatt-hours',
            },
            to_anchor: 3600000000000,
        },
        J: {
            name: {
                singular: 'Joule',
                plural: 'Joules',
            },
            to_anchor: 1,
        },
        kJ: {
            name: {
                singular: 'Kilojoule',
                plural: 'Kilojoules',
            },
            to_anchor: 1000,
        },
    };
    var measure$i = {
        systems: {
            SI: SI$7,
        },
    };

    var SI$6 = {
        N: {
            name: {
                singular: 'Newton',
                plural: 'Newtons',
            },
            to_anchor: 1,
        },
        kN: {
            name: {
                singular: 'Kilonewton',
                plural: 'Kilonewtons',
            },
            to_anchor: 1000,
        },
        lbf: {
            name: {
                singular: 'Pound-force',
                plural: 'Pound-forces',
            },
            to_anchor: 4.44822,
        },
    };
    var measure$h = {
        systems: {
            SI: SI$6,
        },
    };

    var SI$5 = {
        mHz: {
            name: {
                singular: 'millihertz',
                plural: 'millihertz',
            },
            to_anchor: 1 / 1000,
        },
        Hz: {
            name: {
                singular: 'hertz',
                plural: 'hertz',
            },
            to_anchor: 1,
        },
        kHz: {
            name: {
                singular: 'kilohertz',
                plural: 'kilohertz',
            },
            to_anchor: 1000,
        },
        MHz: {
            name: {
                singular: 'megahertz',
                plural: 'megahertz',
            },
            to_anchor: 1000 * 1000,
        },
        GHz: {
            name: {
                singular: 'gigahertz',
                plural: 'gigahertz',
            },
            to_anchor: 1000 * 1000 * 1000,
        },
        THz: {
            name: {
                singular: 'terahertz',
                plural: 'terahertz',
            },
            to_anchor: 1000 * 1000 * 1000 * 1000,
        },
        rpm: {
            name: {
                singular: 'rotation per minute',
                plural: 'rotations per minute',
            },
            to_anchor: 1 / 60,
        },
        'deg/s': {
            name: {
                singular: 'degree per second',
                plural: 'degrees per second',
            },
            to_anchor: 1 / 360,
        },
        'rad/s': {
            name: {
                singular: 'radian per second',
                plural: 'radians per second',
            },
            to_anchor: 1 / (Math.PI * 2),
        },
    };
    var measure$g = {
        systems: {
            SI: SI$5,
        },
    };

    var metric$9 = {
        lx: {
            name: {
                singular: 'Lux',
                plural: 'Lux',
            },
            to_anchor: 1,
        },
    };
    var imperial$9 = {
        'ft-cd': {
            name: {
                singular: 'Foot-candle',
                plural: 'Foot-candles',
            },
            to_anchor: 1,
        },
    };
    var measure$f = {
        systems: {
            metric: metric$9,
            imperial: imperial$9,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 1 / 10.76391,
                },
            },
            imperial: {
                metric: {
                    ratio: 10.76391,
                },
            },
        },
    };

    var metric$8 = {
        nm: {
            name: {
                singular: 'Nanometer',
                plural: 'Nanometers',
            },
            to_anchor: 1e-9,
        },
        μm: {
            name: {
                singular: 'Micrometer',
                plural: 'Micrometers',
            },
            to_anchor: 1e-6,
        },
        mm: {
            name: {
                singular: 'Millimeter',
                plural: 'Millimeters',
            },
            to_anchor: 1e-3,
        },
        cm: {
            name: {
                singular: 'Centimeter',
                plural: 'Centimeters',
            },
            to_anchor: 1e-2,
        },
        m: {
            name: {
                singular: 'Meter',
                plural: 'Meters',
            },
            to_anchor: 1,
        },
        km: {
            name: {
                singular: 'Kilometer',
                plural: 'Kilometers',
            },
            to_anchor: 1e3,
        },
    };
    var imperial$8 = {
        in: {
            name: {
                singular: 'Inch',
                plural: 'Inches',
            },
            to_anchor: 1 / 12,
        },
        yd: {
            name: {
                singular: 'Yard',
                plural: 'Yards',
            },
            to_anchor: 3,
        },
        'ft-us': {
            name: {
                singular: 'US Survey Foot',
                plural: 'US Survey Feet',
            },
            to_anchor: 1.000002,
        },
        ft: {
            name: {
                singular: 'Foot',
                plural: 'Feet',
            },
            to_anchor: 1,
        },
        fathom: {
            name: {
                singular: 'Fathom',
                plural: 'Fathoms',
            },
            to_anchor: 6,
        },
        mi: {
            name: {
                singular: 'Mile',
                plural: 'Miles',
            },
            to_anchor: 5280,
        },
        nMi: {
            name: {
                singular: 'Nautical Mile',
                plural: 'Nautical Miles',
            },
            to_anchor: 6076.12,
        },
    };
    var measure$e = {
        systems: {
            metric: metric$8,
            imperial: imperial$8,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 3.28084,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 3.28084,
                },
            },
        },
    };

    var metric$7 = {
        mcg: {
            name: {
                singular: 'Microgram',
                plural: 'Micrograms',
            },
            to_anchor: 1 / 1000000,
        },
        mg: {
            name: {
                singular: 'Milligram',
                plural: 'Milligrams',
            },
            to_anchor: 1 / 1000,
        },
        g: {
            name: {
                singular: 'Gram',
                plural: 'Grams',
            },
            to_anchor: 1,
        },
        kg: {
            name: {
                singular: 'Kilogram',
                plural: 'Kilograms',
            },
            to_anchor: 1000,
        },
        mt: {
            name: {
                singular: 'Metric Tonne',
                plural: 'Metric Tonnes',
            },
            to_anchor: 1000000,
        },
    };
    var imperial$7 = {
        oz: {
            name: {
                singular: 'Ounce',
                plural: 'Ounces',
            },
            to_anchor: 1 / 16,
        },
        lb: {
            name: {
                singular: 'Pound',
                plural: 'Pounds',
            },
            to_anchor: 1,
        },
        t: {
            name: {
                singular: 'Ton',
                plural: 'Tons',
            },
            to_anchor: 2000,
        },
    };
    var measure$d = {
        systems: {
            metric: metric$7,
            imperial: imperial$7,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 1 / 453.592,
                },
            },
            imperial: {
                metric: {
                    ratio: 453.592,
                },
            },
        },
    };

    var metric$6 = {
        'min/km': {
            name: {
                singular: 'Minute per kilometre',
                plural: 'Minutes per kilometre',
            },
            to_anchor: 0.06,
        },
        's/m': {
            name: {
                singular: 'Second per metre',
                plural: 'Seconds per metre',
            },
            to_anchor: 1,
        },
    };
    var imperial$6 = {
        'min/mi': {
            name: {
                singular: 'Minute per mile',
                plural: 'Minutes per mile',
            },
            to_anchor: 0.0113636,
        },
        's/ft': {
            name: {
                singular: 'Second per foot',
                plural: 'Seconds per foot',
            },
            to_anchor: 1,
        },
    };
    var measure$c = {
        systems: {
            metric: metric$6,
            imperial: imperial$6,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 0.3048,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 0.3048,
                },
            },
        },
    };

    var SI$4 = {
        ppm: {
            name: {
                singular: 'Part-per Million',
                plural: 'Parts-per Million',
            },
            to_anchor: 1,
        },
        ppb: {
            name: {
                singular: 'Part-per Billion',
                plural: 'Parts-per Billion',
            },
            to_anchor: 0.001,
        },
        ppt: {
            name: {
                singular: 'Part-per Trillion',
                plural: 'Parts-per Trillion',
            },
            to_anchor: 0.000001,
        },
        ppq: {
            name: {
                singular: 'Part-per Quadrillion',
                plural: 'Parts-per Quadrillion',
            },
            to_anchor: 0.000000001,
        },
    };
    var measure$b = {
        systems: {
            SI: SI$4,
        },
    };

    var unit = {
        pcs: {
            name: {
                singular: 'Piece',
                plural: 'Pieces',
            },
            to_anchor: 1,
        },
        'bk-doz': {
            name: {
                singular: 'Bakers Dozen',
                plural: 'Bakers Dozen',
            },
            to_anchor: 13,
        },
        cp: {
            name: {
                singular: 'Couple',
                plural: 'Couples',
            },
            to_anchor: 2,
        },
        'doz-doz': {
            name: {
                singular: 'Dozen Dozen',
                plural: 'Dozen Dozen',
            },
            to_anchor: 144,
        },
        doz: {
            name: {
                singular: 'Dozen',
                plural: 'Dozens',
            },
            to_anchor: 12,
        },
        'gr-gr': {
            name: {
                singular: 'Great Gross',
                plural: 'Great Gross',
            },
            to_anchor: 1728,
        },
        gros: {
            name: {
                singular: 'Gross',
                plural: 'Gross',
            },
            to_anchor: 144,
        },
        'half-dozen': {
            name: {
                singular: 'Half Dozen',
                plural: 'Half Dozen',
            },
            to_anchor: 6,
        },
        'long-hundred': {
            name: {
                singular: 'Long Hundred',
                plural: 'Long Hundred',
            },
            to_anchor: 120,
        },
        ream: {
            name: {
                singular: 'Reams',
                plural: 'Reams',
            },
            to_anchor: 500,
        },
        scores: {
            name: {
                singular: 'Scores',
                plural: 'Scores',
            },
            to_anchor: 20,
        },
        'sm-gr': {
            name: {
                singular: 'Small Gross',
                plural: 'Small Gross',
            },
            to_anchor: 120,
        },
        trio: {
            name: {
                singular: 'Trio',
                plural: 'Trio',
            },
            to_anchor: 3,
        },
    };
    var measure$a = {
        systems: {
            unit: unit,
        },
    };

    var metric$5 = {
        W: {
            name: {
                singular: 'Watt',
                plural: 'Watts',
            },
            to_anchor: 1,
        },
        mW: {
            name: {
                singular: 'Milliwatt',
                plural: 'Milliwatts',
            },
            to_anchor: 0.001,
        },
        kW: {
            name: {
                singular: 'Kilowatt',
                plural: 'Kilowatts',
            },
            to_anchor: 1000,
        },
        MW: {
            name: {
                singular: 'Megawatt',
                plural: 'Megawatts',
            },
            to_anchor: 1000000,
        },
        GW: {
            name: {
                singular: 'Gigawatt',
                plural: 'Gigawatts',
            },
            to_anchor: 1000000000,
        },
        PS: {
            name: {
                singular: 'Horsepower (metric)',
                plural: 'Horsepower (metric)',
            },
            to_anchor: 735.49875,
        },
    };
    var imperial$5 = {
        'Btu/s': {
            name: {
                singular: 'British thermal unit per second',
                plural: 'British thermal units per second',
            },
            to_anchor: 778.16937,
        },
        'ft-lb/s': {
            name: {
                singular: 'Foot-pound per second',
                plural: 'Foot-pounds per second',
            },
            to_anchor: 1,
        },
        hp: {
            name: {
                singular: 'Horsepower (British)',
                plural: 'Horsepower (British)',
            },
            to_anchor: 550,
        },
    };
    var measure$9 = {
        systems: {
            metric: metric$5,
            imperial: imperial$5,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 0.737562149,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 0.737562149,
                },
            },
        },
    };

    var metric$4 = {
        Pa: {
            name: {
                singular: 'pascal',
                plural: 'pascals',
            },
            to_anchor: 1 / 1000,
        },
        kPa: {
            name: {
                singular: 'kilopascal',
                plural: 'kilopascals',
            },
            to_anchor: 1,
        },
        MPa: {
            name: {
                singular: 'megapascal',
                plural: 'megapascals',
            },
            to_anchor: 1000,
        },
        hPa: {
            name: {
                singular: 'hectopascal',
                plural: 'hectopascals',
            },
            to_anchor: 1 / 10,
        },
        bar: {
            name: {
                singular: 'bar',
                plural: 'bar',
            },
            to_anchor: 100,
        },
        torr: {
            name: {
                singular: 'torr',
                plural: 'torr',
            },
            to_anchor: 101325 / 760000,
        },
    };
    var imperial$4 = {
        psi: {
            name: {
                singular: 'pound per square inch',
                plural: 'pounds per square inch',
            },
            to_anchor: 1 / 1000,
        },
        ksi: {
            name: {
                singular: 'kilopound per square inch',
                plural: 'kilopound per square inch',
            },
            to_anchor: 1,
        },
        inHg: {
            name: {
                singular: 'Inch of mercury',
                plural: 'Inches of mercury',
            },
            to_anchor: 0.000491154,
        },
    };
    var measure$8 = {
        systems: {
            metric: metric$4,
            imperial: imperial$4,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 0.00014503768078,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 0.00014503768078,
                },
            },
        },
    };

    var SI$3 = {
        VARh: {
            name: {
                singular: 'Volt-Ampere Reactive Hour',
                plural: 'Volt-Amperes Reactive Hour',
            },
            to_anchor: 1,
        },
        mVARh: {
            name: {
                singular: 'Millivolt-Ampere Reactive Hour',
                plural: 'Millivolt-Amperes Reactive Hour',
            },
            to_anchor: 0.001,
        },
        kVARh: {
            name: {
                singular: 'Kilovolt-Ampere Reactive Hour',
                plural: 'Kilovolt-Amperes Reactive Hour',
            },
            to_anchor: 1000,
        },
        MVARh: {
            name: {
                singular: 'Megavolt-Ampere Reactive Hour',
                plural: 'Megavolt-Amperes Reactive Hour',
            },
            to_anchor: 1000000,
        },
        GVARh: {
            name: {
                singular: 'Gigavolt-Ampere Reactive Hour',
                plural: 'Gigavolt-Amperes Reactive Hour',
            },
            to_anchor: 1000000000,
        },
    };
    var measure$7 = {
        systems: {
            SI: SI$3,
        },
    };

    var SI$2 = {
        VAR: {
            name: {
                singular: 'Volt-Ampere Reactive',
                plural: 'Volt-Amperes Reactive',
            },
            to_anchor: 1,
        },
        mVAR: {
            name: {
                singular: 'Millivolt-Ampere Reactive',
                plural: 'Millivolt-Amperes Reactive',
            },
            to_anchor: 0.001,
        },
        kVAR: {
            name: {
                singular: 'Kilovolt-Ampere Reactive',
                plural: 'Kilovolt-Amperes Reactive',
            },
            to_anchor: 1000,
        },
        MVAR: {
            name: {
                singular: 'Megavolt-Ampere Reactive',
                plural: 'Megavolt-Amperes Reactive',
            },
            to_anchor: 1000000,
        },
        GVAR: {
            name: {
                singular: 'Gigavolt-Ampere Reactive',
                plural: 'Gigavolt-Amperes Reactive',
            },
            to_anchor: 1000000000,
        },
    };
    var measure$6 = {
        systems: {
            SI: SI$2,
        },
    };

    var metric$3 = {
        'm/s': {
            name: {
                singular: 'Metre per second',
                plural: 'Metres per second',
            },
            to_anchor: 3.6,
        },
        'km/h': {
            name: {
                singular: 'Kilometre per hour',
                plural: 'Kilometres per hour',
            },
            to_anchor: 1,
        },
    };
    var imperial$3 = {
        mph: {
            name: {
                singular: 'Mile per hour',
                plural: 'Miles per hour',
            },
            to_anchor: 1,
        },
        knot: {
            name: {
                singular: 'Knot',
                plural: 'Knots',
            },
            to_anchor: 1.150779,
        },
        'ft/s': {
            name: {
                singular: 'Foot per second',
                plural: 'Feet per second',
            },
            to_anchor: 0.681818,
        },
        'ft/min': {
            name: {
                singular: 'Foot per minute',
                plural: 'Feet per minute',
            },
            to_anchor: 0.0113636,
        },
    };
    var measure$5 = {
        systems: {
            metric: metric$3,
            imperial: imperial$3,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 1 / 1.609344,
                },
            },
            imperial: {
                metric: {
                    ratio: 1.609344,
                },
            },
        },
    };

    var metric$2 = {
        C: {
            name: {
                singular: 'degree Celsius',
                plural: 'degrees Celsius',
            },
            to_anchor: 1,
            anchor_shift: 0,
        },
        K: {
            name: {
                singular: 'degree Kelvin',
                plural: 'degrees Kelvin',
            },
            to_anchor: 1,
            anchor_shift: 273.15,
        },
    };
    var imperial$2 = {
        F: {
            name: {
                singular: 'degree Fahrenheit',
                plural: 'degrees Fahrenheit',
            },
            to_anchor: 1,
        },
        R: {
            name: {
                singular: 'degree Rankine',
                plural: 'degrees Rankine',
            },
            to_anchor: 1,
            anchor_shift: 459.67,
        },
    };
    var measure$4 = {
        systems: {
            metric: metric$2,
            imperial: imperial$2,
        },
        anchors: {
            metric: {
                imperial: {
                    transform: function (C) {
                        return C / (5 / 9) + 32;
                    },
                },
            },
            imperial: {
                metric: {
                    transform: function (F) {
                        return (F - 32) * (5 / 9);
                    },
                },
            },
        },
    };

    var daysInYear = 365.25;
    var SI$1 = {
        ns: {
            name: {
                singular: 'Nanosecond',
                plural: 'Nanoseconds',
            },
            to_anchor: 1 / 1000000000,
        },
        mu: {
            name: {
                singular: 'Microsecond',
                plural: 'Microseconds',
            },
            to_anchor: 1 / 1000000,
        },
        ms: {
            name: {
                singular: 'Millisecond',
                plural: 'Milliseconds',
            },
            to_anchor: 1 / 1000,
        },
        s: {
            name: {
                singular: 'Second',
                plural: 'Seconds',
            },
            to_anchor: 1,
        },
        min: {
            name: {
                singular: 'Minute',
                plural: 'Minutes',
            },
            to_anchor: 60,
        },
        h: {
            name: {
                singular: 'Hour',
                plural: 'Hours',
            },
            to_anchor: 60 * 60,
        },
        d: {
            name: {
                singular: 'Day',
                plural: 'Days',
            },
            to_anchor: 60 * 60 * 24,
        },
        week: {
            name: {
                singular: 'Week',
                plural: 'Weeks',
            },
            to_anchor: 60 * 60 * 24 * 7,
        },
        month: {
            name: {
                singular: 'Month',
                plural: 'Months',
            },
            to_anchor: (60 * 60 * 24 * daysInYear) / 12,
        },
        year: {
            name: {
                singular: 'Year',
                plural: 'Years',
            },
            to_anchor: 60 * 60 * 24 * daysInYear,
        },
    };
    var measure$3 = {
        systems: {
            SI: SI$1,
        },
    };

    var SI = {
        V: {
            name: {
                singular: 'Volt',
                plural: 'Volts',
            },
            to_anchor: 1,
        },
        mV: {
            name: {
                singular: 'Millivolt',
                plural: 'Millivolts',
            },
            to_anchor: 0.001,
        },
        kV: {
            name: {
                singular: 'Kilovolt',
                plural: 'Kilovolts',
            },
            to_anchor: 1000,
        },
    };
    var measure$2 = {
        systems: {
            SI: SI,
        },
    };

    var metric$1 = {
        mm3: {
            name: {
                singular: 'Cubic Millimeter',
                plural: 'Cubic Millimeters',
            },
            to_anchor: 1 / 1000000,
        },
        cm3: {
            name: {
                singular: 'Cubic Centimeter',
                plural: 'Cubic Centimeters',
            },
            to_anchor: 1 / 1000,
        },
        ml: {
            name: {
                singular: 'Millilitre',
                plural: 'Millilitres',
            },
            to_anchor: 1 / 1000,
        },
        cl: {
            name: {
                singular: 'Centilitre',
                plural: 'Centilitres',
            },
            to_anchor: 1 / 100,
        },
        dl: {
            name: {
                singular: 'Decilitre',
                plural: 'Decilitres',
            },
            to_anchor: 1 / 10,
        },
        l: {
            name: {
                singular: 'Litre',
                plural: 'Litres',
            },
            to_anchor: 1,
        },
        kl: {
            name: {
                singular: 'Kilolitre',
                plural: 'Kilolitres',
            },
            to_anchor: 1000,
        },
        m3: {
            name: {
                singular: 'Cubic meter',
                plural: 'Cubic meters',
            },
            to_anchor: 1000,
        },
        km3: {
            name: {
                singular: 'Cubic kilometer',
                plural: 'Cubic kilometers',
            },
            to_anchor: 1000000000000,
        },
        // Swedish units
        krm: {
            name: {
                singular: 'Kryddmått',
                plural: 'Kryddmått',
            },
            to_anchor: 1 / 1000,
        },
        tsk: {
            name: {
                singular: 'Tesked',
                plural: 'Teskedar',
            },
            to_anchor: 5 / 1000,
        },
        msk: {
            name: {
                singular: 'Matsked',
                plural: 'Matskedar',
            },
            to_anchor: 15 / 1000,
        },
        kkp: {
            name: {
                singular: 'Kaffekopp',
                plural: 'Kaffekoppar',
            },
            to_anchor: 150 / 1000,
        },
        glas: {
            name: {
                singular: 'Glas',
                plural: 'Glas',
            },
            to_anchor: 200 / 1000,
        },
        kanna: {
            name: {
                singular: 'Kanna',
                plural: 'Kannor',
            },
            to_anchor: 2.617,
        },
    };
    var imperial$1 = {
        tsp: {
            name: {
                singular: 'Teaspoon',
                plural: 'Teaspoons',
            },
            to_anchor: 1 / 6,
        },
        Tbs: {
            name: {
                singular: 'Tablespoon',
                plural: 'Tablespoons',
            },
            to_anchor: 1 / 2,
        },
        in3: {
            name: {
                singular: 'Cubic inch',
                plural: 'Cubic inches',
            },
            to_anchor: 0.55411,
        },
        'fl-oz': {
            name: {
                singular: 'Fluid Ounce',
                plural: 'Fluid Ounces',
            },
            to_anchor: 1,
        },
        cup: {
            name: {
                singular: 'Cup',
                plural: 'Cups',
            },
            to_anchor: 8,
        },
        pnt: {
            name: {
                singular: 'Pint',
                plural: 'Pints',
            },
            to_anchor: 16,
        },
        qt: {
            name: {
                singular: 'Quart',
                plural: 'Quarts',
            },
            to_anchor: 32,
        },
        gal: {
            name: {
                singular: 'Gallon',
                plural: 'Gallons',
            },
            to_anchor: 128,
        },
        ft3: {
            name: {
                singular: 'Cubic foot',
                plural: 'Cubic feet',
            },
            to_anchor: 957.506,
        },
        yd3: {
            name: {
                singular: 'Cubic yard',
                plural: 'Cubic yards',
            },
            to_anchor: 25852.7,
        },
    };
    var measure$1 = {
        systems: {
            metric: metric$1,
            imperial: imperial$1,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 33.8140226,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 33.8140226,
                },
            },
        },
    };

    var metric = {
        'mm3/s': {
            name: {
                singular: 'Cubic Millimeter per second',
                plural: 'Cubic Millimeters per second',
            },
            to_anchor: 1 / 1000000,
        },
        'cm3/s': {
            name: {
                singular: 'Cubic Centimeter per second',
                plural: 'Cubic Centimeters per second',
            },
            to_anchor: 1 / 1000,
        },
        'ml/s': {
            name: {
                singular: 'Millilitre per second',
                plural: 'Millilitres per second',
            },
            to_anchor: 1 / 1000,
        },
        'cl/s': {
            name: {
                singular: 'Centilitre per second',
                plural: 'Centilitres per second',
            },
            to_anchor: 1 / 100,
        },
        'dl/s': {
            name: {
                singular: 'Decilitre per second',
                plural: 'Decilitres per second',
            },
            to_anchor: 1 / 10,
        },
        'l/s': {
            name: {
                singular: 'Litre per second',
                plural: 'Litres per second',
            },
            to_anchor: 1,
        },
        'l/min': {
            name: {
                singular: 'Litre per minute',
                plural: 'Litres per minute',
            },
            to_anchor: 1 / 60,
        },
        'l/h': {
            name: {
                singular: 'Litre per hour',
                plural: 'Litres per hour',
            },
            to_anchor: 1 / 3600,
        },
        'kl/s': {
            name: {
                singular: 'Kilolitre per second',
                plural: 'Kilolitres per second',
            },
            to_anchor: 1000,
        },
        'kl/min': {
            name: {
                singular: 'Kilolitre per minute',
                plural: 'Kilolitres per minute',
            },
            to_anchor: 50 / 3,
        },
        'kl/h': {
            name: {
                singular: 'Kilolitre per hour',
                plural: 'Kilolitres per hour',
            },
            to_anchor: 5 / 18,
        },
        'm3/s': {
            name: {
                singular: 'Cubic meter per second',
                plural: 'Cubic meters per second',
            },
            to_anchor: 1000,
        },
        'm3/min': {
            name: {
                singular: 'Cubic meter per minute',
                plural: 'Cubic meters per minute',
            },
            to_anchor: 50 / 3,
        },
        'm3/h': {
            name: {
                singular: 'Cubic meter per hour',
                plural: 'Cubic meters per hour',
            },
            to_anchor: 5 / 18,
        },
        'km3/s': {
            name: {
                singular: 'Cubic kilometer per second',
                plural: 'Cubic kilometers per second',
            },
            to_anchor: 1000000000000,
        },
    };
    var imperial = {
        'tsp/s': {
            name: {
                singular: 'Teaspoon per second',
                plural: 'Teaspoons per second',
            },
            to_anchor: 1 / 6,
        },
        'Tbs/s': {
            name: {
                singular: 'Tablespoon per second',
                plural: 'Tablespoons per second',
            },
            to_anchor: 1 / 2,
        },
        'in3/s': {
            name: {
                singular: 'Cubic inch per second',
                plural: 'Cubic inches per second',
            },
            to_anchor: 0.55411,
        },
        'in3/min': {
            name: {
                singular: 'Cubic inch per minute',
                plural: 'Cubic inches per minute',
            },
            to_anchor: 0.55411 / 60,
        },
        'in3/h': {
            name: {
                singular: 'Cubic inch per hour',
                plural: 'Cubic inches per hour',
            },
            to_anchor: 0.55411 / 3600,
        },
        'fl-oz/s': {
            name: {
                singular: 'Fluid Ounce per second',
                plural: 'Fluid Ounces per second',
            },
            to_anchor: 1,
        },
        'fl-oz/min': {
            name: {
                singular: 'Fluid Ounce per minute',
                plural: 'Fluid Ounces per minute',
            },
            to_anchor: 1 / 60,
        },
        'fl-oz/h': {
            name: {
                singular: 'Fluid Ounce per hour',
                plural: 'Fluid Ounces per hour',
            },
            to_anchor: 1 / 3600,
        },
        'cup/s': {
            name: {
                singular: 'Cup per second',
                plural: 'Cups per second',
            },
            to_anchor: 8,
        },
        'pnt/s': {
            name: {
                singular: 'Pint per second',
                plural: 'Pints per second',
            },
            to_anchor: 16,
        },
        'pnt/min': {
            name: {
                singular: 'Pint per minute',
                plural: 'Pints per minute',
            },
            to_anchor: 4 / 15,
        },
        'pnt/h': {
            name: {
                singular: 'Pint per hour',
                plural: 'Pints per hour',
            },
            to_anchor: 1 / 225,
        },
        'qt/s': {
            name: {
                singular: 'Quart per second',
                plural: 'Quarts per second',
            },
            to_anchor: 32,
        },
        'gal/s': {
            name: {
                singular: 'Gallon per second',
                plural: 'Gallons per second',
            },
            to_anchor: 128,
        },
        'gal/min': {
            name: {
                singular: 'Gallon per minute',
                plural: 'Gallons per minute',
            },
            to_anchor: 32 / 15,
        },
        'gal/h': {
            name: {
                singular: 'Gallon per hour',
                plural: 'Gallons per hour',
            },
            to_anchor: 8 / 225,
        },
        'ft3/s': {
            name: {
                singular: 'Cubic foot per second',
                plural: 'Cubic feet per second',
            },
            to_anchor: 957.506,
        },
        'ft3/min': {
            name: {
                singular: 'Cubic foot per minute',
                plural: 'Cubic feet per minute',
            },
            to_anchor: 957.506 / 60,
        },
        'ft3/h': {
            name: {
                singular: 'Cubic foot per hour',
                plural: 'Cubic feet per hour',
            },
            to_anchor: 957.506 / 3600,
        },
        'yd3/s': {
            name: {
                singular: 'Cubic yard per second',
                plural: 'Cubic yards per second',
            },
            to_anchor: 25852.7,
        },
        'yd3/min': {
            name: {
                singular: 'Cubic yard per minute',
                plural: 'Cubic yards per minute',
            },
            to_anchor: 25852.7 / 60,
        },
        'yd3/h': {
            name: {
                singular: 'Cubic yard per hour',
                plural: 'Cubic yards per hour',
            },
            to_anchor: 25852.7 / 3600,
        },
    };
    var measure = {
        systems: {
            metric: metric,
            imperial: imperial,
        },
        anchors: {
            metric: {
                imperial: {
                    ratio: 33.8140227,
                },
            },
            imperial: {
                metric: {
                    ratio: 1 / 33.8140227,
                },
            },
        },
    };

    var allMeasures = {
        acceleration: measure$q,
        angle: measure$p,
        apparentPower: measure$o,
        area: measure$n,
        charge: measure$m,
        current: measure$l,
        digital: measure$k,
        each: measure$j,
        energy: measure$i,
        force: measure$h,
        frequency: measure$g,
        illuminance: measure$f,
        length: measure$e,
        mass: measure$d,
        pace: measure$c,
        partsPer: measure$b,
        pieces: measure$a,
        power: measure$9,
        pressure: measure$8,
        reactiveEnergy: measure$7,
        reactivePower: measure$6,
        speed: measure$5,
        temperature: measure$4,
        time: measure$3,
        voltage: measure$2,
        volume: measure$1,
        volumeFlowRate: measure,
    };

    const convertUnits = configMeasurements(allMeasures),
        knownUnits = convertUnits().possibilities();


    exports.activeController = void 0;  // hack to provide current context for gauges to register with


    function maybeConvert(v, fromUnit, toUnit) {
        var u = v;
        if (fromUnit && toUnit) {
            try {
                u = convertUnits(v).from(fromUnit).to(toUnit);
            } catch(err) {
                console.log('Unit conversion error: ' + err.message);
            }
        } else if (typeof v === 'string' && v.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/)) {
            // convert string-serialized date metrics back to JS objects
            u = new Date(v);
        }
        return u;
    }


    function gaugeController() {
        /*
        create a gauge controller that we'll use to update values

        `callbacks` is keyed by the panel indicator names,
        which can be more precise than the actual metric name, e.g. fuel.copilot;
        `updaters` is populated after the first call with best match to actual metrics
        */

        var callbacks = {},     // nested dict of metric => (unit || '') => list of update fns
            fakes = {},         // dict of metric => generator
            updaters = null;    // dict of metric keys => {metric: unit: updaters: {unit: fns}}

        // call the controller to display current metric values
        function gaugeController(data, transition) {
            /*
            data is a dictionary {latest: 1234, metrics: {}, [units: {}]}
            where metrics is a dictionary
            with keys like: "metric.some.qualification"
            and corresponding values
            */
            if (!updaters) {
                // First call, we establish the mapping from metric keys => callbacks
                updaters = {};
                Object.keys(data.metrics).forEach(m => {
                    updaters[m] = {unit: data.units[m] || '', updaters: null};
                });

                Object.entries(callbacks).forEach(([m, ufs]) => {
                    /*
                    for each callback, find best qualified metric from the input values,
                    which we'll convert to appropriate units
                    e.g. a gauge requesting fuel.copilot.rear will match
                    a metric called fuel.copilot.rear,
                    or else fuel.copilot or else simply fuel but never fuel.pilot
                    */
                    var ks = m.split('.'),
                        matched = false;
                    while (ks.length && !matched) {
                        let k = ks.join('.');
                        if (k in updaters) {
                            updaters[k].updaters = ufs;
                            matched = true;
                        }
                        ks.pop();
                    }
                    if (!matched) console.log('Warning: no source metric matching', m);
                });
                Object.entries(updaters).forEach(([m, d]) => {
                    if (!d.updaters) {
                        console.log('Warning: unmapped source metric', m);
                        delete updaters[m];
                    }
                });
            }

            // Trigger updates for each source metric
            Object.entries(updaters).forEach(([m, d]) => {
                if (m in data.metrics) {
                    Object.entries(d.updaters).forEach(([unit, fs]) => {
                        let v = maybeConvert(data.metrics[m], d.unit, unit);
                        if (typeof v == 'undefined') {
                            console.log(`Warning: failed to convert ${data.metrics[m]} from ${d.unit} to ${unit}`);
                        } else {
                            fs.forEach(f => f(v, transition));
                        }
                    });
                }
            });
        }
        gaugeController.register = function(updater, metric, unit) {
            if (!metric) return;
            unit = unit || '';
            if (!(metric in callbacks)) callbacks[metric] = {};
            if (!(unit in callbacks[metric])) callbacks[metric][unit] = [];
            callbacks[metric][unit].push(updater);
        };
        gaugeController.fake = function(metric, generator) {
            fakes[metric] = generator;
        };
        gaugeController.fakeMetrics = function() {
            return {
                latest: 0,
                units: {},
                metrics: Object.fromEntries(
                    Object.entries(fakes).map(([m, g]) => [m, g()])
                )
            }
        };
        gaugeController.indicators = function() {
            // return panel indicator keys, available at startup but possibly more specific than actual metrics
            return Object.keys(callbacks);
        };
        gaugeController.mappedMetrics = function() {
            // return matched metrics, available after first data update
            return updaters && Object.keys(updaters);
        };
        exports.activeController = gaugeController;
        return gaugeController;
    }

    function element(elt, attrs_) {
        var attrs = attrs_ || {};

        function element(sel, g) {
            var _ = sel.append(elt);
            Object.entries(attrs).forEach(([k, v]) => _.attr(k, v));
            element.stylable(_);
            element.appendable(_, g);
            element.interactable(_, g);
        }
        element.attr = function(k, _) {
            return (typeof _ !== 'undefined') ? (attrs[k] = _, element): attrs[k];
        };
        return interactable(stylable(appendable(element)));
    }


    function put() {
        function put(sel, g) {
            var _ = sel.append('g');
            put.transformable(_);
            put.stylable(_);
            put.appendable(_, g);
            put.interactable(_, g);
        }
        interactable(stylable(transformable(appendable(put))));
        return put;
    }


    function snapScale() {
        var step = 1,
            start = 0,
            strength = 5;

        function snapScale(v) {
            let v0 = Math.round((v - start)/step)*step + start,
                w = step/2,
                dv = pow().domain([-w,w]).range([-w,w]).exponent(strength)(v - v0);

            return v0 + dv;
        }
        snapScale.start = function(_) {
            return arguments.length ? (start = _, snapScale): start;
        };
        snapScale.step = function(_) {
            return arguments.length ? (step = _, snapScale): step;
        };
        snapScale.strength = function(_) {
            return arguments.length ? (strength = _, snapScale): strength;
        };
        return snapScale;
    }

    const eps = 1e-6;

    function grid() {
        var x0 = 0, y0 = 0,
            width = 2000, height = 2000,
            xmajor=100, ymajor=100, xminor=10, yminor=10;

        function grid(sel) {
            var _ = sel.append('g').attr('class', 'g3-grid');
            grid.stylable(_);

            const xs = range(x0, x0 + width + eps, xmajor),
                  ys = range(y0, y0 + height + eps, ymajor);

            _.selectAll(null)
                .data(range(x0, x0 + width + eps, xminor).filter(x => !xs.includes(x)))
              .enter().append('line').attr('class', 'g3-grid-hairline')
                .attr('transform', x => 'translate(' + x + ',' + y0 + ')')
                .attr('y2', height);
            _.selectAll(null)
                .data(range(y0, y0 + height + eps, yminor).filter(y => !ys.includes(y)))
              .enter().append('line').attr('class', 'g3-grid-hairline')
                .attr('transform', y => 'translate(' + x0 + ',' + y + ')')
                .attr('x2', width);

            var vlines = _.selectAll(null)
                .data(xs)
              .enter().append('g').attr('class', 'g3-grid-line')
                .attr('transform', x => 'translate(' + x + ',' + y0 + ')');
            var hlines = _.selectAll(null)
                .data(ys)
              .enter().append('g').attr('class', 'g3-grid-line')
                .attr('transform', y => 'translate(' + x0 + ',' + y + ')');

            vlines.append('line').attr('y2', height);
            hlines.append('line').attr('x2', width);

            vlines.selectAll(null)
                .data(ys.slice(0, -1))
              .enter().append('g').attr('class', 'g3-grid-label')
                .attr('transform', y => 'translate(0,' + (y - y0 + ymajor/2) + ') rotate(-90) ');
            hlines.selectAll(null)
                .data(xs.slice(0, -1))
              .enter().append('g').attr('class', 'g3-grid-label')
                .attr('transform', x => 'translate(' + (x - x0 + xmajor/2) + ', 0)');

            var labels = selectAll('.g3-grid-label');
            labels.append('rect').attr('x', -12).attr('width', 24).attr('y', -4).attr('height', 8).attr('rx', 4);
            labels.append('text').text(function(){ return select(this.parentNode.parentNode).datum()});
        }

        grid.x = function(_) {
            return arguments.length ? (x0 = _, grid) : x0;
        };
        grid.y = function(_) {
            return arguments.length ? (y0 = _, grid) : y0;
        };
        grid.width = function(_) {
            return arguments.length ? (width = _, grid) : width;
        };
        grid.height = function(_) {
            return arguments.length ? (height = _, grid) : height;
        };
        grid.xmajor = function(_) {
            return arguments.length ? (xmajor = _, grid) : xmajor;
        };
        grid.ymajor = function(_) {
            return arguments.length ? (ymajor = _, grid) : ymajor;
        };
        grid.xminor = function(_) {
            return arguments.length ? (xminor = _, grid) : xminor;
        };
        grid.yminor = function(_) {
            return arguments.length ? (yminor = _, grid) : yminor;
        };

        return stylable(grid);
    }

    // global defs we append to panel's svg element
    const globalDefs = (width, height) => [
        element('radialGradient', {
            id: 'highlightGradient',
            cx: '50%', cy: '50%',
            fx: '25%', fy: '40%',
            r: '50%',
        }).append(
            ...['white', 'black'].map(
                d => element('stop', {'stop-color': d, offset: d == 'white' ? '0%': '100%'})
            )
        ),
        ...[1, 2, 3].map(d =>
            element('filter', {
                id: 'dropShadow' + d,
                // need userSpaceOnUse for drop-shadow to work on 0-width items
                // but then need explicit extent in target units?
                filterUnits: 'userSpaceOnUse',
                x: -width, width: 2*width,
                y: -height, height: 2*height,
            }).append(element('feDropShadow', {stdDeviation: d, dx: 0, dy: 0}))
        ),
        ...[1, 2, 3].map(d =>
            element('filter', {
                id: 'gaussianBlur' + d,
            }).append(element('feGaussianBlur', {in: 'SourceGraphic', stdDeviation: d}))
        ),
    ];


    function panel() {
        var width = 1024,
            height = 768,
            interval = 250,
            showgrid = false,
            smooth = true,
            url;

        function panel(sel) {
            if (typeof sel === 'string') sel = select(sel);
            // draw and start updating panel
            let controller = gaugeController(),  // establish context for gauges
                transition = smooth ?
                    (sel => sel.transition().duration(interval || 250).ease(linear$1)) :
                    (sel => sel),
                _ = sel.append('svg')
                    .attr('width', width).attr('height', height);

            // insert the global defs now that we know the panel size
            panel.defs.append(...globalDefs(width, height));

            _ = _.append('g');
            panel.stylable(_);
            panel.transformable(_);
            panel.appendable(_);

            if (showgrid) grid().width(width).height(height)(_);

            console.log('Starting panel expecting metrics for:', controller.indicators());

            if (!url) {
                // fake metrics
                setInterval(() => {
                    controller(controller.fakeMetrics(), transition);
                }, interval || 250);
            } else if (interval) {
                // with non-zero interval, poll an endpoint
                let latest=0;
                setInterval(() => {
                    let params = {
                        latest: latest,
                        units: latest == 0,
                    };
                    // add the matched metrics once we've determined them
                    if (latest) params.metrics = controller.mappedMetrics();
                    url.search = new URLSearchParams(params).toString();
                    fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            controller(data, transition);
                            latest = data.latest;
                        });
                }, interval);
            } else {
                // set interval to 0 or None to use server-sent event endpoint
                let source = new EventSource(url);
                url.search = new URLSearchParams({
                    // server should determine best match metrics
                    indicators: controller.indicators()
                }).toString();
                source.onmessage = function(e) {
                    controller(JSON.parse(e.data), transition);
                };
            }
        }
        panel.width = function(_) {
            return arguments.length ? (width = _, panel): width;
        };
        panel.height = function(_) {
            return arguments.length ? (height = _, panel): height;
        };
        panel.grid = function(_) {
            return arguments.length ? (showgrid = !!_, panel): showgrid;
        };
        panel.url = function(_) {
            return arguments.length ? (url = new URL(_, document.location), panel): url;
        };
        panel.interval = function(_) {
            return arguments.length ? (interval = _, panel): interval;
        };
        panel.smooth = function(_) {
            return arguments.length ? (smooth = _, panel): smooth;
        };
        stylable(appendable(transformable(panel))).class('g3-panel');
        panel.defs = element('defs');
        panel.append(panel.defs);

        return panel;
    }

    //TODO more pointer shapes, standard names https://upload.wikimedia.org/wikipedia/commons/b/bc/Watch_hands_styles_fr.svg


    var pointers = {
        needle: put().append(
            element('rect', {x: -1, y: -90, width: 2, height: 100}).class('g3-pointer-needle'),
            element('circle', {r: 5}).class('g3-pointer-hub'),
        ),
        blade: put().scale(5.625, -5.625).append(
            element('path', {d: 'M 0,9 L 0.6,7 l 0,-7 l -1.2,0 l 0,7 z'}).class('g3-pointer-blade'),
            element('circle', {r: 1.25}).class('g3-pointer-hub'),
        ),
        dagger: put().scale(5.625, -5.625).append(
            element('path', {d: 'M 0,6 L 1.2,3 L 0.6,0 L -0.6,0 L -1.2,3 Z'}).class('g3-pointer-blade'),
            element('path', {d: 'M 0.6, 0 L 1.6,-3 A 3,3,0,0,0,-1.6,-3 L -0.6,0 Z'}).class('g3-pointer-handle'),
            element('circle', {r: 1.25}).class('g3-pointer-hub'),
        ),
        rondel: put().scale(5.625, -5.625).append(
            element('path', {d: 'M 0,15 L 1,0 l -2,0 z'}).class('g3-pointer-blade'),
            element('circle', {r: 2.4}).class('g3-pointer-hub'),
        ),
        sword: put().scale(5.625, -5.625).append(
            element('path', {d: 'M 0,16 L 0.6,14 l 0,-12 l -1.2,0 l 0,12 z'}).class('g3-pointer-blade'),
            element('rect', {x: -0.6, y: -6, height: 8, width: 1.2}).class('g3-pointer-handle'),
            element('circle', {r: 1.2}).class('g3-pointer-hub'),
            element('circle', {r: 0.5}).class('g3-highlight'),
            element('circle', {r: 1.2, cy: -6}).class('g3-pointer-pommel'),
        ),
        wedge: put().append(
            element('path', {d: 'M 5,25 l -10,0 l 5,-120 z'}).class('g3-pointer-blade'),
            element('circle', {r: 10}).class('g3-pointer-hub'),
            element('circle', {r: 4}).class('g3-highlight'),
        ),
        'omega-second': put().append(
            element('path', {d: 'M 3,25 l -6,0 l 3,-115 z M 0,-72 l 4,15 l -4,5 l -4,-5 z'}).class('g3-pointer-blade'),
            element('path', {d: 'M 0,-69 l 3,12 l -3,3 l -3,-3 z'}).class('g3-pointer-luminous'),
            element('circle', {r: 4}).class('g3-pointer-hub'),
            element('circle', {r: 2}).class('g3-highlight'),
        ),
        'omega-baton-long': put().append(
            element('path', {d: 'M 3,0 l 0,-80 l -3,-10 l -3,10 l 0,80 z'}).class('g3-pointer-blade'),
            element('path', {d: 'M 2,0 l 0,-80 l -4,0 l 0,80 z'}).class('g3-pointer-luminous'),
            element('circle', {r: 6.5}).class('g3-pointer-hub'),
        ),
        'omega-baton-short': put().append(
            element('path', {d: 'M 3.5,0 l 0,-55 l -3.5,-10 l -3.5,10 l 0,55 z'}).class('g3-pointer-blade'),
            element('path', {d: 'M 2.5,0 l 0,-55 l -5,0 l 0,55 z'}).class('g3-pointer-luminous'),
            element('circle', {r: 9}).class('g3-pointer-hub'),
        ),
        'aircraft-heading': put().x(-160).y(-160).scale(0.8).append(
            element('path', {d: "M 200.45288,260.80553 L 203.16177,253.84124 L 225.12833,263.88589 C 227.03295,264.83725 228.33805,264.53956 228.33805,262.63589 L 228.40255,256.61982 C 228.40255,250.22869 224.75105,247.90625 219.51131,243.70732 L 208.47788,235.31446 L 211.28639,196.92161 L 261.23772,213.1716 C 263.62163,213.95469 264.64806,212.98991 264.64806,211.20732 L 264.82432,201.9216 C 264.82432,194.61271 260.92135,191.45797 255.6207,187.81446 L 213.09186,157.27875 C 212.31569,139.15817 210.07741,119.6713 200.45288,103.52874 C 190.82836,119.6713 188.59008,139.15817 187.81391,157.27875 L 145.28507,187.81446 C 139.98442,191.45797 136.08145,194.61271 136.08145,201.9216 L 136.25771,211.20732 C 136.25771,212.98991 137.28414,213.95469 139.66805,213.1716 L 189.61938,196.92161 L 192.42789,235.31446 L 181.39446,243.70732 C 176.15472,247.90625 172.50322,250.22869 172.50322,256.61982 L 172.56772,262.63589 C 172.56772,264.53956 173.87282,264.83725 175.77744,263.88589 L 197.744,253.84124 L 200.45288,260.80553 z"})
                .class('g3-highlight-stroke g3-no-fill')
        ),
        'aircraft-turn': put().x(-218).y(-157.5).scale(0.5).append(  // 436, 315
            element('path', {d: "m 435.64988,289.47018 c -12.33394,0 -22.41326,9.69394 -23.03125,21.875 l -121.9375,-0.22694 c -4.43702,0.0318 -5.34776,6.2322 -0.5,7.0625 l 126.375,7.25819 c 4.14867,6.10563 11.15189,10.125 19.09375,10.125 7.92634,0 14.91358,-4.00188 19.0625,-10.09375 l 126.9375,-7.28944 c 4.84776,-0.8303 3.93702,-7.0307 -0.5,-7.0625 l -122.46875,0.25819 c -0.6019,-12.19506 -10.68685,-21.90625 -23.03125,-21.90625 z"}),
            element('path', {d: "m 382.64058,299.50149 c 4.38251,0.0518 102.16734,0.0518 106.54985,0 4.38251,-0.0518 5.82754,-6.6971 -0.25253,-7.17567 l -44.44671,-2.12492 c -3.68642,-0.66946 -4.02856,-2.28053 -4.29315,-4.3671 l -0.50508,-25.22318 c 0,-3.88798 -7.42864,-3.96105 -7.42864,0 l -0.50508,25.22318 c -0.26459,2.08657 -0.60673,3.69764 -4.29315,4.3671 l -44.57298,2.12492 c -6.08007,0.47857 -4.63504,7.12387 -0.25253,7.17567 z"}),
        ).class('g3-fg-fill'),
    };

    function indicateText() {
        var format = identity,
            size = 20;

        function text(sel, g) {
            let _ = sel.append('text').attr('font-size', size);
            text.stylable(_);
            _ = _.text('');

            function update(v, transition) {    // eslint-disable-line no-unused-vars
                _.text(format(v));
            }
            exports.activeController.register(update, g.metric(), g.unit());
        }
        text.format = function(_) {
            return arguments.length ? (format = _, text) : format;
        };
        text.size = function(_) {
            return arguments.length ? (size = _, text) : size;
        };
        return stylable(text).class('g3-indicate-text');
    }


    function indicatePointer() {
        var rescale = identity,
            clamp = [undefined, undefined],
            shape = 'needle';

        function pointer(sel, g) {
            let _ = sel.append('g').classed('will-change-transform', true);

            pointer.stylable(_);
            if (!pointer.append().length) {
                pointer.append(pointers[shape]);
            }
            pointer.appendable(_, g);

            function update(v, transition) {
                let z = rescale(v);
                if (typeof(clamp[0]) == 'number') z = Math.max(z, clamp[0]);
                if (typeof(clamp[1]) == 'number') z = Math.min(z, clamp[1]);
                transition(_).attr('transform', g.metrictransform(z));
            }
            exports.activeController.register(update, g.metric(), g.unit());
        }
        pointer.rescale = function(_) {
            return arguments.length ? (rescale = _, pointer) : rescale;
        };
        pointer.clamp = function(_) {
            return arguments.length ? (clamp = _, pointer) : clamp;
        };
        pointer.shape = function(_) {
            if (arguments.length && !(_ in pointers)) throw 'pointer: unknown shape ${_}';
            return arguments.length ? (shape = _, pointer) : shape;
        };
        return stylable(appendable(pointer)).class('g3-indicate-pointer');
    }


    function indicateSector() {
        var rescale = identity,
            clamp = [undefined, undefined],
            anchor = 0,
            size = 10,
            inset = 0;

        function sector(sel, g) {
            let _ = sel.append('path');

            sector.stylable(_);

            function update(v, transition) {
                let z = rescale(v), z0 = rescale(anchor), negative = v < anchor;
                if (typeof(clamp[0]) == 'number') z = Math.max(z, clamp[0]);
                if (typeof(clamp[1]) == 'number') z = Math.min(z, clamp[1]);
                transition(_)
                    .attr('d', g.sectorpath(negative ? z: z0, negative ? z0: z, size, inset));
                _.classed('g3-indicate-sector-negative', negative);
            }
            exports.activeController.register(update, g.metric(), g.unit());
        }
        sector.rescale = function(_) {
            return arguments.length ? (rescale = _, sector) : rescale;
        };
        sector.clamp = function(_) {
            return arguments.length ? (clamp = _, sector) : clamp;
        };
        sector.anchor = function(_) {
            return arguments.length ? (anchor = _, sector) : anchor;
        };
        sector.size = function(_) {
            return arguments.length ? (size = _, sector) : size;
        };
        sector.inset = function(_) {
            return arguments.length ? (inset = _, sector) : inset;
        };
        return stylable(sector).class('g3-indicate-sector');
    }


    function indicateStyle() {
        var styleOn = {opacity: 1},
            styleOff = {opacity: 0},
            trigger = identity;
        function style(sel, g) {
            const tween = interpolate$1(styleOff, styleOn);
            let _ = sel.append('g').attr('class', 'g3-indicate-style');
            style.appendable(_, g);

            function update(v, transition) {    // eslint-disable-line no-unused-vars
                let s = tween(trigger(v));
                // Nb. ignore transition for style updates, looks weird for light on/off
                for (let k in s) _.style(k, s[k]);
            }
            exports.activeController.register(update, g.metric(), g.unit());
        }
        style.styleOn = function(_) {
            return arguments.length ? (styleOn = _, style): styleOn;
        };
        style.styleOff = function(_) {
            return arguments.length ? (styleOff = _, style): styleOff;
        };
        style.trigger = function(_) {
            return arguments.length ? (trigger = _, style): trigger;
        };
        return appendable(style);
    }

    function gauge() {

        var metric,
            rescale = identity,
            unit,
            instance,
            fake,
            measure = linear().range([0,360]),
            kind = 'circular',
            autoindicate = false,
            r = 100,  // the axis radius, when applicable
            showgrid = false,
            clip;

        function gauge(selection, parent) {
            // we namespace the metric using the instance chain at drawing time
            let ns = parent ? parent._ns.slice() : [];
            if (instance) {
                // instances like '...foo' removes two items from parent chain
                if (instance.startsWith('.')) {
                    let m = instance.match(/^\.+(.*)/);
                    let s = m[1];
                    ns = ns.slice(0, -(instance.length - s.length - 1));
                    if (s) ns.push(s);
                } else {
                    ns.push(instance);
                }
            }
            gauge._ns = ns;

            const m = gauge.metric();

            let _ = selection.append('g');
            gauge.stylable(_);
            _ = _.append('g');

            if (typeof clip === 'function') {
                let clipId = appendId('gauge-clip');
                clip(_.append('clipPath').attr('id', clipId));
                _.attr('clip-path', `url(#${clipId})`);
            }
            gauge.appendable(_, gauge);

            if (showgrid) grid().x(-r).y(-r).xmajor(50).ymajor(50).width(2*r).height(2*r)(_);

            if (fake && m) exports.activeController.fake(m, fake);

            function update(v, transition) {
                transition(_).attr('transform', gauge.metrictransform(rescale(v), true));
            }

            if (autoindicate) {
                _.classed('will-change-transform', true);
                exports.activeController.register(update, m, unit);
            }
        }
        gauge._ns = [];

        gauge.metric = function(_) {
            // with an argument, sets metric,
            // with no argument, returns qualified metric, e.g. fuel.copilot.rear
            return arguments.length
                ? (metric = _, gauge)
                : (metric && [metric].concat(gauge._ns).join('.'));
        };
        gauge.rescale = function(_) {
            return arguments.length ? (rescale = _, gauge) : rescale;
        };
        gauge.unit = function(_) {
            if (_ && !knownUnits.includes(_)) {
                console.log(`WARNING: gauge.unit ${_} not a known unit, see https://github.com/convert-units/convert-units`);
            }
            return arguments.length ? (unit = _, gauge) : unit;
        };
        gauge.instance = function(_) {
            return arguments.length ? (instance = _, gauge): instance;
        };
        gauge.fake = function(_) {
            return arguments.length ? (fake = _, gauge): fake;
        };
        gauge.kind = function(_) {
            return arguments.length ? (kind = _, gauge) : kind;
        };
        gauge.clip = function(_) {
            return arguments.length ? (clip = _, gauge) : clip;
        };
        gauge.r = function(_) {
            return arguments.length ? (r = _, gauge) : r;
        };
        gauge.measure = function(_) {
            return arguments.length ? (measure = _, gauge) : measure;
        };
        gauge.autoindicate = function(_) {
            return arguments.length ? (autoindicate = _, gauge) : autoindicate;
        };
        gauge.grid = function(_) {
            return arguments.length ? (showgrid = !!_, gauge): showgrid;
        };

        gauge.metrictransform = function(v, invert) {
            const
                circular = kind == 'circular',
                z = invert ? -measure(v) : measure(v);
            return circular ? `rotate(${z})` : `translate(${z}, 0)`;
        };
        gauge.marktransform = function(v, inset) {
            const
                circular = kind == 'circular',
                z = measure(v),
                y = inset + (circular ? -r : 0);
            return circular ? `rotate(${z}) translate(0, ${y})` : `translate(${z}, ${y})`;
        };
        gauge.sectorpath = function(v0, v1, _size, _inset) {
            const
                size = _size ?? 0,
                inset = _inset ?? 0,
                r = gauge.r(),
                m = gauge.measure(),
                z0 = m(v0),
                z1 = m(v1),
                path = gauge.kind() == 'circular'
                    ? arc()({
                        innerRadius: r - inset - size,
                        outerRadius: r - inset,
                        startAngle: convertUnits(z0).from('deg').to('rad'),
                        endAngle: convertUnits(z1).from('deg').to('rad'),
                    })
                    : `M ${z0},${inset} l 0,${size} l ${z1-z0},0 l 0,${-size} z`;
            return path;
        };

        return stylable(appendable(gauge)).class('g3-gauge');
    }


    function gaugeFace() {
        var r = 100,
            window;
        function face(sel, g) {
            var maskId;
            if (typeof window === 'function') {
                maskId = appendId('gauge-face-window-');
                let _ = sel.append('mask').attr('id', maskId);
                _.append('circle').attr('r', r).style('fill', 'white');
                _ = _.append('g').attr('style', 'fill: black');
                window(_, g);
            }
            let _ = sel.append('circle')
                .attr('r', r);
            face.stylable(_);
            if (maskId) _.attr('mask', `url(#${maskId})`);
        }
        face.r = function(_) {
            return arguments.length ? (r = _, face) : r;
        };
        face.window = function(_) {
            return arguments.length ? (window = _, face): window;
        };
        return stylable(face).class('g3-gauge-face');
    }


    function gaugeScrew() {
        var r = 8,
            shape = 'slotted';  // or phillips, robertson
        function screw(_, /* g */) {
            let rotate = Math.random()*360;
            _ = _.append('g').attr('class', 'g3-gauge-screw');
            screw.transformable(_);
            screw.stylable(_);
            _.append('circle').attr('r', r).attr('class', 'g3-gauge-screw-head');
            _.append('circle').attr('r', r) .attr('class', 'g3-highlight');
            switch (shape) {
                case 'robertson':
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate})`)
                        .attr('x', -0.4).attr('width', 0.8)
                        .attr('y', -0.4).attr('height', 0.8);
                    break;
                case 'phillips':
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate+90})`)
                        .attr('x', -1).attr('width', 2)
                        .attr('y', -0.2).attr('height', 0.4);
                    // eslint-disable-next-line no-fallthrough
                default:  // slotted
                    _.append('rect')
                        .attr('transform', `scale(${r}) rotate(${rotate})`)
                        .attr('x', -1).attr('width', 2)
                        .attr('y', -0.2).attr('height', 0.4);
            }
        }
        screw.r = function(_) {
            return arguments.length ? (r = _, screw): r;
        };
        screw.shape = function(_) {
            return arguments.length ? (shape = _, screw): shape;
        };
        return stylable(transformable(screw));
    }



    function gaugeLabel(s_, opts) {
        var s = s_ || '',
            x = 0, y = 0, dx = 0, dy = 0, size = 10;
        function label(sel, /* g */) {
            let _ = sel.append('text')
                .attr('x', x).attr('y', y)
                .attr('dx', dx).attr('dy', dy)
                .attr('font-size', size)
                .text(s);
            label.stylable(_);
        }
        label.value = function(_) {
            return arguments.length ? (s = _, label): s;
        };
        label.size = function(_) {
            return arguments.length ? (size = _, label): size;
        };
        label.x = function(_) {
            return arguments.length ? (x = _, label): x;
        };
        label.y = function(_) {
            return arguments.length ? (y = _, label): y;
        };
        label.dx = function(_) {
            return arguments.length ? (dx = _, label): dx;
        };
        label.dy = function(_) {
            return arguments.length ? (dy = _, label): dy;
        };
        stylable(label).class('g3-gauge-label');
        if (typeof opts === 'object') {
            Object.entries(opts).forEach(([k,v]) => {
                if (typeof label[k] !== 'function') throw `label: unknown attribute ${k}`;
                label[k](v);
            });
        }
        return label;
    }


    // shorthand to add a status light of given color
    function statusLight(_) {
        var g = gauge(),
            trigger = identity,
            color = 'red';
        function statusLight(sel, parent) {
            g.append(
                indicateStyle().trigger(trigger).append(
                    gaugeFace().style(`fill: ${color}`),
                    gaugeFace().class('g3-highlight'),
                )
            );
            g(sel, parent);
        }
        statusLight.metric = function(_) {
            const v = g.metric(_);
            return arguments.length ? statusLight: v;
        };
        statusLight.instance = function(_) {
            const v = g.instance(_);
            return arguments.length ? statusLight: v;
        };
        statusLight.fake = function(_) {
            const v = g.fake(_);
            return arguments.length ? statusLight: v;
        };
        statusLight.trigger = function(_) {
            return arguments.length ? (trigger = _, statusLight): trigger;
        };
        statusLight.color = function(_) {
            return arguments.length ? (color = _, statusLight): color;
        };
        return statusLight;
    }

    function tickvals(vs, step, start, g) {
        if (typeof vs !== 'undefined') return vs;

        var values = vs;

        if (typeof step === 'number') {
            let domain = g.measure().domain();
            const range = g.measure().range();
            domain.sort((a, b) => a - b);
            values = [];
            for (var v = start ?? Math.ceil(domain[0]/step)*step; v <= domain[1]; v += step)
                values.push(v);
            if (
                g.kind() == 'circular'
                && ((range[0] - range[1]) % 360 == 0)
                && values.includes(domain[0])
                && values.includes(domain[1])
            ) values.pop();
        } else {
            values = g.measure().ticks();
        }
        return values;
    }


    function axisSector(vs) {
        var values = vs ? vs.slice(): null,
            size = 5,
            inset = 0;
        function sector(sel, g) {
            let _ = sel
                .append('path')
                .attr('d', g.sectorpath(...(values || g.measure().domain()), size, inset));
            sector.stylable(_);
        }
        sector.size = function(_) {
            return arguments.length ? (size = _, sector) : size;
        };
        sector.inset = function(_) {
            return arguments.length ? (inset = _, sector) : inset;
        };
        return stylable(sector).class('g3-axis-sector');
    }


    function axisLine() {
        return axisSector().size(0).class('g3-axis-line');
    }


    function axisTicks(vs) {
        var shape = 'tick',
            size = 10,
            width = 1,
            inset = 0,
            values = vs && vs.slice(),
            step, start;
        function ticks(sel, g) {
            let vs = tickvals(values, step, start, g);
            let _ = sel.append('g');
            ticks.class('g3-axis-ticks-' + shape).stylable(_);
            _ = _.selectAll(null)
                .data(vs)
              .enter().append('g')
                .attr('transform', d => g.marktransform(d, inset));

            switch(shape) {
                case 'dot':
                    _.append('circle').attr('r', size);
                    break;
                case 'wedge':
                    _.append('path').attr('d', `M 0,${size} L ${width/2},0 L ${-width/2},0 z`);
                    break;
                case 'rect':
                    _.append('rect').attr('width', width).attr('height', size).attr('x', -width/2);
                    break;
                default:
                    _.append('path').attr('d', line()([[0, 0], [0, size]]));
            }
        }
        ticks.step = function(_) {
            return arguments.length ? (step = _, ticks) : step;
        };
        ticks.start = function(_) {
            return arguments.length ? (start = _, ticks) : start;
        };
        ticks.shape = function(_) {
            return arguments.length ? (shape = _, ticks) : shape;
        };
        ticks.size = function(_) {
            return arguments.length ? (size = _, ticks) : size;
        };
        ticks.width = function(_) {
            return arguments.length ? (width = _, ticks) : width;
        };
        ticks.inset = function(_) {
            return arguments.length ? (inset = _, ticks) : inset;
        };
        return stylable(ticks).class('g3-axis-ticks');
    }


    function axisLabels(vs) {
        const isMap = typeof vs === 'object' && !Array.isArray(vs),
            orientations = ['fixed', 'relative', 'upward', 'clockwise', 'counterclockwise'];

        var orient = 'fixed',
            size = 20,
            inset = 25,
            rotate = 0,
            values = isMap ? Object.keys(vs) : vs,
            format = isMap ? v => vs[v] : identity,
            step, start;
        function labels(sel, g) {
            const vs = tickvals(values, step, start, g),
                circPath = orient.endsWith('clockwise'),
                pathId = circPath ? appendId('axis-label-path-') : undefined;

            let _ = sel.append('g');
            labels.stylable(_);
            _ = _.selectAll(null)
                .data(vs)
              .enter().append('g');
            if (circPath) {
                const r = g.r() - inset,
                    cw = orient == 'clockwise' ? 1: 0;
                _.append('path')
                    .attr('id', (d, i) => `${pathId}-${i}`)
                    .attr('d', `M 0,${r} A ${r},${r},0,1,${cw},0,-${r} A ${r},${r},0,1,${cw},0,${r}`)
                    .attr('style', 'visibility: hidden')
                    .attr('transform', d => g.metrictransform(d));
            }
            _ = _.append('text')
                .attr('font-size', size);
            if (circPath) {
                _ = _.append('textPath')
                    .attr('startOffset', '50%')
                    .attr('href', (d, i) => `#${pathId}-${i}`);
            } else {
                _.attr('transform', d => {
                    let xform = g.marktransform(d, inset),
                        rot = rotate;
                    if (g.kind() == 'circular') {
                        if (orient == 'fixed') xform += ' ' + g.metrictransform(d, true);
                        else if (orient == 'upward') {
                            const v = ((g.measure()(d + rot) % 360) + 360) % 360;
                            if (90 < v && v < 270) rot += 180;
                        }
                    }
                    if (rot) xform += ` rotate(${rot})`;
                    return `${xform}`;
                });
            }
            _.text(format);
        }
        labels.step = function(_) {
            return arguments.length ? (step = _, labels) : step;
        };
        labels.start = function(_) {
            return arguments.length ? (start = _, labels) : start;
        };
        labels.orient = function(_) {
            if (_ && !orientations.includes(_))
                throw `g3.axisLabels().orient() unknown orientation '${_}'`
            return arguments.length ? (orient = _, labels) : orient;
        };
        labels.size = function(_) {
            return arguments.length ? (size = _, labels) : size;
        };
        labels.inset = function(_) {
            return arguments.length ? (inset = _, labels) : inset;
        };
        labels.rotate = function(_) {
            return arguments.length ? (rotate = _, labels) : rotate;
        };
        labels.format = function(_) {
            return arguments.length ? (format = _, labels) : format;
        };
        return stylable(labels).class('g3-axis-labels');
    }

    function forceSeries(min_, max_, opts_) {
        var min = min_ ?? 0,
            max = max_ ?? 1,
            opts = opts_ ?? {},
            fmax = opts.fmax ?? 0.01,
            damping = opts.damping ?? 0.9,
            wrap = opts.wrap ?? false,
            x = Math.random(),
            v = 0;

        function next() {
            x += v;
            v += (2*Math.random()-1)*fmax;
            v *= damping;
            if (x < 0 || x > 1) {
                if (!wrap) {
                    v = -v;
                    x = x < 0 ? -x : 2-x;
                } else {
                    x = x > 1 ? x - 1 : x + 1;
                }
            }
            return x * (max - min) + min;

        }
        return next;
    }


    function categoricalSeries(values) {
        var n = values.length,
            vs = forceSeries(0, n, {wrap: true});

        function next() {
            return values[Math.min(Math.floor(vs()), n-1)];
        }
        return next;
    }


    function datetimeSeries() {
        function next() {
            return new Date();
        }
        return next;
    }


    function midnightSecondsSeries() {
        function next() {
            let dt = new Date(),
                msSinceMidnight = dt.getTime() - dt.setHours(0,0,0,0);
            return msSinceMidnight/1000;
        }
        return next;
    }


    function elapsedSecondsSeries() {
        const dt = new Date();
        function next() {
            return (new Date() - dt)/1000;
        }
        return next;
    }

    injectGlobal`
/* Declare 7 and 14 segment LCD fonts, many other variants at https://www.keshikan.net/fonts-e.html */

@font-face {
  font-family: 'DSEG7-Classic';
  src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff2') format('woff2'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.woff') format('woff'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG7-Classic/DSEG7Classic-Bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}
@font-face {
  font-family: 'DSEG14-Classic';
  src: url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff2') format('woff2'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.woff') format('woff'),
  url('https://cdn.jsdelivr.net/npm/dseg@0.46.0/fonts/DSEG14-Classic/DSEG14Classic-Bold.ttf') format('truetype');
  font-weight: bold;
  font-style: normal;
}

/* default center panel on black background */
body {
    margin:  0;
    background-color:  black;
    font-family: Gill Sans,Gill Sans MT,Calibri,sans-serif;
    color: #ccc;
}
.will-change-transform {
    will-change: transform;
}
.g3-panel {
    background-color:  black;
    display: block;
    margin: 0 auto;
    stroke: none;
    fill: none;
}
.g3-panel * {
    vector-effect: non-scaling-stroke;
}
.g3-panel text {
    text-anchor:  middle;
    dominant-baseline:  central;
    font-stretch: condensed;
    fill: #aaa;
}
.g3-axis-ticks-dot, .g3-axis-ticks-wedge, .g3-axis-sector, .g3-fg-fill {
    fill:  #ddd;
}
.g3-axis-line, .g3-axis-ticks, .g3-fg-stroke  {
    stroke: #ddd;
}
.g3-axis-ticks .g3-axis-ticks-dot, .g3-axis-ticks .g3-axis-ticks-wedge {
    stroke: none;
}
.g3-grid-line line {
    stroke: #666;
}
.g3-grid-hairline {
    stroke: #333;
}
.g3-grid-label text {
    font-size: 8px;
    text-anchor:  middle;
    dominant-baseline:  central;
    fill: #999;
}
.g3-grid-label rect {
    stroke: none; fill: black; opacity: 0.5;
}
.g3-gauge-face, .g3-bg-fill {
    fill: #181818;
}
.g3-bg-stroke {
    stroke:  #181818;
}
/* semantic styles */
.g3-no-fill {
    fill: none;
}
.g3-no-stroke {
    stroke: none;
}
.g3-highlight-fill {
    fill: orange;
}
.g3-highlight-stroke {
    stroke: orange;
    stroke-width: 2;
}
.g3-danger-stroke {
    stroke: red;
    stroke-width: 2;
}
.g3-danger-fill {
    fill: red
}
.g3-warning-fill {
    fill: #987808;
}
.g3-normal-fill {
    fill: green;
}
.g3-cold-fill, .g3-sky-fill {
    fill: #0580BA;
}
.g3-ground-fill {
    fill: #6B5634;
}
/* pointer default styles */
.g3-indicate-pointer {
    fill: #222;
    filter: url(#dropShadow2);
}
.g3-pointer-needle {
    fill: red;
}
.g3-pointer-blade {
    fill: #e8e8e8;
    stroke: #e8e8e8;
}
.g3-pointer-luminous {
    fill: #e0e8d0;
    stroke: #d0d8c0;
}
.g3-indicate-sector {
    fill: green;
    stroke: none;
}
.g3-indicate-sector.g3-indicate-sector-negative {
    fill: red;
}
.g3-gauge-screw {
    fill: #333;
    filter: url(#dropShadow2);
}
.g3-gauge-screw rect {
    fill: #222;
}
.g3-highlight {
    fill: url(#highlightGradient);
    fill-opacity: 0.25;
}
`; // end of CSS injectGlobal

    exports.axisLabels = axisLabels;
    exports.axisLine = axisLine;
    exports.axisSector = axisSector;
    exports.axisTicks = axisTicks;
    exports.categoricalSeries = categoricalSeries;
    exports.convertUnits = convertUnits;
    exports.datetimeSeries = datetimeSeries;
    exports.elapsedSecondsSeries = elapsedSecondsSeries;
    exports.element = element;
    exports.forceSeries = forceSeries;
    exports.gauge = gauge;
    exports.gaugeController = gaugeController;
    exports.gaugeFace = gaugeFace;
    exports.gaugeLabel = gaugeLabel;
    exports.gaugeScrew = gaugeScrew;
    exports.grid = grid;
    exports.indicatePointer = indicatePointer;
    exports.indicateSector = indicateSector;
    exports.indicateStyle = indicateStyle;
    exports.indicateText = indicateText;
    exports.knownUnits = knownUnits;
    exports.midnightSecondsSeries = midnightSecondsSeries;
    exports.panel = panel;
    exports.pointers = pointers;
    exports.put = put;
    exports.snapScale = snapScale;
    exports.statusLight = statusLight;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
