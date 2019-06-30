
import {addEvent} from "./events";
import {createCollection} from "./collection";
import {setStyle} from "./style";
import attribute, {NS} from "./attribute";
import {isWeb, isString, isDOMElement, isPlainObject} from "typeof-utility";
import {noop, log, ownerDocument} from "./utils";

const regClassId = /(#|\.)([^#.]+)/g;
const regOn = /^on[A-Z]/;
const reserved = ["className", "style"];

const DefFunctions = {
	'false': () => { return false },
	'prevent': e => { e.preventDefault() },
	'prevent-false': e => { e.preventDefault(); return false },
	'stop': e => { e.stopPropagation(); },
	'stop-prevent': e => { e.stopPropagation(); e.preventDefault() },
	'stop-prevent-false': e => { e.stopPropagation(); e.preventDefault(); return false },
	'noop': noop,
	'debug': e => { console.log('Debug event', e.type, e) }
};

if(isWeb() && window.Element)
{
	const proto = Element.prototype;

	if( !proto.matches )
	{
		proto.matches =
			proto.matchesSelector ||
			proto.mozMatchesSelector ||
			proto.msMatchesSelector ||
			proto.oMatchesSelector ||
			proto.webkitMatchesSelector ||
			function(selector) {
				let matches = ownerDocument(this).querySelectorAll(selector), i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
				return i > -1;
			};
	}

	if( !proto.closest )
	{
		proto.closest =
			function(selector) {
				let node = this;
				while(node) {
					if (node.matches(selector)) return node;
					else node = node.parentElement;
				}
				return null;
			};
	}
}

function RecursiveAbort(name)
{
	log("Warning, recursive %s abort", name)
}

// from

// - string
// - HtmlNode
// - function()
// - mixed[] -> array

function CreateChild(element, parent, children)
{
	if(isDOMElement(element))
	{
		if( children.indexOf(element) < 0 ) {
			children.push(element)
		}

		return children
	}

	let tof = typeof element;

	if( tof === 'string' )
	{
		children.push( document.createTextNode(element) )
	}
	else if( tof === 'function' )
	{
		if(!parent.func) {
			parent.func = []
		}

		if( parent.func.indexOf(element) < 0 ) {
			parent.func.push(element);
			element = element();
			if( typeof element !== 'function' ) {
				CreateChild(element, parent, children)
			}
		}
		else {
			RecursiveAbort("function")
		}
	}
	else if( tof === 'object' && element !== null && Array.isArray(element) )
	{
		if(!parent.each) {
			parent.each = []
		}

		if( parent.each.indexOf(element) < 0 ) {
			parent.each.push(element);
			for( let i = 0, length = element.length; i < length; i++ ) {
				CreateChild(element[i], parent, children)
			}
		}
		else {
			RecursiveAbort("array")
		}
	}

	return children
}

function getNameSpace(type, parentNs)
{
	if( type === 'svg' || type === 'math' ) {
		return NS[type]
	}
	if( parentNs === NS.svg && type === 'foreignObject' ) {
		return NS.html
	}
	return parentNs || NS.html
}

/**
 * @return {string}
 */
function getString( text )
{
	if( typeof text === 'function' ) {
		text = text()
	}
	return String(text)
}

function CreateElement(name, props, parent)
{
	let id = props.id || '';
	let classes = [];
	name = (name || 'div').replace(regClassId, (m, a, b) => { if( a === '#' ) id = b; else classes.push(b); return '' });
	if(!name) {
		name = 'div'
	}

	let type = name.toLowerCase();
	let ns = getNameSpace(type);

	let elm = ns === NS.html ? document.createElement(name) : document.createElementNS(ns, name);

	// class name
	if(props.className) {
		classes.push(getString(props.className));
	}

	if(classes.length) {
		elm.className = classes.join(" ");
	}

	if(id) {
		props.id = getString(id)
	}

	Object.keys(props).forEach(name => {
		if(reserved.indexOf(name) < 0) {
			const value = props[name];
			if(regOn.test(name)) {
				addEvent(elm, name.substr(2).toLowerCase(), isString(value) ? (DefFunctions[value.toLowerCase()] || noop) : value)
			}
			else {
				attribute(elm, name, value)
			}
		}
	});

	isPlainObject(props.style) && css( elm, props.style );
	isDOMElement(parent) && parent.appendChild(elm);

	return elm
}

// -- export

/**
 * Returns a reference to the first object with the specified value of the ID or NAME attribute.
 *
 * @param {String} id String that specifies the ID value. Case-insensitive.
 * @return {HTMLElement|null}
 */
export function byId( id )
{
	return document.getElementById( id )
}

export function byQueryOne( query, element = null )
{
	if( !element ) {
		element = document
	}
	return element.querySelector ? element.querySelector(query) : element.querySelectorAll(query)[0] || null
}

export function byQuery( query, element = null )
{
	if( !element ) {
		element = document
	}
	return element.querySelectorAll( query )
}

export function byClassName( name )
{
	return document.getElementsByClassName( name )
}

export function byTag( name )
{
	return document.getElementsByTagName( name )
}

export function byName( name )
{
	return document.getElementsByName( name )
}

export function createElement( element = "div", attributes = {}, wrap = null )
{
	if(arguments.length < 3 && isDOMElement(attributes)) {
		wrap = attributes;
		attributes = {};
	}
	return CreateElement( element, attributes, wrap );
}

export function append( element, child )
{
	if( isDOMElement(element) ) {
		CreateChild(child, {}, []).forEach(node => {
			element.appendChild(node)
		})
	}
	return element
}

export function clone( element, reId = {} )
{
	if( ! isDOMElement(element) ) {
		return null
	}

	const
		clone = element.cloneNode(true),
		fixIds = e => {
			let node = e.firstChild, id;
			while(node) {
				if(node.nodeType === 1) {
					id = node.getAttribute("id");
					if(id) {
						if(reId[id]) {
							node.setAttribute("id", reId[id])
						}
						else {
							node.removeAttribute("id")
						}
					}
				}
				if(node.firstChild) {
					fixIds(node)
				}
				node = node.nextSibling;
			}
		};

	fixIds(clone);

	return clone
}

export function empty(element, current = false)
{
	if(isDOMElement(element)) {
		while(element.firstChild) {
			element.removeChild(element.firstChild)
		}
		if(current && element.parentNode) {
			element.parentNode.removeChild(element)
		}
	}
}

export function css(element, name, value)
{
	element = createCollection(element);
	const length = element.length;
	if( length > 0 )
	{
		let i;

		if( isPlainObject(name) && arguments.length < 3 )
		{
			for( let n = 0, keys = Object.keys(name), prop, keysLength = keys.length; n < keysLength; n++ )
			{
				prop = keys[n];
				for( i = 0; i < length; i++ )
				{
					setStyle(element.item(i), prop, name[prop]);
				}
			}
		}
		else if( isString(name) )
		{
			if( ! value && value !== 0 )
			{
				value = ''
			}

			for( i = 0; i < length; i++ )
			{
				setStyle(element.item(i), name, value);
			}
		}
	}
	return element
}

export function matches(node, selector) {
	return isDOMElement(node) ? node.matches(selector) : null
}

export function closest(node, selector) {
	return isDOMElement(node) ? node.closest(selector) : null
}
