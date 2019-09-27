import {isNumeric} from "typeof-utility";
import {toCamelCase} from "./utils";

let cssNumber = {};
let cssProp = {"float": "cssFloat"};

('animationIterationCount,columnCount,fillOpacity,flexGrow,flexShrink,fontWeight,lineHeight,opacity,order,orphans,widows,zIndex,zoom').split(',').forEach(n => { cssNumber[n] = true });

const regExpCustomProp = /^--/;
const emptyStyle = typeof document !== 'undefined' && document.createElement ? document.createElement( "div" ).style : {};
const cssPrefixes = [ "Webkit", "Moz", "Khtml", "ms" ];

const toCamel = name => {
	name = String(name);
	return name.substr(0, 2) === '--' ? name : toCamelCase(name)
};

function vendorStyleName( name )
{
	// Shortcut for names that are not vendor prefixed
	if( name in emptyStyle )
	{
		return name;
	}

	// Check for vendor prefixed names
	let capName = name[0].toUpperCase() + name.slice(1), i = cssPrefixes.length;

	while( i-- )
	{
		name = cssPrefixes[i] + capName;
		if ( name in emptyStyle )
		{
			return name;
		}
	}
}

export function styleName( name )
{
	name = toCamel(name);

	let ret = cssProp[ name ];
	if ( !ret )
	{
		ret = cssProp[ name ] = vendorStyleName( name ) || name;
	}
	return ret;
}

export function setStyle(element, name, value)
{
	if(element != null && element.style) {
		if( regExpCustomProp.test( name ) )
		{
			element.style.setProperty( name, value )
		}
		else
		{
			name = styleName(name);
			if( !value && value !== 0 )
			{
				value = ''
			}
			else
			{
				value += isNumeric(value) && ! cssNumber[name] ? 'px' : '';
			}

			element.style[name] = value
		}
	}
}

export function getStyle(element, name) {
	return element != null && element.style && ( regExpCustomProp.test(name) ? element.style.getPropertyValue(name) : element.style[styleName(name)] ) || ""
}