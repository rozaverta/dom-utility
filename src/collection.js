import {type, isWeb, isString, instanceOf, isWindowElement} from "typeof-utility";

const _isWeb = isWeb();
const _ArrayProto = Array.prototype;

function Copy(collection, htmlCollection) {
	for (let i = 0, length = htmlCollection.length; i < length; i++) {
		collection.add(htmlCollection[i])
	}
}

/**
 * @return {boolean}
 */
function FoundCollection(element) {
	if (!isString(element.selector)) {
		return false
	}

	let doc = element.document || {};
	return doc.nodeType === 1 || doc.nodeType === 9;
}

function Fill(collection, element, level) {
	let tof = type(element);

	if (tof === 'Node' || tof === 'Window') {
		collection.add(element)
	} else if (tof === 'NodeList' || tof === 'Object' && instanceOf(element, Collection)) {
		Copy(collection, element)
	} else if (tof === 'Array') {
		if (level < 3) {
			for (let i = 0, length = element.length; i < length; i++) {
				Fill(collection, element[i], level + 1);
			}
		}
	} else if (tof === 'Object' && FoundCollection(element)) {
		Copy(collection, element.document.querySelectorAll(element.selector))
	} else if (tof === "String") {
		Copy(collection, document.querySelectorAll(element))
	}
}

const propertyPropsCollection = ["concat", "reverse", "sort"];
const propertyPropsNewCollection = ["map", "filter", "slice"];
const propertyProps = ["entries", "every", "find", "findIndex", "forEach", "includes", "indexOf", "keys", "lastIndexOf", "pop", "shift", "some", "splice", "values"];

class Collection {
	constructor(element, context) {
		const self = this, items = [];

		Object.defineProperties(self, {
			length: {
				get() {
					return items.length
				}
			},
			item: {
				value(index) {
					return items[index]
				}
			},
			add: {
				value(node) {
					if(node != null && (node.nodeType === 1 || node.nodeType === 9 || isWindowElement(node)) && items.indexOf(node) < 0) items[items.length] = node
				}
			},
			toArray: {
				value() {
					return items.slice()
				}
			}
		});

		propertyPropsCollection.forEach(key => {
			Object.defineProperty(self, key, {
				value() {
					_ArrayProto[key].apply(items, arguments);
					return self
				}
			})
		});

		propertyPropsNewCollection.forEach(key => {
			Object.defineProperty(self, key, {
				value() {
					return createCollection( _ArrayProto[key].apply(items, arguments) )
				}
			})
		});

		propertyProps.forEach(key => {
			Object.defineProperty(self, key, {
				value() {
					return _ArrayProto[key].apply(items, arguments)
				}
			})
		});

		if (element != null) {
			if(context != null && isString(element) && (context.nodeType === 1 || context.nodeType === 9)) {
				element = {selector: element, document: context}
			}
			self.fill(element)
		}
	}

	fill(element) {
		if(_isWeb && element != null) {
			if(arguments.length > 1) {
				element = _ArrayProto.slice.call(arguments)
			}
			Fill(this, element, 0);
		}
		return this;
	}
}

/**
 * Get collection instance
 *
 * @param element
 * @param context
 * @returns {Collection}
 */
export function createCollection(element, context) {
	if (arguments.length > 0) {
		if (instanceOf(element, Collection)) {
			return element
		} else {
			return new Collection(element, context)
		}
	} else {
		return new Collection()
	}
}

export default Collection;