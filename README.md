# dom-utility

> DOM utility library

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm i --save dom-utility
```

## Usage

```js
import {element} from "dom-utility"

const click = () => {alert("Hi!")};
const styles = {border: "1px solid red", padding: 10};
let elm;

// create element

elm = element.createElement("div#elmId.first-class", {onClick: click, styles: styles}, byId("app"));

// alternatively

elm = document.createElement("div");
elm.setAttribute("id", "elmId");
elm.className = "first-class";
elm.style.border = styles.border;
elm.style.padding = styles.padding + "px";
elm.addEventListener("click", click, false);
document.getElementById("app").appendChild(elm);
```

## Short description

+ `ownerDocument(element)`: returns the element's document owner.
+ `ownerWindow(element)`: returns the element's document window.
+ `activeElement()`: return focused element safely.
+ `offset(element, [fixed = false])`: return object `{ top: Number, left: Number, height: Number, width: Number}`, fixed is `true`, `false` or `"auto"`.
+ `Collection`
+ `createCollection(element, [context])` : create new `Collection` class object

+ `page`
	+ `pageWidth()`
	+ `pageHeight()`
	+ `scrollTop()`
	+ `scrollLeft()`
	+ `viewportWidth()`
	+ `viewportHeight()`
	+ `browserBarHeight()` : Returns the height of the mobile browser application bar.

+ `attribute(element, name, [value])` : Set, get or remove HTMLElement attribute.

+ `element`
	+ `byId(selector)` : wrapper for `document.getElementById()` function.
	+ `byQuery(selector, [element = document])` : wrapper for `document.querySelectorAll()` function.
	+ `byQueryOne(selector, [element = document])` : wrapper for `document.querySelector()` function.
	+ `byClassName(selector)` : wrapper for `getElementsByClassName()` function.
	+ `byTag(selector)` : wrapper for `document.getElementsByTagName()` function.
	+ `byName(selector)` : wrapper for `document.getElementsByName()` function.
	+ `createElement(tagName, [attributes, parentElement])` : create new element, add attributes (events, styles too) and append to parent element. Returns the created element.
	+ `append(element, child)`
	+ `clone(element, [refIdsRenamedObject])` : clone the element and remove or replace id attributes.
	+ `empty(element, [current = false])` : remove all child nodes.
	+ `css(element, name, [value])` :
	+ `matches(element, selector)` : `HTMLElement.matches()` wrapper and polyfill (if the browser does not support method)
	+ `closest(element, selector)` : `HTMLElement.closest()` wrapper and polyfill (if the browser does not support method)

+ `classes`
	+ `addClass(element, className)`
	+ `removeClass(element, className)`
	+ `hasClass(element, className, [callback])`
	+ `notClass(element, className, [callback])`
	+ `toggleClass(element, className)`
	+ `testToggleClass(dir, element, className)`
	
+ `style`
	+ `styleName(name)`: Get valid vendor style name (for example opacity -> WebkitOpacity)
	+ `setStyle(element, name, value)`: Set element style
	
+ `events`
	+ `support(name)` : check support `touch`, `orientationChange`, `passive`
	+ `ready(callback)` : add the event `DOMContentLoaded` or call a function if the page was loaded
	+ `addNativeEvent(HTMLElement, name, callback, [capture = false])`
	+ `removeNativeEvent(HTMLElement, name, callback, [capture = false])`
	+ `addEvent(element, name, callback)`
	+ `removeEvent(element, name, callback)`
	+ `resize(callback, [remove])` : Add resize events (`resize`, `orientationchange`) to window element
	+ `scroll(callback, [remove])` : Add scroll event to window element.
	+ `on(name, callback, [remove])` : Add event to window element.
	+ `hover(element, enter, leave, [remove])`