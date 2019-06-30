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

+ `ownerDocument(HTMLElement)` : Returns the element's document owner.
+ `ownerWindow(HTMLElement)` : Returns the element's document window.
+ `activeElement()` : Returns focused element safely.
+ `offset(HTMLElement, [fixed = false])` : Return object `{ top: Number, left: Number, height: Number, width: Number}`, fixed is `true`, `false` or `"auto"`.
+ `Collection`
+ `createCollection(element, [context])` : Create new `Collection` class object.

+ `page`
	+ `pageWidth()`
	+ `pageHeight()`
	+ `scrollTop()`
	+ `scrollLeft()`
	+ `viewportWidth()`
	+ `viewportHeight()`
	+ `browserBarHeight()` : Returns the height of the mobile browser application bar.

+ `attribute(HTMLElement, name, [value])` : Set, get or remove `HTMLElement` attribute.

+ `element`
	+ `byId(selector)` : Wrapper for `document.getElementById()` function.
	+ `byQuery(selector, [element = document])` : Wrapper for `document.querySelectorAll()` function.
	+ `byQueryOne(selector, [element = document])` : Wrapper for `document.querySelector()` function.
	+ `byClassName(selector)` : Wrapper for `getElementsByClassName()` function.
	+ `byTag(selector)` : Wrapper for `document.getElementsByTagName()` function.
	+ `byName(selector)` : Wrapper for `document.getElementsByName()` function.
	+ `createElement(tagName, [attributes, parentElement])` : Create new element, add attributes (events, styles too) and append to parent element. Returns the created element.
	+ `append(HTMLElement, child)`
	+ `clone(HTMLElement, [refIdsRenamedObject])` : Clone the element and remove or replace id attributes.
	+ `empty(HTMLElement, [current = false])` : Remove all child nodes.
	+ `css(element, name, [value])` :
	+ `matches(HTMLElement, selector)` : `HTMLElement.matches()` wrapper and polyfill (if the browser does not support method)
	+ `closest(HTMLElement, selector)` : `HTMLElement.closest()` wrapper and polyfill (if the browser does not support method)

+ `classes`
	+ `addClass(element, className)`
	+ `removeClass(element, className)`
	+ `hasClass(element, className, [callback])`
	+ `notClass(element, className, [callback])`
	+ `toggleClass(element, className)`
	+ `testToggleClass(dir, element, className)`
	
+ `style`
	+ `styleName(name)`: Get valid vendor style name (for example opacity -> WebkitOpacity)
	+ `setStyle(HTMLElement, name, value)`: Set element style
	
+ `events`
	+ `support(name)` : Check support `touch`, `orientationChange`, `passive`.
	+ `ready(callback)` : Add the event `DOMContentLoaded` or call a function if the page was loaded.
	+ `addNativeEvent(HTMLElement, name, callback, [capture = false])`
	+ `removeNativeEvent(HTMLElement, name, callback, [capture = false])`
	+ `addEvent(element, name, callback)`
	+ `removeEvent(element, name, callback)`
	+ `resize(callback, [remove])` : Add resize events (`resize`, `orientationchange`) to window element.
	+ `scroll(callback, [remove])` : Add scroll event to window element.
	+ `on(name, callback, [remove])` : Add event to window element.
	+ `hover(element, enter, leave, [remove])`
