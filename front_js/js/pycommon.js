var numb = '0123456789';
var lwr = 'abcdefghijklmnopqrstuvwxyz';
var upr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

var monthNames = [
	"Jan", "Feb", "Mar",
	"Apr", "May", "Jun", "Jul",
	"Aug", "Sep", "Oct",
	"Nov", "Dec"
];

function isValid(parm, val) 
{
	if (parm == "") 
		return true;
	for (i=0; i < parm.length; i++) {
		if ( val.indexOf(parm.charAt(i),0) == -1 ) 
			return false;
	}
	return true;
}

function isNumber(parm)
{
	return isValid(parm, numb + ".,");
}

function isLower(parm)
{
	return isValid(parm,lwr);
}

function isUpper(parm) 
{
	return isValid(parm,upr);
}

function isAlpha(parm) 
{
	return isValid(parm,lwr + upr);
}

function isAlphanum(parm) 
{
	return isValid(parm, lwr + upr + numb);
}

function string_to_hex(str) 
{
	var hex = "";
	for ( var i=0; i < str.length; i++) {
		hex = hex + str.charCodeAt(i).toString(16);
	}
	return hex;
}

function string_to_hex32(str) 
{
	var hex = "";
	for ( var i = 0; i < str.length; i++) {
		s = str.charCodeAt(i).toString(16);
		while ( s.length < 4 )
			s = "0" + s;
		hex = hex + s;
	}
	return hex;
}

function hex_to_string(str) 
{
	var r = "";
	try{
		var str_l = 0;
		str_l = str.length;
		
		if ( str_l == 0 )
			return r;
			
		var i = 0;
		var s = "";
		while( i < str_l ) {
			s = "0x" + str.substr(i, 2);
			s2 = String.fromCharCode(s);
			r = r + String.fromCharCode(s);
			i = i + 2;
		}
	}
	catch(error){}
	return r;
}

function get_param_value(param_name)
{
	var retval = "";
	aURL = document.URL;
	parPos = aURL.indexOf('?');
	ParStr = "";
	if (parPos > -1 ) {
		ParStr = aURL.substring(parPos + 1, aURL.length);
		parPos = ParStr.indexOf(param_name + '=');
		if (parPos > -1 ) {
			parPos = parPos + param_name.length + 1;
			parEnds = ParStr.indexOf("&", parPos);
			if (parEnds < 0) 
	  			parEnds = ParStr.length;
			retval = ParStr.substring(parPos, parEnds);
		}
	}
	return retval;
}

function set_cookie(name, value, days) {
	if (value == null || typeof value == "undefined") {
		value = "";
	}
	let expires = "";
	if (days !== null && typeof days !== "undefined") {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = ";expires=" + date.toUTCString();
	}
    document.cookie = `${name}=${value}${expires};path=/`;
}

function get_cookie(name)
{
	var name = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while ( c.charAt(0) == ' ' )
			c = c.substring(1);
		if ( c.indexOf(name) == 0 ) {
			var value = c.substring(name.length, c.length);
			try {
				return decodeURIComponent(value);
			} catch(e) {
				return value;
			}
		}
	}
	return "";
}

function parseURL(url)
{
	if ( url.length <= 0 )
		return false;
    //save the unmodified url to href property
    //so that the object we get back contains
    //all the same properties as the built-in location object
    var loc = { 'href' : url };

    //split the URL by single-slashes to get the component parts
    var parts = url.replace('//', '/').split('/');

    //store the protocol and host
    loc.protocol = parts[0];
    loc.host = parts[1];

    //extract any port number from the host
    //from which we derive the port and hostname
    parts[1] = parts[1].split(':');
    loc.hostname = parts[1][0];
    loc.port = parts[1].length > 1 ? parts[1][1] : '';

    //splice and join the remainder to get the pathname
    parts.splice(0, 2);
    loc.pathname = '/' + parts.join('/');

    //extract any hash and remove from the pathname
    loc.pathname = loc.pathname.split('#');
    loc.hash = loc.pathname.length > 1 ? '#' + loc.pathname[1] : '';
    loc.pathname = loc.pathname[0];

    //extract any search query and remove from the pathname
    loc.pathname = loc.pathname.split('?');
    loc.search = loc.pathname.length > 1 ? '?' + loc.pathname[1] : '';
    loc.pathname = loc.pathname[0];

    //return the final object
    return loc;
}

function show_hide_obj(obj_id, show)
{
	var el = document.getElementById(obj_id);
	if ( el ) {
		if ( show )
			el.style.display = "";
		else
			el.style.display = "none";
	}
	return false;
}
 
function toggle_show_obj(obj_id, class_to_show, class_to_hide)
{
	var doc_element = document.getElementById(obj_id);
	if ( doc_element ) {
		if ( doc_element.style.display == "" ) {
			doc_element.style.display = "none";
			if (typeof class_to_show !== "undefined") {
				$("." + class_to_show).hide();
			}
			if (typeof class_to_hide !== "undefined") {
				$("." + class_to_hide).show();
			}
		}
		else {
			doc_element.style.display = "";
			if (typeof class_to_show !== "undefined") {
				$("." + class_to_show).show();
			}
			if (typeof class_to_hide !== "undefined") {
				$("." + class_to_hide).hide();
			}
		}
	}
	return false;
}

function display_element(obj_id, display_value)
{
	var el = document.getElementById(obj_id);
	if ( el ) {
		el.style.display = display_value;
	}
	return false;
}

function gpa_stats(addr)
{
	document.write('<iframe height="1" width="1" src="/services/gpa_redir.php?gpaid='+ addr +'"></iframe>');
}

function reloadImg(id) {
	var obj = document.getElementById(id);
	var src = obj.src;
	var pos = src.indexOf('?');
	if (pos >= 0) 
		src = src + "&";
	else
		src = src + "?";
	var date = new Date();
	obj.src = src + 'v=' + date.getTime();
	return false;
}

function findObjectPosX(obj)
{
	var curleft = 0;
	if(obj.offsetParent)
		while(1) 
		{
			curleft += obj.offsetLeft;
			if(!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else 
	if(obj.x)
		curleft += obj.x;
	return curleft;
}
  
function findObjectPosY(obj)
{
	var curtop = 0;
	if(obj.offsetParent)
		while(1)
		{
			curtop += obj.offsetTop;
			if(!obj.offsetParent)
				break;
			obj = obj.offsetParent;
		}
	else 
	if(obj.y)
		curtop += obj.y;
	return curtop;
}

function replace_non_ascii_chars(in_string, replace_char)
{
	var s = '';
	for (var i = 0; i < in_string.length; i++ ) {
		if ( in_string.charCodeAt(i) < 32 /* ' ' */ || in_string.charCodeAt(i) > 126 /*'~'*/ )
			s = s + replace_char;
		else
			s = s + in_string.charAt(i);
	}
	return s;
}

function parse_str_to_obj(instring)
{
	var args = instring.split('&');
	var argsParsed = new Object();
	for (i=0; i < args.length; i++)
	{
		arg = unescape(args[i]);
		if (arg.indexOf('=') == -1)
			argsParsed[arg.trim()] = true;
		else {
			var args_splitted = arg.split('=');
			argsParsed[args_splitted[0]] = args_splitted[1];
		}
	}
	return argsParsed;
}

function parse_str(instring)
{
	var args = instring.split('&');
	argsParsed = [];
	for (i=0; i < args.length; i++)
	{
		arg = unescape(args[i]);
		if (arg.indexOf('=') == -1)
			argsParsed[arg.trim()] = true;
		else {
			argsParsed[i] = arg.split('=');
		}
	}
	return argsParsed;
}

function getElementsByClassName_PY(node, classname) {
    var a = [];
    var re = new RegExp('(^| )'+classname+'( |$)');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

function increment_input_value(myInput, step) 
{
	if (typeof step == 'undefined' ) 
		step = 1;
	myInput.value = (+myInput.value + step) || 0;
	return false;
}

function decrement_input_value(myInput, step) 
{
	if (typeof step !== 'undefined' ) 
		myInput.value = myInput.value - step;
	else
		myInput.value = myInput.value - 1;
	if ( myInput.value < 0 )
		myInput.value = 0;
	return false;
}

function _slow_frame(item, height)
{
	var el = document.getElementById(item);
	if ( el ) {
		el.style.display = "";
		el.style.height = height;	
	}
}

function slow_appear(item, number_of_times, step_height)
{
	for (var i=0; i < number_of_times; i++) 
		setTimeout("_slow_frame('" + item + "', '" + ((i + 1) * step_height) + "px');", i * 50);	
	setTimeout("_slow_frame('"+item+"', 'auto');", number_of_times * 50);
}

function utf8_encode ( str_data ) {	// Encodes an ISO-8859-1 string to UTF-8
	
	str_data = str_data.replace(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < str_data.length; n++) {
		var c = str_data.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		} else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		} else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
	}

	return utftext;
}
function md5 ( str ) {	// Calculate the md5 hash of a string
	
	var RotateLeft = function(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		};

	var AddUnsigned = function(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		};

	var F = function(x,y,z) { return (x & y) | ((~x) & z); };
	var G = function(x,y,z) { return (x & z) | (y & (~z)); };
	var H = function(x,y,z) { return (x ^ y ^ z); };
	var I = function(x,y,z) { return (y ^ (x | (~z))); };

	var FF = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var GG = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var HH = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var II = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var ConvertToWordArray = function(str) {
			var lWordCount;
			var lMessageLength = str.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};

	var WordToHex = function(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

	str = this.utf8_encode(str);
	x = ConvertToWordArray(str);
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}

	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

	return temp.toLowerCase();
}

function currency_format(amount, currency_symbol, positive_color, negative_color, currency_symbol_position, digits, show_plus)
{
	if (typeof digits == 'undefined') {
		if ( Math.abs(amount) > 0.2 )
			digits = 2;
		else
		if ( Math.abs(amount) > 0.02 )
			digits = 3;
		else
		if ( Math.abs(amount) > 0.002 )
			digits = 4;
		else
		if ( Math.abs(amount) > 0.0002 )
			digits = 5;
		else
		if ( Math.abs(amount) > 0.00002 )
			digits = 6;
		else
			digits = 2;
	}
	
	amount = Number(amount);
	var res = "";
	if ( Math.abs(amount) > 1000000000 )
		res = (amount / 1000000000).toFixed(1) + "B";
	else
	if ( Math.abs(amount) > 1000000 )
		res = (amount / 1000000).toFixed(1) + "M";
	else
	if ( Math.abs(amount) > 1000 )
		res = amount.toFixed(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	else
		res = amount.toFixed(digits);
	if ( typeof currency_symbol !== 'undefined' && currency_symbol == '~' ) {
		
	}
	else
	if (typeof currency_symbol !== 'undefined') {
		if (currency_symbol_position == "right")
			res = res + currency_symbol;
		else
			res = currency_symbol + res;
	}
	else
		res = "$" + res;
	
	if (typeof show_plus !== 'undefined' && show_plus && amount >= 0) 
		res = "+" + res;

	if (typeof positive_color !== 'undefined' && positive_color.length > 0) {
		if ( amount >= 0 )
			res = "<span style='" + positive_color + ";'>" + res + "</span>";
	}
	if (typeof negative_color !== 'undefined' && negative_color.length > 0) {
		if ( amount < 0 )
			res = "<span style='" + negative_color + ";'>" + res + "</span>";
	}
	return res;
}

function clean_currency_format(amount)
{
	return amount.replace(/,/g, "");
}

function daysInFebruary(year) {
    if(year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        // Leap year
        return 29;
    } else {
        // Not a leap year
        return 28;
    }
}

function day_of_year() {
	var date = new Date();
	var feb = daysInFebruary(date.getFullYear());
	var aggregateMonths = [0, // January
                           31, // February
                           31 + feb, // March
                           31 + feb + 31, // April
                           31 + feb + 31 + 30, // May
                           31 + feb + 31 + 30 + 31, // June
                           31 + feb + 31 + 30 + 31 + 30, // July
                           31 + feb + 31 + 30 + 31 + 30 + 31, // August
                           31 + feb + 31 + 30 + 31 + 30 + 31 + 31, // September
                           31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30, // October
                           31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31, // November
                           31 + feb + 31 + 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30, // December
                         ];
    return aggregateMonths[date.getMonth()] + date.getDate();
}

function htmlDecode(input){
	var e = document.createElement("div");
	e.innerHTML = input;
	return e.childNodes[0].nodeValue;
}

function to_block(name, const_offset)
{
	if ( typeof const_offset == "undefined" )
		const_offset = 50;
	if(name == '') pos = 1;
	else 
		var pos = $('#' + name).offset().top - const_offset;
	$('html, body').animate({scrollTop: pos}, '500');
	return false;
}

function get_text_between_tags(inputStr, delimeterLeft, delimeterRight) 
{ 
	if ( typeof inputStr == "undefined" )
		return "";

	if ( delimeterLeft.strlen == 0 )
		posLeft = 0;
	else
		posLeft = inputStr.indexOf(delimeterLeft); 
    if ( posLeft < 0 )
		return false; 
    posLeft = posLeft + delimeterLeft.length; 
	if ( delimeterRight.length == 0)
		posRight = inputStr.length;
	else {
		posRight = inputStr.indexOf(delimeterRight, posLeft); 
		if ( posRight < 0 )
			posRight = inputStr.length;
	}
    return inputStr.substring(posLeft, posRight); 
}

function ajax_frm_submit(html_form, ajax_frm_preprocess, ajax_frm_on_sucess, ajax_frm_on_error)
{
	if ( typeof ajax_frm_preprocess !== "undefined" && ajax_frm_preprocess.length > 0 )
		eval(ajax_frm_preprocess + "();");
	
	show_message_box_box("", "<div style='width:100%; text-align:center;'><img src='/images/wait64x64.gif' width='32' height='32' border='0'><br>Please wait...</div>", 1);
	
	req_url = "/api/save_data";
	var els = html_form.elements;
	var l = els.length;
	var data_str = "";
	var arr_ajax__result = new Array();
	for (var i = 0; i < l; i++)	{
		if (data_str.length > 0)
			data_str = data_str + "&";
		if (els[i].name[0] == "~")
			val = string_to_hex(encodeURIComponent(els[i].value));
		else
			val = els[i].value;
		data_str = data_str + els[i].name + "=" + val;
	}
	$.ajax({
		method: "POST",
		url: req_url,
		data: data_str,
		cache: false
	})
	.done(function( ajax__result ) {
		
		var processed = 0;
		var error_message = "Order has been declined.";
		try
		{
			arr_ajax__result = JSON.parse(ajax__result);
			if ( arr_ajax__result["success"] ) {
				processed = 1;
			}
			else {
				if (typeof arr_ajax__result["error_code"] !== 'undefined' && arr_ajax__result["error_code"].length > 0) {
					switch (arr_ajax__result["error_code"]) {
						case "wrong_token" :
							error_message = "Wrong captcha code";		
						break;
					}
				}
				else
				if (typeof arr_ajax__result["message"] !== 'undefined' && arr_ajax__result["message"].length > 0) 
					error_message = arr_ajax__result["message"];
			}
		}
		catch(error){}
		if (processed) {
			if ( typeof ajax_frm_on_sucess !== "undefined" && ajax_frm_on_sucess.length > 0 )
				eval(ajax_frm_on_sucess + "(arr_ajax__result);");
			else 
				show_message_box_box("Success", "Data has been submitted.", 1);
		}
		else {
			if ( typeof ajax_frm_on_error !== "undefined" && ajax_frm_on_error.length > 0 )
				eval(ajax_frm_on_error + "(arr_ajax__result);");
			else
				show_message_box_box("Error", error_message, 2);
		}
	});
	
	return false;
}

function validate_bootstrap_obj(obj_name)
{	
	var tmp_obj = document.getElementById(obj_name);
	var valid = true;
	if ( tmp_obj ) {
		var formGroup = $("#" + obj_name).parents('.input-group');
		var glyphicon = formGroup.find('.form-control-feedback');
		if (valid && tmp_obj.checkValidity() ) {
			formGroup.addClass('has-success').removeClass('has-error');
			glyphicon.addClass('glyphicon-ok').removeClass('glyphicon-remove');
			return true;
		} 
		else {
			formGroup.addClass('has-error').removeClass('has-success');
			glyphicon.addClass('glyphicon-remove').removeClass('glyphicon-ok');
			return false;
		}
	}
}

function check_login(ajax__result)
{
	if ( ajax__result.indexOf("<need_to_login>") >= 0 ) {
		if (typeof do_login === "function")
			do_login();
		else {
			setInterval( function() { 
				location.assign("/login.php");
			}, 1000)
		}
		return false;
	}
	else 
		return true;
}

function leading_zero(num, len) 
{
	return (Array(len).join("0") + num).slice(-len);
}

function select_text_by_click(objId) 
{
	if (typeof it_is_mobile_device != 'undefined' && it_is_mobile_device )
		return;
	
	var myNode = document.getElementById(objId);
	// Create a range
    try{ // FF
        var myRange = document.createRange();
    }catch(e){
        try{ // IE
            var myRange = document.body.createTextRange();
        }catch(e){
            return;
        }
    }

    // Asign text to range
    try{ // FF
        myRange.selectNode(myNode);
    }catch(e){
        try{ // IE
            myRange.moveToElementText(myNode);
        }catch(e){
            return;
        }
    }

    // Select the range
    try{ // FF
        var mySelection = window.getSelection();
        mySelection.removeAllRanges(); // Undo current selection
        mySelection.addRange(myRange);
    }catch(e){
        try{ // IE
            myRange.select();
        }catch(e){
            return;
        }
    }
}

function write_console_log(message) 
{
	currentdate = new Date(); 
	if ( message.toLowerCase().indexOf("error") >= 0 )
		console.error(currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + " " + message);
	else
		console.log(currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds() + " " + message);
}

function replaceCustomConstantInText(code, value, text)
{
	var find = "{$" + code + "}";
	while ( text.indexOf(find) >= 0 )
		text = text.replace(find, value);
	return text;
}

function convert_text_to_number(currency)
{
	return Number(currency.replace(/[^0-9\.]+/g,""));
}

// Base64 encode / decode
// Use: Base64.decode(<text>); Base64.encode(<text>);
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

function xor_decrypt(key, c_text)
{
	var longkey = "";
	var result = "";
	var c_text = Base64.decode(c_text);
	for (i = 0; i <= Number( c_text.length / key.length ); i++ ) {
		longkey = longkey + key;
	}
	for (i = 0; i < c_text.length; i++ ) {
		toto = String.fromCharCode( Number( c_text.charCodeAt(i) ) ^ Number( longkey.charCodeAt(i) ) );
		result = result + toto;
	}
	return result;
}

function scorePassword(pass) {
	$("#password_weakness_div").show();
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    if (score > 80) {
		$("#password_weakness_progress").removeClass("progress-bar-danger").removeClass("progress-bar-warning").addClass("progress-bar-success");
		$("#password_weakness_progress").css("width", "100%");
		$("#password_weakness_description").removeClass("text-danger").removeClass("text-warning").addClass("text-success");
        $("#password_weakness_name").html("Strong");
	}
	else
    if (score > 60) {
		$("#password_weakness_progress").removeClass("progress-bar-danger").removeClass("progress-bar-success").addClass("progress-bar-warning");
		$("#password_weakness_progress").css("width", "50%");
		$("#password_weakness_description").removeClass("text-danger").removeClass("text-success").addClass("text-warning");
        $("#password_weakness_name").html("Good");
	}
	else {
		$("#password_weakness_progress").removeClass("progress-bar-warning").removeClass("progress-bar-success").addClass("progress-bar-danger");
		$("#password_weakness_progress").css("width", "20%");
		$("#password_weakness_description").removeClass("text-warning").removeClass("text-success").addClass("text-danger");
		$("#password_weakness_name").html("Weak");
	}
}

function get_transaction_description(transaction_type)
{
	var res = "";
	switch (transaction_type) {
		case "AF": res = "added funds"; break; 
		case "AJ": res = "adjust balance"; break; 
		case "AI": res = "admin info"; break; 
		case "BN": res = "bonus"; break; 
		case "BR": res = "borrow"; break;
		case "RR":
		case "CL": res = "reward"; break; 
		case "CO": res = "add funds"; break;
		case "CB": 
		case "CS": res = "exchange"; break;
		case "DI": res = "earning"; break;  
		case "DN": res = "transfer"; break;
		case "DV": res = "dividend"; break; 
		case "FE": res = "fee"; break; 
		case "GR": res = "reward"; break;
		case "GT": res = "enrollment"; break;
		case "I":  res = "reason"; break; 
		case "IN": res = "installment"; break; 
		case "JB": res = "reward for job"; break; 
		case "LA": res = "set-off"; break; 
		case "LI": res = "interest"; break; 
		case "LL": res = "lend"; break; 
		case "LN": res = "loan"; break; 
		case "LP": res = "installment"; break; 
		case "MR": res = "merchant&#39;s sale"; break;
		case "PO": res = "payout"; break; 
		case "PP": res = "withdrawal of funds"; break;
		case "PT": res = "surfing"; break; 
		case "RA": res = "reward affiliate"; break;
		case "RE": res = "reversal"; break;
		case "RI": res = "earn"; break; 
		case "SA": res = "sale"; break; 
		case "SC": res = "issue"; break; 
		case "SH": res = "purchase"; break; 
		case "SM": res = "purchase"; break; 
		case "SR": res = "commission"; break; 
		case "SS": res = "sale"; break; 
		case "SV": res = "service"; break; 
		case "RE": res = "reversal"; break; 
		case "TD": res = "deposit"; break; 
		case "UP": res = "upgrade"; break;
		
		case "RF": 
		case "HA": 
		case "TB": res = ""; break; 
	}
	return res;
}

function copy_text_from_input(input_id) {
	var copyText = document.getElementById(input_id);
	copyText.select();
	copyText.setSelectionRange(0, 99999)
	return document.execCommand("copy");
}

function array2json(arr)
{
	var parts = [];
	var is_list = (Object.prototype.toString.apply(arr) === '[object Array]');

	for(var key in arr) {
		var value = arr[key];
		if (typeof value == "object") {
			if (is_list) 
				parts.push(array2json(value)); 
			else 
				parts.push('"' + key + '":' + array2json(value));
		} 
		else
		if (typeof value == "function") {
		}
		else {
			var str = "";
			if (!is_list) 
				str = '"' + key + '":';
			if (typeof value == "number") 
				str += value;
			else 
			if (value === false) 
				str += 'false';
			else 
			if (value === true) 
				str += 'true';
			else 
				str += '"' + value + '"';
			parts.push(str);
		}
	}
	var json = parts.join(",");
	if (is_list) 
		return '[' + json + ']';
	return '{' + json + '}'; 
}

function crc32(r)
{
	for(var a,o=[],c=0; c<256; c++){
		a = c;
		for(var f=0; f<8; f++)
			a = 1 & a ? 3988292384^a>>>1 : a>>>1;
			o[c] = a;
	}
	for(var n=-1, t=0; t < r.length; t++)
		n=n>>>8^o[255&(n^r.charCodeAt(t))];
	return(-1^n)>>>0;
};

function get_domain_name(url) 
{
    const urlParts = url.split('://');
    if (urlParts.length > 1) {
        return urlParts[1].split('/')[0];
    } else {
        return url;
    }
}