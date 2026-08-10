var session_token = "";
var make_api_request_max_number_of_attempts = 10;
var just_logged_in = false;
var userid = get_cookie("user_id");
var password_session = localStorage.getItem('cb_token');
var is_loggedin = userid.length > 0 && typeof localStorage.getItem('cb_token') !== "undefined";
var refresh_balance_last_time_refreshed = 0;
var refresh_balance_timer = 0;
var currency_balances = [];
var balance_data = null;
var balance_total_in_usd = 0;
var cache_arr = [];
var account_verified = false;
var number_of_fail_logins = 0;
var is_loggedin = 0;

function user_is_loggedin()
{
	let res = userid.length > 0 && typeof localStorage.getItem('cb_token') !== "undefined";
	if (!res) {
		set_cookie("user_id", "");
		localStorage.removeItem('cb_token');
	}
	return res;
}

function make_api_request(
	request, 
	data, 
	on_answer, 
	on_error, 
	on_exception, 
	on_done, 
	number_of_attempts, 
	on_network_failure,
	dont_login
)
{
	if ( typeof number_of_attempts == 'undefined' ) {
		var number_of_attempts = 0;
	}

	data.device_hash = "";

	if (typeof dont_login == "undefined" || !dont_login) {
		if (get_cookie("user_id").length > 0) {
			data.userid = get_cookie("user_id");
		}
		else
		if (get_cookie("userid").length > 0) {
			data.userid = get_cookie("userid");
		}
		if (typeof localStorage.getItem('cb_token') !== "undefined" && localStorage.getItem('cb_token').length > 0) {
			data.token = localStorage.getItem('cb_token');
		}
		else
		if (get_cookie("password").length > 0) {
			data.token = get_cookie("password");
		}
	
		try {
			if ((typeof data.userid == "undefined" || data.userid.length == 0) && (typeof data.token == "undefined" || data.token.length == 0) && userid.length > 0 && password_session.length > 0) {
				data.userid = userid;
				data.token = password_session;
			}
		}
		catch(error){}

		if ( (typeof data.token == 'undefined' || data.token.length == 0) && session_token.length > 0 ) {
			data.token = session_token;
		}
	}

	if ( typeof data.token == 'undefined' || data.token.length == 0 ) {
		$.ajax({
			method: "POST",
			url: SITE_DOMAIN + "api/api_token_seed",
			data: {}
		})
		.done(function( ajax__result ) {
			try {
				let arr_ajax__result = JSON.parse(ajax__result);
				if ( arr_ajax__result["success"] ) {
					let new_data = data;
					new_data["token"] = md5( arr_ajax__result["values"] + Math.floor(Date.now() / 1000 / 60) );
					session_token = new_data["token"];
					make_api_request(
						request, 
						new_data, 
						on_answer, 
						on_error, 
						on_exception, 
						on_done, 
						number_of_attempts, 
						on_network_failure,
						dont_login
					);
				}
			}
			catch(error){}
		});
	}
	else {
		$.ajax({
			method: "POST",
			url: SITE_DOMAIN + "api/" + request + "/",
			data: data
		})
		.done(function( ajax__result ) {
			try {
				var arr_ajax__result = JSON.parse(ajax__result);
				if ( arr_ajax__result["success"] ) {
					if (typeof on_answer === "function") {
						on_answer(arr_ajax__result, ajax__result);
					}
				}
				else {
					if ( arr_ajax__result["error_code"] == 2 ) {
						// Session expired. Need to login
						if (typeof dont_login == "undefined" || !dont_login) {
							if ( typeof Android != 'undefined' ) {
								try	{
									just_logged_in = true;
									var email_addr = Android.get_email_addr();
									var password_hash = Android.get_password_hash();
									login(
										email_addr, 
										"", 
										password_hash
									);
								}
								catch(error){

								}
							}
							else {
								userid = "";
								password_session = "";
								do_login();
							}
						}
					}
					if (typeof on_error === "function") {
						on_error(arr_ajax__result, ajax__result);
					}
				}
			}
			catch(error){
				if (typeof on_exception === "function") {
					on_exception(error, ajax__result);
				}
			}
			if (typeof on_done === "function") {
				on_done(ajax__result);
			}
		})
		.fail(function() {
			if (typeof on_network_failure === "function") {
				on_network_failure();
			}
			if (number_of_attempts < make_api_request_max_number_of_attempts) {
				setTimeout(function() {
					make_api_request(request, data, on_answer, on_error, on_exception, on_done, number_of_attempts);
				}, 10000 + number_of_attempts * 10000);
			}
			number_of_attempts++;
		});
	}
}

class fake_Android {
	constructor ()
	{
	}
	read_value(name) {
		return get_cookie(name);
	}
	save_value(name, value) {
		set_cookie(name, value);
	}
	
	get_user_id() {

	}
	
	get_password_session() {

	}
	
	get_email_addr() {

	}
	
	get_password_hash() {

	}
	
	get_clipboard() {

	}

	share_message(message) {
		
	}

	
	activate_qr_scanner() {
	}

	show_alert(message) {
		
	}

	show_debug_alert(message) {
		
	}
	
	read_log_file(log_name) {
		
	}
	
	open_web_page(web_page, local_folder) {
		
	}
	
	open_web_page_in_default_browser(web_page) {
		
	}
	
	get_app_name() {
		
	}
	
	get_version_name() {
		
	}

	get_package_name() {
		
	}
	
	get_site_domain() {
		
	}
}

if ( typeof pulsate_item == "undefined" ) {
	var id_to_pulsate = "";
	function pulsate_item(times, speed)
	{
		if ( typeof times == "undefined" ) 
			var times = 10;
		if ( typeof speed == "undefined" ) 
			var speed = 30;
		
		for (let i = 0; i < times; i++ ) {
			$("#" + id_to_pulsate)
				.animate( { opacity: "0" }, speed )
				.animate( { opacity: "1" }, speed );
		}
	}
}

function change_url(url, open_in_browser)
{
	if ( typeof Android != 'undefined' ) {
		try	{
			if ( typeof open_in_browser != "undefined" && open_in_browser )
				Android.open_web_page_in_default_browser(url);
			else
				Android.open_web_page(url, "");
		}
		catch(error){}
	}
	else
		location.assign(url);
}

function save_value_otside(name, value)
{
	if ( typeof Android != 'undefined' ) {
		try	{
			Android.save_value(name, value);
		}
		catch(error){}
	}
	else
	if ( typeof Fake_Android != 'undefined' ) {
		try	{
			Fake_Android.save_value(name, value);
		}
		catch(error){}
	}
}

function read_value_from_otside(name) {
	if ( typeof Android != 'undefined' ) {
		try	{
			return Android.read_value(name);
		}
		catch(error){}
	}
	else
	if ( typeof Fake_Android != 'undefined' ) {
		try	{
			return Fake_Android.read_value(name);
		}
		catch(error){}
	}
	return false;
}

function draw_rounded_circle(width, color_of_circle, color_of_dot, ring_thickness, satelite_radius )
{
	if (typeof width == 'undefined' )
		width = 30;
	if (typeof color_of_circle == 'undefined' ) 
		color_of_circle = "#00FF00";
	if (typeof color_of_dot == 'undefined' ) 
		color_of_dot = "#00aa00";
	if (typeof ring_thickness == 'undefined' ) 
		ring_thickness = "2";
	if (typeof satelite_radius == 'undefined' ) 
		satelite_radius = "3";
	return `<svg version="1.1" id="L3" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 0 0" xml:space="preserve" style="width:` + width + `px; height:`+ width +`px; margin:-` + Math.round(width / 2) + `px -` + Math.round(width / 2) + `px; display:inline-block;">
<circle fill="none" stroke="` + color_of_circle + `" stroke-width="` + ring_thickness + `" cx="50" cy="50" r="44" style="opacity:0.9;"></circle>
<circle fill="` + color_of_dot + `" stroke="#ffffff" stroke-width="` + satelite_radius + `" cx="92" cy="40" r="8" transform="rotate(246.654 50 50.7406)">
<animateTransform attributeName="transform" dur="2s" type="rotate" from="0 50 48" to="360 50 52" repeatCount="indefinite"></animateTransform>
</circle>
</svg>`;
}

function search_in_pattern(match)
{
	var res = "";
	try
	{
		if (match) {
			if (match[2] && match[2].length > 0)
				res = match[2];
			else
			if (match[1] && match[1].length > 0)
				res = match[1];
			else
			if (match[0] && match[0].length > 0)
				res = match[0];
		}
	}
	catch(error) {}
	return res;
}

function decode_address(text)
{
	var address = text;
	var addr_found = false;
	try
	{
		if ( typeof global_crypto_currencies != "undefined" && global_crypto_currencies !== null) {
			for (var crypto_currency in global_crypto_currencies) {
				var crypto = global_crypto_currencies[crypto_currency];
				var pattern = new RegExp(crypto.pattern);
				var match = pattern.exec(text);
				var tmp_s = search_in_pattern(match);
				if (tmp_s.length > 0) {
					address = tmp_s;
					addr_found = true;
					break;
				}
			}
		}
		if (!addr_found && typeof current_pattern != "undefined") {
			var pattern = new RegExp(current_pattern);
			var match = pattern.exec(text);
			var tmp_s = search_in_pattern(match);
			if (tmp_s.length > 0) {
				address = tmp_s;
				addr_found = true;
			}
		}
		if (!addr_found) {
			var addr = get_text_between_tags(text, ":", "?");
			if (addr.length > 0) {
				address = addr;
				addr_found = true;
			}
		}
	}
	catch(error) {
		var err = error;
	}
	return address;
}

function decode_amount(text)
{
	try
	{
		var pattern = new RegExp("amount[=]([0-9.]{1,})", "i");
		var match = pattern.exec(text);
		if (match && match[0].length > 0 && match[1] && match[1].length > 0)
			return match[1];
	}
	catch(error) {
		var err = error;
	}
	return "";
}

function perform_logout(url_to_go)
{
	if ( typeof Android != 'undefined' ) {
		console.log( '{"credentials": {"user_id":"", "password_session":"", "password_hash":""}}' );
	}
	else {
		save_value_otside("user_id", "");
		//save_value_otside("password_session", "");
		localStorage.removeItem('cb_token');
		save_value_otside("acc_nickname", "");
        save_value_otside("rank", "");
    	save_value_otside("avatar_number", "");
    	save_value_otside("acc_email", "");
    	save_value_otside("acc_firstname", "");
    	save_value_otside("acc_lastname", "");
    	save_value_otside("acc_nickname", "");
    	save_value_otside("acc_phone", "");
    	save_value_otside("crypto_currencies", "");
    	save_value_otside("total_in_usd", "");
	}
	
	userid = "";
	password_session = "";

	if ( typeof url_to_go == "undefined" )
		url_to_go = "index.html";
	change_url(url_to_go);
}

if ( typeof BASE_CURRENCY == 'undefined' ) var BASE_CURRENCY = "USD";
if ( typeof DOLLAR_SIGN == 'undefined' ) var DOLLAR_SIGN = "$";
if ( typeof DOLLAR_NAME == 'undefined' ) var DOLLAR_NAME = "USD";
if ( typeof DOLLAR_DESCRIPTION == 'undefined' ) var DOLLAR_DESCRIPTION = "US Dollar";
if ( typeof DOLLAR_DECIMALS == 'undefined' ) var DOLLAR_DECIMALS = 2;
if ( typeof fiat_eachange_rate == 'undefined' ) var fiat_eachange_rate = 1;

if ( typeof Android != 'undefined' ) {
	try	{
		var _DOLLAR_NAME = Android.read_value("DOLLAR_NAME");
		if (_DOLLAR_NAME.length > 0) {
			DOLLAR_NAME = _DOLLAR_NAME;
			DOLLAR_DESCRIPTION = Android.read_value("DOLLAR_DESCRIPTION");
			DOLLAR_SIGN = Android.read_value("DOLLAR_SIGN");
		}
		fiat_eachange_rate = Number(Android.read_value("fiat_exhange_rate_" + DOLLAR_NAME));
		if (fiat_eachange_rate <= 0)
			fiat_eachange_rate = 1;

		if ( typeof global_crypto_currencies == "undefined" )
			var global_crypto_currencies = null;
		global_crypto_currencies = JSON.parse(Android.read_value("crypto_currencies"));
	}
	catch(error){}
}
else {
	try	{
		if ( typeof Fake_Android == 'undefined' ) 
			var Fake_Android = new fake_Android();
		var _DOLLAR_NAME = Fake_Android.read_value("DOLLAR_NAME");
		if (_DOLLAR_NAME.length > 0) {
			DOLLAR_NAME = _DOLLAR_NAME;
			DOLLAR_DESCRIPTION = Fake_Android.read_value("DOLLAR_DESCRIPTION");
			DOLLAR_SIGN = String.fromCharCode(Fake_Android.read_value("DOLLAR_SIGN"));
		}
		fiat_eachange_rate = Number(Fake_Android.read_value("fiat_exhange_rate_" + DOLLAR_NAME));
		if (fiat_eachange_rate <= 0)
			fiat_eachange_rate = 1;

		if ( typeof global_crypto_currencies == "undefined" )
			var global_crypto_currencies = null;
		global_crypto_currencies = JSON.parse(Fake_Android.read_value("crypto_currencies"));
	}
	catch(error){}
}

function show_wait()
{
	show_hide_wait_sign();
	return false;
}

function hide_wait()
{
	show_hide_wait_sign(false);
	return false;
}

function show_hide_wait_sign(show)
{
    if ( typeof show == "undefined" || show) {
		if ($(window).width() > 997) {
			$("#wait_box_image").css("margin-left", (Number($("#menu").width()) / 2 - 35) + "px");
		}
        $("#wait_box").show();
        $("main").css("filter", "blur(2px)");
    }
    else {
        $("#wait_box").hide();
        $("main").css("filter", "none");
    }
}

var captcha_code = "";
function create_captcha(captcha_id, width, height, left, top, font_size) {
	
	if (typeof captcha_id == "undefined" ) {
		captcha_id = "captcha";
	}
	if (typeof width == "undefined" ) {
		width = 100;
	}
	if (typeof height == "undefined" ) {
		height = 50;
	}
	if (typeof font_size == "undefined" ) {
		font_size = "28px";
	}
	if (typeof left == "undefined" ) {
		left = 10;
	}
	if (typeof top == "undefined" ) {
		top = 35;
	}
	
    document.getElementById(captcha_id).innerHTML = "";
    var charsArray = "0123456789";//abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
    var lengthOtp = 5;
    var captcha = [];
    for (var i = 0; i < lengthOtp; i++) {
        //below code will not allow Repetition of Characters
        var index = Math.floor(Math.random() * charsArray.length); //get the next character from the array
        captcha.push(charsArray[index]);
    }
    var myFont = new FontFace('whatarelief', 'url(../fonts/whatarelief.woff)');
    myFont.load().then(function(font){
        document.fonts.add(font);

        var canv = document.createElement("canvas");
        canv.width = width;
        canv.height = height;
        var ctx = canv.getContext("2d");

        const size = 2;
        const columns = canv.width / size;
        const rows = canv.height /size;

        for(let c=0;c < columns;c++) {
            for(let r=0; r < rows;r++) {
                // randomly choose black or white for the fill
                ctx.fillStyle = Math.random() < 0.5 ? "#a0a0a0" : "white";

                // draw a square that fills the current grid location
                ctx.fillRect(size*c, size*r, size, size);
            }
        }

        ctx.font = font_size + " whatarelief";
        ctx.strokeText(captcha.join(""), left, top);
        captcha_code = captcha.join("");
        document.getElementById(captcha_id).appendChild(canv);
    });
}

function validate_obj(obj_id)
{	
    var tmp_obj = document.getElementById(obj_id);
    if ( tmp_obj ) {
        if (tmp_obj.checkValidity()) {
            $("#" + obj_id + "_error").hide();
            return true;
        }
        else {
            $("#" + obj_id + "_error").show();
            return false;
        }
        
    }
    return true;
}

function do_login()
{
	userid = "";
	password_session = "";

	set_cookie("user_id", "");
	//set_cookie("password_session", "");
	localStorage.removeItem('cb_token'); 
	set_cookie("acc_nickname", "");
	set_cookie("rank", "");
	set_cookie("avatar_number", "");
	set_cookie("acc_email", "");
	set_cookie("acc_firstname", "");
	set_cookie("acc_lastname", "");
	set_cookie("acc_nickname", "");
	set_cookie("acc_phone", "");
	set_cookie("crypto_currencies", "");
	set_cookie("total_in_usd", "");
	location.href = '/login.html';
}

function load_javascript_code(url)
{
	if (url[0] == "/") {
		url = url.substring(1);
	}
	url = `/js/${url}.js`;
    let scriptTag = document.createElement('script');
	scriptTag.src = url;
	try {
		let append_res = document.body.appendChild(scriptTag);
		if (append_res) {
			const currentdate = new Date();
			console.log(`${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} append: ${url}`);
		}
	}
	catch(error){
		console.error(error, error.stack);
	}
}

function refresh_balance(activate_timer)
{
	if ( !user_is_loggedin() ) {
		return false;
	}

	if (typeof activate_timer !== "undefined" && activate_timer) {
		clearTimeout(refresh_balance_timer);
	}

	var d = new Date();
	refresh_balance_last_time_refreshed = d.getTime();
	
	make_api_request("balance", { 
		add_available_funds:1, 
		add_amount_in_usd:1 
		}, 
		function( arr_ajax__result ){
			var all_currencies_balance_body = "";
			currency_balances = [];
			balance_data = {};
			global_crypto_currencies = {};
			let total_balance = 0;

			for (i = 0; i < arr_ajax__result["values"].length; i++) {	
				currency_balances[arr_ajax__result["values"][i]["currency"]] = arr_ajax__result["values"][i]["amount"];
				balance_data[arr_ajax__result["values"][i]["currency"]] = {
					amount: arr_ajax__result["values"][i]["amount"], 
					exchange_rate: arr_ajax__result["values"][i]["exchange_rate"] /** fiat_eachange_rate*/,
					symbol: arr_ajax__result["values"][i]["symbol"], 
					description: arr_ajax__result["values"][i]["description"],
					crypto_name: arr_ajax__result["values"][i]["crypto_name"],
					digits: arr_ajax__result["values"][i]["digits"],
					available_funds: arr_ajax__result["values"][i]["available_funds"],
					amount_in_usd: arr_ajax__result["values"][i]["amount_in_usd"],
					last_address: arr_ajax__result["values"][i]["last_address"]
				};

				global_crypto_currencies[arr_ajax__result["values"][i]["currency"]] = {
					amount: arr_ajax__result["values"][i]["amount"], 
					available_funds: arr_ajax__result["values"][i]["available_funds"],
					amount_in_usd: arr_ajax__result["values"][i]["amount_in_usd"] * fiat_eachange_rate,

					exchange_rate: arr_ajax__result["values"][i]["exchange_rate"] /** fiat_eachange_rate*/, 
					symbol: arr_ajax__result["values"][i]["symbol"], 
					description: arr_ajax__result["values"][i]["description"],
					crypto_name: arr_ajax__result["values"][i]["crypto_name"],
					digits: arr_ajax__result["values"][i]["digits"],
					logo: arr_ajax__result["values"][i]["logo"],
					blocks_explorer: arr_ajax__result["values"][i]["blocks_explorer"],
					transactions_explorer: arr_ajax__result["values"][i]["transactions_explorer"],
					pattern: arr_ajax__result["values"][i]["pattern"],
					min_cashout: arr_ajax__result["values"][i]["min_cashout"],
					max_cashout: arr_ajax__result["values"][i]["max_cashout"]
				};

				if (arr_ajax__result["values"][i]["currency"] == "usd"){
					$("#balance_label").show();
					var positive_color = "color:inherit";

					$(".balance1").each(function () {
						if ( $(this).attr("positive_color") && $(this).attr("positive_color").length > 0 )
							positive_color = $(this).attr("positive_color");
					});
					$(".balance1").html(currency_format(arr_ajax__result["values"][i]["amount"], arr_ajax__result["values"][i]["symbol"], positive_color, "color:#FF0000", "left"));
				}

				// save each currency's balance in global variables
				let ev = `
					if ( typeof ${arr_ajax__result["values"][i]["currency"] + "_balance"} !== "undefined" ) {
						var ${arr_ajax__result["values"][i]["currency"] + "_balance"} = ${arr_ajax__result["values"][i]["amount"]}; 
					}
					else {
						${arr_ajax__result["values"][i]["currency"] + "_balance"} = ${arr_ajax__result["values"][i]["amount"]};
					}
				`;
				eval(ev);

				$("." + arr_ajax__result["values"][i]["currency"] + "_balance").html(currency_format(arr_ajax__result["values"][i]["amount"], arr_ajax__result["values"][i]["symbol"], "", "color:#FF0000", undefined, arr_ajax__result["values"][i]["digits"]));
				$("." + arr_ajax__result["values"][i]["currency"] + "_available_funds").html(currency_format(arr_ajax__result["values"][i]["available_funds"], arr_ajax__result["values"][i]["symbol"], "color:#40FD3F", "color:#FF0000", undefined, arr_ajax__result["values"][i]["digits"]));
				$("." + arr_ajax__result["values"][i]["currency"] + "_available_funds").css("opacity", "1");

				if ( arr_ajax__result["values"][i]["amount"] > 0 ) {
					$("." + arr_ajax__result["values"][i]["currency"] + "_row").show();
				}
				
				total_balance = total_balance + Number(arr_ajax__result["values"][i]["amount"]) * Number(arr_ajax__result["values"][i]["withdrawal_fee_coef"]);

				all_currencies_balance_body = all_currencies_balance_body + "<p><span class=notranslate>" + arr_ajax__result["values"][i]["description"] + ":&nbsp; " + currency_format(arr_ajax__result["values"][i]["amount"], arr_ajax__result["values"][i]["symbol"], "color:#40FD3F", "color:#FF0000", undefined, arr_ajax__result["values"][i]["digits"]) + (arr_ajax__result["values"][i]["amount"] > 0?"</span>, amount available to send: <span class=notranslate>" + currency_format(arr_ajax__result["values"][i]["available_funds"], arr_ajax__result["values"][i]["symbol"], "color:#40FD3F", "color:#FF0000", undefined, arr_ajax__result["values"][i]["digits"]):"") + "</span></p>";
				
				if ( typeof window[arr_ajax__result["values"][i]["currency"] + "_available_funds"] != 'undefined' ) 
					window[arr_ajax__result["values"][i]["currency"] + "_available_funds"] = parseFloat(arr_ajax__result["values"][i]["available_funds"]).toFixed(arr_ajax__result["values"][i]["digits"]);
				$(".balance_usd_" + arr_ajax__result["values"][i]["currency"]).html(currency_format(arr_ajax__result["values"][i]["amount_in_usd"], "$", "color:#40FD3F", "color:#FF0000", undefined, 2));
				balance_total_in_usd = balance_total_in_usd + Number(arr_ajax__result["values"][i]["amount_in_usd"]);

				if ( typeof Android != 'undefined' && balance_total_in_usd > 2 ) {
					try	{
						Android.save_value("ask_for_review_in_days", "14");
						Android.save_value("ask_for_review_after_minutes", "1");
					}
					catch(error){}
				}
				save_value_otside("total_in_usd", balance_total_in_usd);
			}
			$("#all_currencies_balance_body").html(all_currencies_balance_body);

			$(".total_balance").html(currency_format(total_balance, ""));
			
			if (typeof on_balance_received === "function") {
				on_balance_received(arr_ajax__result["values"]);
			}

			if (typeof on_balance_received_arr_of_functions !== "undefined" && on_balance_received_arr_of_functions !== null) {
				for (j = 0; j < on_balance_received_arr_of_functions.length; j++) {
					on_balance_received_arr_of_functions[j](arr_ajax__result["values"]);
				}
			}

			if ( typeof Android != 'undefined' ) {
				try	{
					Android.save_value("crypto_currencies", JSON.stringify(global_crypto_currencies));
				}
				catch(error){}
			}
			else
			if ( typeof Fake_Android != 'undefined' ) {
				try	{
					Fake_Android.save_value("crypto_currencies", JSON.stringify(global_crypto_currencies));
				}
				catch(error){}
			}

			make_api_request("custom_api", {
					custom_command: "get_rank",
				}, 
				function( arr_ajax__result ){
					$(".rank_caption").html(RANKS[arr_ajax__result["values"]["rank"]]["name"]);
					let color = RANKS[Number(arr_ajax__result["values"]["rank"])]["color"];
					$(".user_rank_text_color").css("color", color);
					//$(".rank_caption").css("background", color);
					//$(".rank_caption").addClass( "color_bkg_rank_" + Number(arr_ajax__result["values"]["rank"]) );
					$(".rank_bkg_color").addClass( "color_bkg_rank_" + Number(arr_ajax__result["values"]["rank"]) );
				}, 
				null, 
				null,
				function( ajax__result ){
					
				}
			);
		}, 
		null, 
		null,
		function( ajax__result ){
			if (typeof activate_timer !== "undefined" && activate_timer) {
				refresh_balance_timer = setTimeout( refresh_balance, 120000 );
			}
		}
	);
}

function format_unix_timestamp(unixTime, pattern) {
    const date = new Date(unixTime * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	const year = date.getFullYear();
    const month = months[date.getMonth()];
	const month_number = date.getMonth();
    const day = date.getDate();

	const dayOfWeekNumber = date.getDay();
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayOfWeek = daysOfWeek[dayOfWeekNumber];
	const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dayOfWeekShort = daysOfWeekShort[dayOfWeekNumber];

    const daySuffix = (day) => {
        if (day % 10 === 1 && day !== 11) return "st";
        if (day % 10 === 2 && day !== 12) return "nd";
        if (day % 10 === 3 && day !== 13) return "rd";
        return "th";
    }
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
	const day_suffix = daySuffix(day);
	if (typeof pattern == "undefined") {
		pattern = "${month} ${day}${day_suffix} ${formattedHours}:${minutes}${ampm}";
	}
	let res = "";
    eval("res = `" + pattern + "`;");
	return res;
}

function get_count_down(events_time, return_as_array)
{
	let d = new Date();
	let t = d.getTime();
	timeDifference = events_time * 1000 - t;

	let a_seconds = 0;
	let a_minutes = 0;
	let a_hours = 0;
	let a_days = 0;

	if (timeDifference > 0) {
		a_seconds = Math.floor((timeDifference / 1000) % 60) + "";
		a_minutes = Math.floor((timeDifference / 1000 / 60) % 60) + "";
		a_hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
		a_days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
	}
	else {
		
	}

	if (typeof return_as_array !== "undefined" && return_as_array) {
		return {
			seconds: a_seconds,
			minutes: a_minutes,
			hours: a_hours,
			days: a_days,
		};
	}

	a_minutes = (a_minutes.length == 1 ? "0" : "") + a_minutes;
	a_seconds = (a_seconds.length == 1 ? "0" : "") + a_seconds;

	return `${a_days > 0 ? a_days + 'd' : ''} ${a_hours > 0 || a_days > 0 ? a_hours + 'h' : ''} ${a_minutes}m ${a_hours == 0 && a_days == 0 ? a_seconds + 's' : ''}`;
}

function scroll_to_top_of_an_item(item_id)
{
	let content_obj = document.getElementById(item_id);
	if (content_obj) {
		let content_top_pos = findObjectPosY(content_obj);

		if (window.innerWidth <= 998 && window.scrollY > content_top_pos * 1.1) {
			window.scrollTo({
				top: content_top_pos,
				behavior: 'smooth' // Smooth scrolling effect
			});
		}
	}
	else {
		setTimeout(() => {
            scroll_to_top_of_an_item(item_id);
        }, 100);
	}
}

function copy_to_clipboard(text_to_copy, success_message, item_id, close_function)
{
	if (navigator.clipboard.writeText(text_to_copy)) {
        if (typeof item_id !== "undefined") {
			let old_color = $(`#${item_id}`).css("color");

			$(`#${item_id}`).css("color", "#7AC231");
			
			setTimeout(function() { 
				$(`#${item_id}`).css("color", old_color);
			}, 2000);
		}
		if (typeof success_message !== "undefined") {
        	show_message_box_box(
				"", // message_title
				success_message, 
				"default", // icon_number
				"", // hex_message
				close_function, // name of close function
				"", // close_script_to_run
				true // hide_buttons
			);
		}
    }
}

// Function to check if Web Share API is available and supported
function is_web_share_supported(data)
{
	return navigator.share !== undefined && navigator.canShare(data);
};

// Function to open WhatsApp with pre-filled message containing the shared link
const fallbackWhatsAppLinkSharing = (url) => {
	const encodedUrl = encodeURIComponent(url);
	window.open(`https://wa.me/?text=${encodedUrl}`, '_blank');
};

async function share_link(link) {
	try {
		let data = {
			title: '',
			text: '',
			url: link,
		};
		
		if (is_web_share_supported(data)) {
			navigator.share(data);
		} 
		else {
			// Fallback method using WhatsApp's URL scheme
			fallbackWhatsAppLinkSharing(link);
		}
	} catch (err) {
			console.error('Error occurred while trying to share:', err.message);
	}
}

function show_hide_password(password_input_id, password_toggle_btn)
{
    if ($("#" + password_input_id).attr("type") === "password") { 
        $("#" + password_input_id).attr("type", "text"); 
        $("#" + password_toggle_btn).removeClass("bi-eye-slash").addClass("bi-eye");
    } 
    else { 
        $("#" + password_input_id).attr("type", "password"); 
        $("#" + password_toggle_btn).removeClass("bi-eye").addClass("bi-eye-slash");
    }
}

function load_java_script(url)
{
    var scriptTag = document.createElement('script');
    scriptTag.src = url;
    let append_res = document.body.appendChild(scriptTag);
    if (append_res) {
        const currentdate = new Date(); 
        console.log(`${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()} append: ${url}`);
    }
}

function collect_translated_strings()
{
	timer_collect_translated_strings = 0;
	let goog_language = $(".goog-te-combo").val();
	if ((typeof goog_language == "undefined" || goog_language == null || goog_language.length == 0)) {
		
	}
	else {
		selected_language = goog_language;
	}
	let googtrans = get_cookie('googtrans');
	let lang_val = $(".goog-te-combo").val();
	if (typeof lang_val == "undefined" || lang_val == null)
		lang_val = "";
	if (googtrans.length > 0 && lang_val.length > 0) {
		setTimeout(() => {
			var strings_arr = [];
			var str_val = "";
			$(".string_to_translate").each(function( index ) {
				try
				{
					var tag = $(this)[0].tagName.toLowerCase();
					if (tag == "input") {
						str_val = $(this).attr("placeholder");
						var str_val2 = "";
						try	{
							str_val2 = jQuery(str_val).text();
						}
						catch(error){}
						
						if (str_val2.length > 0)
							str_val = str_val2;
					}
					else {
						str_val = $(this).html();
						var str_val2 = "";
						try	{
							str_val2 = jQuery(str_val).text();
						}
						catch(error){}
						if (str_val2.length > 0)
							str_val = str_val2;
					}
					if (typeof str_val != "undefiend" && str_val != null && str_val.length > 0) {
						var en_hash = $(this).attr("_en_hash");
						if (typeof en_hash == "string" && en_hash.length > 0) {
							if ( strings_arr.length < 100) {
								strings_arr.push({
									hash: en_hash,
									original: $(this).attr("_original"), 
									translated: Base64.encode(str_val),
								});
								$(this).removeClass("string_to_translate");
							}
						}
					}
				}
				catch(e){
					console.log("hashes_calculated exception: " + e);
				}
			});
			if (strings_arr.length > 0) {
				let strings = JSON.stringify(strings_arr);
				make_api_request("custom_api", { 
						custom_command: "add_locale",
						language: selected_language, 
						strings: strings, 
						script_name: ""
					},
					function( arr_ajax__result ) {
						console.error(arr_ajax__result);
					}, 
					function( arr_ajax__result ) {
						console.error(arr_ajax__result);
					},
					function( ajax__result ){
						console.error(ajax__result);
					},
					function( ajax__result ){
						
					}
				);
			}
		}, 15000);
	}
}

function spawn_all_hidden_items()
{
	// Show all invisible items to have them be translated
	const allElements = document.getElementsByTagName('*');

	const elementsArray = Array.from(allElements);

	elementsArray.forEach(element => {
		if (window.getComputedStyle(element).display === 'none') {
			element.style.display = 'block';
		}
	});
}

function init_google_translate()
{
	if ( ! google_translate_initiated ) {
		
		google_translate_initiated = true;

		// Checking out that this user is manager
		let data = {};
		if (get_cookie("user_id").length > 0) {
			data.userid = get_cookie("user_id");
		}
		else
		if (get_cookie("userid").length > 0) {
			data.userid = get_cookie("userid");
		}

		if (typeof localStorage.getItem('cb_token') !== "undefined" && localStorage.getItem('cb_token').length > 0) {
			data.token = localStorage.getItem('cb_token');
		}
		//if (get_cookie("password_session").length > 0) {
		//	data.token = get_cookie("password_session");
		//}
		else
		if (get_cookie("password").length > 0) {
			data.token = get_cookie("password");
		}

		if ( get_cookie("force_google_translate") == "yes") {
			$.getScript("//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit", function(){
				$("#google_translate_element").hide();
			});
			spawn_all_hidden_items();
			return true;
		}
		else {
			console.error("To translate need manager or cookie: 'force_google_translate' = 'yes' ");
		}
		
		if (typeof data.userid == "undefined" || data.userid == "" || typeof data.token == "undefined" || data.token == "") {
			console.error("COOKIE: 'force_google_translate' is empty. Translation not possible.");
			return false;
		}
	}
}

function number_of_not_translated_strings()
{
	let number_of_not_translated_strings = 0;
	$(".string_to_translate").each(function( index ) {
		number_of_not_translated_strings++;
	});
	return number_of_not_translated_strings;
}

function watch_for_not_translated_texts(check_manager)
{
	if ( typeof global_language !== "undefined" && global_language.length && global_language !== "en") {
		// hide google spinning circle, which has class name starting with 'VIpgJd'
		$("div[class^='VIpgJd']").hide();
		
		if (number_of_not_translated_strings() > 0) {
			try	{
				if ( !$(".goog-te-combo").html() ) {
					init_google_translate(check_manager);
				}
				if (timer_collect_translated_strings == 0) {
					timer_collect_translated_strings = setTimeout(() => {
						collect_translated_strings();
					}, 1000);
				}
			}
			catch(e){
				console.log("exception inside watch_for_not_translated_texts: " + e);
			}
		}
	}
	setTimeout(() => {
		watch_for_not_translated_texts(check_manager);
	}, 500);
}


function change_language_automatically() {
	try	{
		var selectField = document.querySelector("#google_translate_element select");
		if (!selectField || !selectField.children || selectField.children.length < 1) {
			throw "empty list";
		}
		for (var i = 0; i < selectField.children.length; i++) {
			var option = selectField.children[i];
			// find desired langauge and change the former language of the hidden selection-field 
			if ( option.value == global_language ) {
				selectField.selectedIndex = i;
				// trigger change event afterwards to make google-lib translate this side
				selectField.dispatchEvent(new Event('change'));
				$("#google_translate_element").hide();
				break;
			}
		}
	}
	catch(error){
		setTimeout(function() { 
			change_language_automatically();
		}, 100);
	}
}

function change_language(language)
{
    var date = new Date();
    date.setTime(date.getTime() + (365*24*60*60*1000));
    document.cookie = `language=${language}; expires=${date.toUTCString()}; path=/`;
    global_language = language;
    
	$("body").css("filter", "blur(10px)");

    init_google_translate();
    change_language_automatically();
    setTimeout(() => {
		let aURL = document.URL;
		let parPos = aURL.indexOf('?');
		if (parPos > -1 ) {
			aURL = aURL.substring(0, parPos);
		}
		location.reload();
    }, 500);
}

function googleTranslateElementInit() {
	new google.translate.TranslateElement({}, "google_translate_element");
	$("#google_translate_element img").eq(0).remove();
	$("#google_translate_element span").eq(3).remove();
}

function translate(string)
{
    let en_hash = md5(string);
    let res = `<span class='string_to_translate' _en_hash='${en_hash}' _original='${Base64.encode(string)}'>${string}</span>`;
    if (typeof LOCALES_ARR !== 'undefined' && typeof LOCALES_ARR[global_language] !== 'undefined' && typeof LOCALES_ARR[global_language][en_hash] !== 'undefined' ) {
        res = `<span class='notranslate'>${Base64.decode(LOCALES_ARR[global_language][en_hash]['translated'])}</span>`;
    }
    return res;
}

function translate_str(string)
{
	return translate(string);
}

function translate_attr(string, object)
{
	let en_hash = md5(string);
	object.setAttribute("_en_hash", en_hash);
	object.setAttribute("_original", Base64.encode(string));
	object.setAttribute("_translate", "0");
	object.classList.add("string_to_translate");
	if (typeof LOCALES_ARR !== 'undefined' && typeof LOCALES_ARR[global_language] !== 'undefined' && typeof LOCALES_ARR[global_language][en_hash] !== 'undefined' ) {
		object.setAttribute("_translate", "");
		object.setAttribute("placeholder", Base64.decode(LOCALES_ARR[global_language][en_hash]['translated']));
		object.classList.remove("string_to_translate");
    }
}

function translate_placeholders()
{
	// Select all elements where _translate is equal to '1'
    let translateElements = document.querySelectorAll('[_translate="1"]');
    
    translateElements.forEach((element) => {
        const tr = element.getAttribute("placeholder"); 
        if ( typeof tr == "string" && tr.length ) {
            translate_attr(tr, element);
        }
    });
}

function alter_css_class(class_name, cssText)
{
	// Find the rule in the stylesheet and change its property
	for (let j = 0; j < document.styleSheets.length; j++) {
		let sheet = document.styleSheets[j];
		for (let i = 0; i < sheet.cssRules.length; i++) {
			if (sheet.cssRules[i].selectorText === class_name) {
				sheet.cssRules[i].style.cssText = cssText;
				return true;
			}
		}
	}
}
 
function generate_referral_number(generate_new)
{
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    
    let referral_number = Number(get_cookie("user_id")).toString(16) + "g" + Math.floor((now - start) / 1000).toString(16);
    if ( !generate_new ) {
        let old_ref_nmb = localStorage.getItem("referral_number");
        if ( typeof old_ref_nmb == "string" && old_ref_nmb.length ) {
            referral_number = old_ref_nmb;
        }
    }

	localStorage.setItem("referral_number", referral_number);
    return referral_number;
}

function parse_referral_number(generated_referral_number)
{
	let r_n = get_text_between_tags(generated_referral_number, "", "g");
	return parseInt(r_n, 16);
}

function save_click(user_id)
{
	// let referer = document.referrer;
	set_cookie(TRACK_COOKIE_NAME, 'type=C&user=' + user_id, 365);

	make_api_request("save_click", {
			http_referer: document.referrer,
    		user_id: user_id,
			token: "123",
		},
		function( arr_ajax__result ) {
			
		}, 
		function( arr_ajax__result ) {
			
		},
		function( ajax__result ){
			
		},
		function( ajax__result ){
			console.log(ajax__result);
		}
	);
}

function read_referral_number()
{
	let s = get_cookie(TRACK_COOKIE_NAME);
	if ( typeof s == "string" && s.length ) {
		let cookie_arr = {};
		const pairs = s.split('&');
		for (let i = 0; i < pairs.length; i++) {
			const pair = pairs[i].split('=');
			cookie_arr[pair[0]] = decodeURIComponent(pair[1]);
		}
		if (typeof cookie_arr['user'] == "string") {
			return cookie_arr['user'];
		}
	}
	return "";
}

function reload_page_on_login(get_param)
{
    if ( is_loggedin ) {
        document.location.href = redirect_on_login + ( typeof get_param == "string" && get_param.length ? "?" + get_param : "");
    }
    else
        document.location.reload();
}

function login(
    email_addr, 
    password, 
    password_hash,
    verification_pin,
    url_on_success
)
{
    if (typeof url_on_success !== "undefined" && url_on_success.length) {
        redirect_on_login = url_on_success;
    }
    if ( typeof verification_pin !== "undefined") {
        password = "";
        password_hash = "";
    }
    else {
        if ( typeof password_hash == "undefined" )
            password_hash = md5( decodeURIComponent(password.replace(/\+/g, "%20")) );
    }

    let date = new Date();
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    date = `${ye}-${mo}-${da}`;
    
    let password_sign = "";
    
    if ( typeof verification_pin == "undefined" ) {
        verification_pin = "";
    }

    let fingerprint = "";
    try {
        if ( typeof fp != "undefined" ) {
            fingerprint = fp.get();
        }
    }
    catch(error){
        write_console_log(" --- fingerprint eror --- " + error);
    }

    let login_data = encodeURIComponent(email_addr + "<div>" + "" + "<div><div><div>" + password_hash + "<div><div>" + verification_pin + "<div>" + password_sign + "<div>" + fingerprint + "<div>");
    login_data = string_to_hex(login_data);
    let url = SITE_DOMAIN + "api/user_login/"; 
    $.ajax({
        method: "POST",
        url: url,
        data: { data: login_data }
    })
    .done(function( ajax__result ) {
        try {
            let arr_ajax__result = JSON.parse(ajax__result);
            if ( arr_ajax__result["success"] ) {
                is_loggedin = 1;
                set_cookie("user_id", arr_ajax__result["values"]["userid"]);
                userid = arr_ajax__result["values"]["userid"];
                localStorage.setItem('cb_token', arr_ajax__result["values"]["hash"]);
                reload_page_on_login();
            }
            else {
                if ( arr_ajax__result["error_code"] == "3" ) {
                    setTimeout(function(){ login(); }, 5000);
                }
                else {
                    $("#login_email_wrong").hide();
                    $("#login_password_wrong").hide();
                    if (arr_ajax__result["error_code"] == "WRONG_USER") {
                        $("#login_email_wrong").show();
                    }
                    if (arr_ajax__result["error_code"] == "WRONG_PASSWORD") {
                        $("#login_password_wrong").show();
                    }
                    $("#password").val("");
                    
                    $("#text_entering").hide();
                    $("#text_login").show();

                    number_of_fail_logins++;
                    if (number_of_fail_logins > 3)
                        document.location.reload();
                }
            }
        }
        catch(error){}
    });
    return false;
}

function logout(redirect_url)
{
	localStorage.removeItem('cb_token'); 
	if (typeof redirect_url !== "undefined" && redirect_url.length) {
		location.href = redirect_url; 
	}
	else {
		location.href = 'index.html';
	}
	
}

