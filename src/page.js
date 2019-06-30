import {ready} from "./events";

let getZ0 = () => 0,
	getWH = () => 320;

let pageWidth   = getWH, viewportWidth   = getWH,
	pageHeight  = getWH, viewportHeight  = getWH,
	scrollTop   = getZ0, scrollLeft      = getZ0, browserBarHeight = getZ0;

if( typeof window !== "undefined" && window.document && window.navigator )
{
	let Body = {
		clientWidth:    getWH(),
		clientHeight:   getWH(),
		scrollTop:      0,
		scrollLeft:     0
	};

	const DocElem = document.documentElement;
	const ua = navigator.userAgent.toLowerCase();
	const isOpera = (ua.indexOf('opera')  > -1);
	const isIE = (!isOpera && ua.indexOf('msie') > -1);
	const CSS1Compat = document.compatMode === 'CSS1Compat';

	if( document.body ) {
		Body = document.body
	}
	else {
		ready(() => {
			Body = document.body
		})
	}

	const getViewportWidth  = ((document.compatMode || isIE) && !isOpera) ? CSS1Compat ? () => (DocElem.clientWidth)  : () => (Body.clientWidth)  : () => ((document.parentWindow || document.defaultView).innerWidth);
	const getViewportHeight = ((document.compatMode || isIE) && !isOpera) ? CSS1Compat ? () => (DocElem.clientHeight) : () => (Body.clientHeight) : () => ((document.parentWindow || document.defaultView).innerHeight);

	pageWidth               = () => ( window.innerWidth  || Body.clientWidth );
	pageHeight              = () => ( window.innerHeight || Body.clientHeight );

	browserBarHeight        = () => {
		const
			innerHeight = ( window.innerHeight || Body.clientHeight ),
			clientHeight = DocElem.clientHeight || 0;

		return clientHeight > 0 && clientHeight < innerHeight ? (innerHeight - clientHeight) : 0
	};

	scrollTop       = () => ( (window.pageYOffset || DocElem.scrollTop  || Body.scrollTop)  - (DocElem.clientTop  || Body.clientTop  || 0) );
	scrollLeft      = () => ( (window.pageXOffset || DocElem.scrollLeft || Body.scrollLeft) - (DocElem.clientLeft || Body.clientLeft || 0) );
	viewportWidth   = () => ( Math.max(CSS1Compat ? DocElem.scrollWidth  : Body.scrollWidth,  getViewportWidth()) );
	viewportHeight  = () => ( Math.max(CSS1Compat ? DocElem.scrollHeight : Body.scrollHeight, getViewportHeight()) );
}

export {pageWidth, pageHeight, scrollTop, scrollLeft, viewportWidth, viewportHeight, browserBarHeight};