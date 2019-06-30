import {createCollection} from "./collection";
import {isFunc} from "typeof-utility";

const regSplit = /\s+/g;

let native = false;
let lastCurrent;
let lastCurrentIndex;

if( typeof document !== "undefined" && isFunc(document.createElement) )
{
	try {
		let e = document.createElement("span"), cl = e.classList || null;

		if( cl ) {
			e.className = "a";
			try {
				cl.remove("a");
				cl.add("b");
				native = ! cl.contains("a") && cl.contains("b")
			}
			catch (e) {}
		}
	}
	catch(er) {}
}

function getName(name)
{
	return name == null ? "" : String(name).trim()
}

// no native

function contains(e, name)
{
	lastCurrent = e.className ? getName(e.className).split(regSplit) : [];
	lastCurrentIndex = lastCurrent.length ? lastCurrent.indexOf(name) : -1;
	return lastCurrentIndex > -1;
}

function _addClass(e, name)
{
	lastCurrent.push(name);
	e.className = lastCurrent.join(" ")
}

function _removeClass(e)
{
	if( lastCurrent.length > 1 ) {
		lastCurrent.splice(lastCurrentIndex, 1);
		e.className = lastCurrent.join(" ")
	}
	else {
		e.className = "";
	}
}

// for remap

function CollectionSet(e, name)
{
	e.className = name.length === 1 ? name[0] : name.join(" ")
}

function CollectionAdd(e, name)
{
	for(let i = 0, length = name.length; i < length; i++) {
		if( native ) {
			e.classList.add(name[i])
		}
		else if( !contains(e, name[i]) ) {
			_addClass(e, name[i])
		}
	}
}

function CollectionRemove(e, name)
{
	for(let i = 0, length = name.length; i < length; i++) {
		if( native ) {
			e.classList.remove(name[i])
		}
		else if( contains(e, name[i]) ) {
			_removeClass(e, name[i])
		}
	}
}

function CollectionToggle(e, name)
{
	for(let i = 0, length = name.length; i < length; i++) {
		if( native ) {
			e.classList.toggle(name[i])
		}
		else if( contains(e, name[i]) ) {
			_removeClass(e, name[i])
		}
		else {
			_addClass(e, name[i])
		}
	}
}

/**
 * @return {boolean}
 */
function CollectionContains(e, name)
{
	for( let i = 0, length = name.length; i < length; i++ ) {
		if( !( native ? e.classList.contains(name[i]) : contains(e, name[i]) ) ) return false
	}
	return true
}

// map callback

function map(callback, lst, name, ignoreName = false)
{
	lst = createCollection(lst);
	const length = lst.length;
	if(length > 0) {
		name = getName(name);
		if(name || ignoreName) {
			name = name.split(regSplit);
			for(let i = 0; i < length; i++) {
				callback(lst.item(i), name)
			}
		}
	}
}

function mapResult(callback, lst, name, result)
{
	lst = createCollection(lst, false);
	const length = lst.length;
	if(length > 0) {
		name = getName(name);
		if(name) {
			name = name.split(regSplit);
			for(let i = 0; i < length; i++) {
				if( callback(lst.item(i), name) !== result ) {
					return false
				}
			}
			return true
		}
	}
	return false
}

export function setClass(e, name)
{
	map(CollectionSet, e, name, true)
}

export function addClass(e, name)
{
	map(CollectionAdd, e, name)
}

export function removeClass(e, name)
{
	map(CollectionRemove, e, name)
}

export function toggleClass(e, name)
{
	map(CollectionToggle, e, name)
}

export function testToggleClass(dir, e, name)
{
	map(dir ? CollectionAdd : CollectionRemove, e, name)
}

export function hasClass(e, name, callback)
{
	const result = mapResult(CollectionContains, e, name, true);
	result && isFunc(callback) && callback(e);
	return result
}

export function notClass(e, name, callback)
{
	const result = mapResult(CollectionContains, e, name, false);
	result && isFunc(callback) && callback(e);
	return result
}
