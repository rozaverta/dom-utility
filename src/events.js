import {isWeb, isFunc} from "typeof-utility";
import {noop, log} from "./utils";
import {createCollection} from "./collection";

const RegSpace = /\s+/g;
const RegLowerFirst = /^[a-z]/;

const isWin = typeof window !== 'undefined' && 'setTimeout' in window;

let adding = 'addEventListener',
	removing = 'removeEventListener',
	getOriginalEventName = name => name;

if (isWeb() && !window[adding] && "attachEvent" in window) {
	adding = "attachEvent";
	removing = "detachEvent";
	getOriginalEventName = name => RegLowerFirst.test(name) ? "on" + name : name;
}

let docIsReady = false;
let docCall = [];

function docLoad() {
	if (!docIsReady) {
		docUnload();
		docIsReady = true
	}

	for (let i = 0, len = docCall.length; i < len; i++) {
		try {
			docCall[i]()
		} catch (e) {
			log(e, "Fatal ready callback")
		}
	}

	docCall = []
}

function docUnload() {
	if (adding === 'addEventListener' && document[adding]) {
		document[removing]("DOMContentLoaded", docLoad);
		window[removing]("load", docLoad);
	} else {
		document.detachEvent("onreadystatechange", docLoad);
		window.detachEvent("onload", docLoad);
	}
}

if (isWeb() && typeof document !== "undefined") {
	if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
		setTimeout(docLoad, 0)
	} else if (adding === 'addEventListener' && document[adding]) {
		document[adding]("DOMContentLoaded", docLoad);
		window[adding]("load", docLoad)
	} else {
		document.attachEvent("onreadystatechange", docLoad);
		window.attachEvent("onload", docLoad);

		// If IE and not a frame
		// continually check to see if the document is ready
		let top = false;

		try {
			top = window.frameElement === null && document.documentElement;
		} catch (e) {
		}

		if (top && top.doScroll) {
			(function doScrollCheck() {
				if (!docIsReady) {

					try {
						top.doScroll("scrollLeft");
					} catch (e) {
						return window.setTimeout(doScrollCheck, 50)
					}

					docLoad();
				}
			})();
		}
	}
}

// -- support

let EventRename = {};

let _support = {
	touch: isWin && 'ontouchstart' in window,
	orientationChange: isWin && 'orientationchange' in window,
	passive: false
};

try {
	let opts = Object.defineProperty({}, 'passive', {
		get: function () {
			_support.passive = true;
		}
	});
	window[adding]("testPassive", null, opts);
	window[removing]("testPassive", null, opts);
} catch (e) {
}

if (typeof document !== 'undefined' && !'onwheel' in document) {
	EventRename.wheel = "onmousewheel" in document ? "mousewheel" : ["DOMMouseScroll", "MozMousePixelScroll"];
}

// -- prepare

function getName(name) {
	return Array.isArray(name) ? name : String(name).split(RegSpace)
}

function tap(items, func) {
	const
		isArray = Array.isArray(items),
		length = items.length;

	for (let i = 0; i < length; i++) {
		if (func(isArray ? items[i] : items.item(i)) === false) {
			return false
		}
	}

	return true
}

function bindEvent(collection, event, callback, func) {
	tap(collection, element => bind(element, event, callback, func))
}

function bindEvents(collection, events, callback, func) {
	tap(collection, element => tap(events, event => bind(element, event, callback, func)))
}

function bindWindow(name, callback, removed) {
	const rem = isFunc(removed);
	if (isWin && tap(name, n => bind(window, n, callback, adding))) {
		rem && removed(() => {
			tap(name, n => bind(window, n, callback, removing))
		})
	} else if (rem) {
		removed(noop)
	}
}

function make(collection, event, callback, func) {
	collection = createCollection(collection);
	if (collection.length) {
		event = getName(event);
		if (event.length > 1) {
			bindEvents(collection, event, callback, func)
		} else if (event.length) {
			bindEvent(collection, event[0], callback, func)
		}
	}
}

function bind(element, event, callback, func, capture) {
	if (arguments.length < 5) {
		capture = false
	}

	if (element[func]) {
		if (EventRename.hasOwnProperty(event)) {
			event = EventRename[event];
			if (Array.isArray(event)) {
				for (let i = 0, length = event.length; i < length; i++) {
					element[func](getOriginalEventName(event[i]), callback, capture)
				}
				return true
			}
		}

		element[func](getOriginalEventName(event), callback, capture);
		return true
	} else {
		return false
	}
}

// -- events

export function support(name) {
	return name != null && !!_support[name]
}

export function ready(callback) {
	if (isFunc(callback)) {
		if (docIsReady) setTimeout(callback, 0);
		else if (docCall.indexOf(callback) < 0) docCall.push(callback);
	}
}

export function addNativeEvent(element, name, callback, capture = false) {
	element && isFunc(callback) && bind(element, name, callback, adding, capture)
}

export function removeNativeEvent(element, name, callback, capture = false) {
	element && isFunc(callback) && bind(element, name, callback, removing, capture)
}

export function addEvent(element, name, callback) {
	make(element, name, callback, adding)
}

export function removeEvent(element, name, callback) {
	make(element, name, callback, removing)
}

export function hover(element, enter, leave, remove) {
	const rem = isFunc(remove);
	element = createCollection(element);
	if (element.length) {
		bindEvent(element, 'mouseenter', enter, adding);
		bindEvent(element, 'mouseleave', leave, adding);
		rem && remove(() => {
			bindEvent(element, 'mouseenter', enter, removing);
			bindEvent(element, 'mouseleave', leave, removing);
		})
	} else if (rem) {
		remove(noop)
	}
}

// window events

export function resize(callback, remove) {
	bindWindow(_support.orientationChange ? ['resize', 'orientationchange'] : ['resize'], callback, remove)
}

export function scroll(callback, remove) {
	bindWindow(['scroll'], callback, remove)
}

export function on(name, callback, remove) {
	bindWindow(getName(name), callback, remove)
}