import {log} from "./utils";

const MUST_USE_PROPERTY = 0x1;
const HAS_BOOLEAN_VALUE = 0x4;
const HAS_NUMERIC_VALUE = 0x8;
const HAS_POSITIVE_NUMERIC_VALUE = 0x10 | 0x8;
const HAS_OVERLOADED_BOOLEAN_VALUE = 0x20;
const HAS_STRING_BOOLEAN_VALUE = 0x40;

/* eslint-disable max-len */
const ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";

/* eslint-enable max-len */
const ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";

const VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');

const NS = {
	xlink: 'http://www.w3.org/1999/xlink',
	xml:   'http://www.w3.org/XML/1998/namespace',
	html:  'http://www.w3.org/1999/xhtml',
	math:  'http://www.w3.org/1998/Math/MathML',
	svg:   'http://www.w3.org/2000/svg'
};

const CAMELIZE = /[\-:]([a-z])/g;
const capitalize = token => token[1].toUpperCase();

//

let properties = {};

function checkMask(value, bitmask)
{
	return (value & bitmask) === bitmask;
}

function injectDOMPropertyConfig(domPropertyConfig)
{
	let Properties = domPropertyConfig.Properties || {};
	let DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
	let DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
	let DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
	let Keys = Object.keys(Properties);

	for (let i = 0, length = Keys.length, propName; i < length; i++) {

		propName = Keys[i];
		if(properties.hasOwnProperty(propName)) {
			continue
		}

		let lowerCased = propName.toLowerCase();
		let propConfig = Properties[propName];

		let propertyInfo = {
			attributeName: lowerCased,
			attributeNamespace: null,
			propertyName: propName,
			mutationMethod: null,

			mustUseProperty: checkMask(propConfig, MUST_USE_PROPERTY),
			hasBooleanValue: checkMask(propConfig, HAS_BOOLEAN_VALUE),
			hasNumericValue: checkMask(propConfig, HAS_NUMERIC_VALUE),
			hasPositiveNumericValue: checkMask(propConfig, HAS_POSITIVE_NUMERIC_VALUE),
			hasOverloadedBooleanValue: checkMask(propConfig, HAS_OVERLOADED_BOOLEAN_VALUE),
			hasStringBooleanValue: checkMask(propConfig, HAS_STRING_BOOLEAN_VALUE)
		};

		if( !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1)) {
			log("DOMProperty: Value can be one of boolean, overloaded boolean, or numeric value, but not a combination: %s", propName);
			continue
		}

		if (DOMAttributeNames.hasOwnProperty(propName)) {
			propertyInfo.attributeName = DOMAttributeNames[propName];
		}

		if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
			propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
		}

		if (DOMMutationMethods.hasOwnProperty(propName)) {
			propertyInfo.mutationMethod = DOMMutationMethods[propName];
		}

		// Downcase references to whitelist properties to check for membership
		// without case-sensitivity. This allows the whitelist to pick up
		// `allowfullscreen`, which should be written using the property configuration
		// for `allowFullscreen`
		properties[propName] = propertyInfo;
	}
}

let HTMLDOMPropertyConfig = {
	// When adding attributes to this list, be sure to also add them to
	// the `possibleStandardNames` module to ensure casing and incorrect
	// name warnings.
	Properties: {
		allowFullScreen: HAS_BOOLEAN_VALUE,
		// specifies target context for links with `preload` type
		async: HAS_BOOLEAN_VALUE,
		// Note: there is a special case that prevents it from being written to the DOM
		// on the client side because the browsers are inconsistent. Instead we call focus().
		autoFocus: HAS_BOOLEAN_VALUE,
		autoPlay: HAS_BOOLEAN_VALUE,
		capture: HAS_OVERLOADED_BOOLEAN_VALUE,
		checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
		cols: HAS_POSITIVE_NUMERIC_VALUE,
		contentEditable: HAS_STRING_BOOLEAN_VALUE,
		controls: HAS_BOOLEAN_VALUE,
		'default': HAS_BOOLEAN_VALUE,
		defer: HAS_BOOLEAN_VALUE,
		disabled: HAS_BOOLEAN_VALUE,
		download: HAS_OVERLOADED_BOOLEAN_VALUE,
		draggable: HAS_STRING_BOOLEAN_VALUE,
		formNoValidate: HAS_BOOLEAN_VALUE,
		hidden: HAS_BOOLEAN_VALUE,
		loop: HAS_BOOLEAN_VALUE,
		// Caution; `option.selected` is not updated if `select.multiple` is
		// disabled with `removeAttribute`.
		multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
		muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
		noValidate: HAS_BOOLEAN_VALUE,
		open: HAS_BOOLEAN_VALUE,
		playsInline: HAS_BOOLEAN_VALUE,
		readOnly: HAS_BOOLEAN_VALUE,
		required: HAS_BOOLEAN_VALUE,
		reversed: HAS_BOOLEAN_VALUE,
		rows: HAS_POSITIVE_NUMERIC_VALUE,
		rowSpan: HAS_NUMERIC_VALUE,
		scoped: HAS_BOOLEAN_VALUE,
		seamless: HAS_BOOLEAN_VALUE,
		selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
		size: HAS_POSITIVE_NUMERIC_VALUE,
		start: HAS_NUMERIC_VALUE,
		// support for projecting regular DOM Elements via V1 named slots ( shadow dom )
		span: HAS_POSITIVE_NUMERIC_VALUE,
		spellCheck: HAS_STRING_BOOLEAN_VALUE,
		// Style must be explicitly set in the attribute list. React components
		// expect a style object
		style: 0,
		// Keep it in the whitelist because it is case-sensitive for SVG.
		tabIndex: 0,
		// itemScope is for for Microdata support.
		// See http://schema.org/docs/gs.html
		itemScope: HAS_BOOLEAN_VALUE,
		// These attributes must stay in the white-list because they have
		// different attribute names (see DOMAttributeNames below)
		acceptCharset: 0,
		className: 0,
		htmlFor: 0,
		httpEquiv: 0,
		// Attributes with mutation methods must be specified in the whitelist
		// Set the string boolean flag to allow the behavior
		value: HAS_STRING_BOOLEAN_VALUE
	},
	DOMAttributeNames: {
		acceptCharset: 'accept-charset',
		className: 'class',
		htmlFor: 'for',
		httpEquiv: 'http-equiv'
	},
	DOMMutationMethods: {
		value(node, value) {
			if (value == null) {
				return node.removeAttribute('value');
			}

			// Number inputs get special treatment due to some edge cases in
			// Chrome. Let everything else assign the value attribute as normal.
			// https://github.com/facebook/react/issues/7253#issuecomment-236074326
			if (node.type !== 'number' || node.hasAttribute('value') === false) {
				node.setAttribute('value', '' + value);
			}
			else if (node.validity && !node.validity.badInput && node.ownerDocument.activeElement !== node) {
				// Don't assign an attribute if validation reports bad
				// input. Chrome will clear the value. Additionally, don't
				// operate on inputs that have focus, otherwise Chrome might
				// strip off trailing decimal places and cause the user's
				// cursor position to jump to the beginning of the input.
				//
				// In ReactDOMInput, we have an onBlur event that will trigger
				// this function again when focus is lost.
				node.setAttribute('value', '' + value);
			}
		}
	}
};

/**
 * This is a list of all SVG attributes that need special casing,
 * namespacing, or boolean value assignment.
 *
 * When adding attributes to this list, be sure to also add them to
 * the `possibleStandardNames` module to ensure casing and incorrect
 * name warnings.
 *
 * SVG Attributes List:
 * https://www.w3.org/TR/SVG/attindex.html
 * SMIL Spec:
 * https://www.w3.org/TR/smil
 */
const SVG_ATTRS = ['accent-height', 'alignment-baseline', 'arabic-form', 'baseline-shift', 'cap-height', 'clip-path', 'clip-rule', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'dominant-baseline', 'enable-background', 'fill-opacity', 'fill-rule', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-name', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'horiz-adv-x', 'horiz-origin-x', 'image-rendering', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'overline-position', 'overline-thickness', 'paint-order', 'panose-1', 'pointer-events', 'rendering-intent', 'shape-rendering', 'stop-color', 'stop-opacity', 'strikethrough-position', 'strikethrough-thickness', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'underline-position', 'underline-thickness', 'unicode-bidi', 'unicode-range', 'units-per-em', 'v-alphabetic', 'v-hanging', 'v-ideographic', 'v-mathematical', 'vector-effect', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'word-spacing', 'writing-mode', 'x-height', 'xlink:actuate', 'xlink:arcrole', 'xlink:href', 'xlink:role', 'xlink:show', 'xlink:title', 'xlink:type', 'xml:base', 'xmlns:xlink', 'xml:lang', 'xml:space'];
const SVG_ATTRS_STRING_BOOLEAN = ['autoReverse', 'externalResourcesRequired', 'preserveAlpha'];
const SVG_NS = ['Actuate', 'Arcrole', 'Href', 'Role', 'Show', 'Title', 'Type', 'Base', 'Lang', 'Space'];
const SVG_NS_XML = ['Base', 'Lang', 'Space'];

let SVGDOMPropertyConfig = {
	Properties: {},
	DOMAttributeNames: {},
	DOMAttributeNamespaces: {}
};

SVG_ATTRS.forEach(original => {
	let name = original.replace(CAMELIZE, capitalize);
	SVGDOMPropertyConfig.Properties[name] = 0;
	SVGDOMPropertyConfig.DOMAttributeNames[name] = original;
});

SVG_ATTRS_STRING_BOOLEAN.forEach(name => {
	SVGDOMPropertyConfig.Properties[name] = HAS_STRING_BOOLEAN_VALUE;
	SVGDOMPropertyConfig.DOMAttributeNames[name] = name;
});

SVG_NS.forEach(name => {
	let pref = SVG_NS_XML.indexOf(name) < 0 ? 'xlink' : 'xml';
	SVGDOMPropertyConfig.DOMAttributeNamespaces[pref + name] = NS[pref]
});

injectDOMPropertyConfig(HTMLDOMPropertyConfig);
injectDOMPropertyConfig(SVGDOMPropertyConfig);


let illegalAttributeNameCache = {};
let validatedAttributeNameCache = {};

function isAttributeNameSafe(attributeName)
{
	if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
		return true;
	}
	if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
		return false;
	}
	if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
		validatedAttributeNameCache[attributeName] = true;
		return true;
	}
	illegalAttributeNameCache[attributeName] = true;
	return false;
}

function getPropertyInfo(name)
{
	return properties.hasOwnProperty(name) ? properties[name] : null;
}

function shouldAttributeAcceptBooleanValue(name)
{
	let propertyInfo = getPropertyInfo(name);
	if (propertyInfo) {
		return propertyInfo.hasBooleanValue || propertyInfo.hasStringBooleanValue || propertyInfo.hasOverloadedBooleanValue;
	}
	let prefix = name.slice(0, 5).toLowerCase();
	return prefix === 'data-' || prefix === 'aria-';
}

/**
 * Checks whether a property name is a writeable attribute.
 * @method
 */
function shouldSetAttribute(name, value) {

	if (name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
		return false;
	}
	if (value == null) {
		return true;
	}
	switch (typeof value) {
		case 'boolean':
			return shouldAttributeAcceptBooleanValue(name);
		case 'undefined':
		case 'number':
		case 'string':
		case 'object':
			return true;
		default:
			// function, symbol
			return false;
	}
}

function shouldIgnoreValue(propertyInfo, value) {
	return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
}

/**
 * Sets the value for a property on a node.
 *
 * @param {HTMLElement} node
 * @param {string} name
 * @param {*} value
 */
function setValueForProperty(node, name, value) {
	let propertyInfo = getPropertyInfo(name),
		shouldSet = shouldSetAttribute(name, value);

	if (propertyInfo && shouldSet) {
		let mutationMethod = propertyInfo.mutationMethod;
		if (mutationMethod) {
			mutationMethod(node, value);
		}
		else if (shouldIgnoreValue(propertyInfo, value)) {
			return deleteValueForProperty(node, name);
		}
		else if (propertyInfo.mustUseProperty) {
			// Contrary to `setAttribute`, object properties are properly
			// `toString`ed by IE8/9.
			node[propertyInfo.propertyName] = value;
		}
		else {
			let attributeName = propertyInfo.attributeName;
			let namespace = propertyInfo.attributeNamespace;
			// `setAttribute` with objects becomes only `[object]` in IE8/9,
			// ('' + value) makes it output the correct toString()-value.
			if (namespace) {
				node.setAttributeNS(namespace, attributeName, '' + value);
			}
			else if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
				node.setAttribute(attributeName, '');
			}
			else {
				node.setAttribute(attributeName, '' + value);
			}
		}
	}
	else {
		setValueForAttribute(node, name, shouldSet ? value : null);
	}
}

function setValueForAttribute(node, name, value)
{
	if (!isAttributeNameSafe(name)) {
		return;
	}
	if (value == null) {
		node.removeAttribute(name);
	}
	else {
		node.setAttribute(name, '' + value);
	}
}

/**
 * Deletes the value for a property on a node.
 *
 * @param {HTMLElement} node
 * @param {string} name
 */
function deleteValueForProperty(node, name)
{
	let propertyInfo = getPropertyInfo(name);
	if (propertyInfo) {
		let mutationMethod = propertyInfo.mutationMethod;
		if (mutationMethod) {
			mutationMethod(node, undefined);
		}
		else if (propertyInfo.mustUseProperty) {
			node[propertyInfo.propertyName] = propertyInfo.hasBooleanValue ? false : '';
		}
		else {
			node.removeAttribute(propertyInfo.attributeName);
		}
	}
	else {
		node.removeAttribute(name);
	}
}

function getValueForAttribute(node, name)
{
	if (!isAttributeNameSafe(name))
	{
		return;
	}
	if (!node.hasAttribute(name))
	{
		return null;
	}
	return node.getAttribute(name);
}

function hasAttr(node, name, namespace)
{
	if(namespace && node.hasAttributeNS(namespace, name))
	{
		return true
	}
	return node.hasAttribute(name)
}

function getAttr(node, name, namespace)
{
	if(namespace)
	{
		const value = node.getAttributeNS(namespace, name);
		if( value != null )
		{
			return value
		}
	}
	return node.getAttribute(name)
}

function getValueForProperty(node, propertyInfo)
{
	if (propertyInfo.mustUseProperty) {
		const propertyName = propertyInfo.propertyName;
		return node[propertyName];
	}
	else {
		const attributeName = propertyInfo.attributeName;
		const namespace = propertyInfo.attributeNamespace;

		if (propertyInfo.hasOverloadedBooleanValue) {
			if (hasAttr(node, attributeName, namespace) ) {
				const value = getAttr(node, attributeName, namespace);
				if (value === '') {
					return true;
				}
				return value;
			}
		}
		else if (hasAttr(node, attributeName, namespace)) {

			if (propertyInfo.hasBooleanValue) {
				// If this was a boolean, it doesn't matter what the value is
				// the fact that we have it is the same as the expected.
				return true;
			}

			// Even if this property uses a namespace we use getAttribute
			// because we assume its namespaced name is the same as our config.
			// To use getAttributeNS we need the local name which we don't have
			// in our config atm.
			return getAttr(node, attributeName, namespace);
		}

		return propertyInfo.hasBooleanValue ? false : null;
	}
}

export { NS };

/**
 *
 * @param {HTMLElement} element
 * @param {String} propKey
 * @param {*} propValue
 * @returns {*}
 */
export default function attribute(element, propKey, propValue)
{
	if( arguments.length < 3) {
		const propertyInfo = getPropertyInfo(propKey);
		return propertyInfo != null ? getValueForProperty(element, propertyInfo) : getValueForAttribute(element, propKey);
	}
	else if (propValue != null) {
		setValueForProperty(element, propKey, propValue);
	}
	else {
		// If we're updating to null or undefined, we should remove the property
		// from the DOM node instead of inadvertently setting to a string. This
		// brings us in line with the same behavior we have on initial render.
		deleteValueForProperty(element, propKey);
	}
}