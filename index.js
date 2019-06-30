'use strict';

if (process.env.NODE_ENV === 'production') {
	module.exports = require('./cjs/dom-utility.production.min.js');
} else {
	module.exports = require('./cjs/dom-utility.development.js');
}