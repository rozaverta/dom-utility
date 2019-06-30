import {scrollTop, scrollLeft} from "./page";
import {ownerWindow} from "./utils";

let _offset;

function getStyle(el) {

	// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
	// IE throws on elements created in popups
	// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
	let view = ownerWindow(el);

	if (!view || !view.opener) {
		view = window;
	}

	return view.getComputedStyle(el);
}

function isFixed(el) {
	while (el && el.nodeName.toLowerCase() !== 'body') {
		if (getStyle(el).getPropertyValue('position').toLowerCase() === 'fixed') return true;
		el = el.parentElement;
	}
	return false;
}

if (typeof document !== "undefined" && document.createElement("span").getBoundingClientRect) {

	_offset = (element, fixed = false) => {
		let box = element.getBoundingClientRect(),
			ref = {
				top: Math.round(box.top),
				left: Math.round(box.left),
				width: box.right - box.left,
				height: box.bottom - box.top
			};

		if (!fixed) {
			ref.top += scrollTop();
			ref.left += scrollLeft();
		}

		return ref
	}
} else {

	_offset = (element, fixed = false) => {
		let offsetTop = 0, offsetLeft = 0;

		while (element) {
			offsetTop += element.offsetTop;
			offsetLeft += element.offsetLeft;
			element = element.offsetParent
		}

		if (fixed) {
			offsetTop -= scrollTop();
			offsetLeft -= scrollLeft();
		}

		return {
			top: Math.round(offsetTop),
			left: Math.round(offsetLeft),
			width: element.offsetWidth,
			height: element.offsetHeight
		}
	}
}

export default function offset(element, fixed = false) {
	if (element && element.nodeType === 1) {
		const auto = fixed === 'auto';

		if (auto) {
			try {
				fixed = isFixed(element);
			} catch (e) {
				fixed = false
			}
		}

		const obj = _offset(element, fixed);
		if (auto) {
			obj.fixed = fixed
		}

		return obj
	} else {
		return {
			width: 0, height: 0, top: 0, left: 0
		}
	}
}