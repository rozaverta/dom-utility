import {isEmpty, isString} from "typeof-utility";

const regCamel = /-([a-z])/g;
const regReplace = /%s/g;

const upper = (a, b) => b.toUpperCase();

export function toCamelCase(name) {
	return String(name).replace(regCamel, upper)
}

export function noop() {
}

export function makeError(text, args) {
	if (!Array.isArray(args)) {
		args = isEmpty(args) ? [] : [args]
	}

	if (!text) {
		text = "Error"
	} else if (text instanceof Error || Error.prototype.isPrototypeOf(text)) {
		if (isString(args[0])) {
			try {
				text.message = args[0] + ": " + text.message
			} catch (e) {
			}
		}
		return text
	}

	let i = 0;
	return new Error(String(text).replace(regReplace, () => args[i++]))
}

export function log(text, ...args) {
	console.log(makeError(text, args))
}

export function ownerDocument(node) {
	return (node && node.ownerDocument) || document;
}

export function ownerWindow(node) {
	let doc = ownerDocument(node);
	return doc && doc.defaultView || doc.parentWindow;
}

export function activeElement(doc = ownerDocument()) {
	try {
		return doc.activeElement;
	}
	catch (e) { /* ie error */ }
}