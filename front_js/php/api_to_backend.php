<?php

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

function WriteToLogFile($message, $log_name, $max_file_size_in_bytes = 1000000)
{
	$there_is_log_error = true;
	if ( defined('DIR_WS_LOG') ) {
		$s = DIR_WS_LOG.$log_name.'.log';
		if ( is_integer(file_put_contents($s, date("y/m/d H:i:s ").$message."\r\n", FILE_APPEND)) ) {
			$there_is_log_error = false;
		}
		if ( filesize($s) > $max_file_size_in_bytes ) 
			rename($s, DIR_WS_LOG.'_delete_'.$log_name.'_'.date("Ymd").'.log');
	}
	return $there_is_log_error;
}

// Read constants from file: $$$core_settings.ini
if ( file_exists('../../$$$core_settings.ini') ) {
	$s = file_get_contents('../../$$$core_settings.ini');
	$strings = preg_split('/$\R?^/m', $s);
	foreach( $strings as $string ) {
		$item_name = substr($string, 0, strpos($string, '='));
		if ( !empty($item_name) ) {
			define($item_name, trim(substr($string, strpos($string, '=') + 1)));
		}
	}
}

if (!defined('API_DOMAIN')) {
	define('API_DOMAIN', 'https://bet365api.bitkeeper.io/api/');
}

if (!defined('DIR_WS_TEMP')) {
	define('DIR_WS_TEMP', '../../');
}

function do_post_request($url, $data = '', $optional_headers = null)
{
	$params = array('http' => array(
		'method' => 'POST',
		'content' => $data
	));
	if ($optional_headers !== null) {
		$params['http']['header'] = $optional_headers;
	}
	$ctx = stream_context_create($params);

	$fp = @fopen($url, 'rb', false, $ctx);
	if (!$fp) {
		return false;
	}
	$response = @stream_get_contents($fp);
	if ($response === false) {
		if ( defined('DEBUG_MODE') ) echo "Problem reading data from $url, $php_errormsg<br>";
		return false;
	}
	return $response;
}

function get_file_variable($variable_name) 
{
	if ( file_exists(DIR_WS_TEMP.'$$$'.$variable_name.'.txt') )
		return file_get_contents(DIR_WS_TEMP.'$$$'.$variable_name.'.txt');
	return false;
}

function update_file_variable($variable_name, $value) 
{
	file_put_contents(DIR_WS_TEMP.'$$$'.$variable_name.'.txt', $value);
}

function is_file_variable_expired($variable_name, $timeout_in_mins = 1, $timeout_in_secs = '', $file_name = '') 
{
	if ( empty($timeout_in_secs) ) {
		$timeout_in_mins = round((int)$timeout_in_mins);
		if ( (int)$timeout_in_mins < 1 )
			$timeout_in_mins = 1;
		if ( (int)$timeout_in_mins > 60*24*7 )
			$timeout_in_mins = 60*24*7;
		$timeout_in_secs = $timeout_in_mins * 60;
	}
    if (empty($file_name)) {
	    $file_name = DIR_WS_TEMP.'$$$'.$variable_name.'.txt';
    }
	if ( file_exists($file_name) )
		return time() - filemtime($file_name) > $timeout_in_secs || filemtime($file_name) > time();
	else
		return true;
}

function delete_file_variable($variable_name) 
{
	if ( file_exists(DIR_WS_TEMP.'$$$'.$variable_name.'.txt') )
		unlink(DIR_WS_TEMP.'$$$'.$variable_name.'.txt');
}

function get_api_token_seed($force_update = false)
{
	if ( is_file_variable_expired('api_token_seed') || $force_update) {
        $token = get_api_value('api_token_seed', '', '', 'no token', null, false, 1);
        if (!empty($token)) {
            update_file_variable('api_token_seed', $token);
        }
	}
	return get_file_variable('api_token_seed');
}

function make_api_request($request = '', $get_params = '', $post_params = '', $token = '', $user = null, $local_request = false, $max_attempts = 10)
{
	if ( isset($_GET['debug']) ) {
		echo "
		<div class='notranslate'>
		<br>Request $request started: ".(time() - SCRIPT_STARTED_SEC)."*****<br>
		</div>";
	}
	
	if ( empty($request) ) {
		if ( !is_array($get_params) ) {
			parse_str($get_params, $tmp_params);
			$get_params = $tmp_params;
		}
		foreach ( $get_params as $key => $value) {
			// make first value as request
			$request = $key; 
			break;
		}
		// remove first value from params
		$i = 0;
		$tmp_get_params = array();
		foreach ( $get_params as $key => $value) {
			if ( $i > 0 )
				$tmp_get_params[$key] = $value; 
			$i++;
		}
		$get_params = $tmp_get_params;
	}
	if ( is_array($get_params) ) {
		$s = '';
		foreach($get_params as $key => $value)
			$s = $s.$key.'='.urlencode($value).'&';
		$get_params = $s;
	}
	if ( is_array($post_params) ) {
		$s = '';
		foreach($post_params as $key => $value) {
			if ( !isset($value) )
				$value = '';
			$s = $s.$key.'='.urlencode($value).'&';
		}
		$post_params = $s;
	}
	
    parse_str($get_params, $get_arr);
    
    $get_params = '';
    foreach($get_arr as $key => $value)
        $get_params = $get_params.$value.'/';

    if (empty($api_domain))
        $api_domain = API_DOMAIN;

    $url = $api_domain.$request.'/'.$get_params;
    
    if ( empty($token) ) {
		$token = MD5( get_api_token_seed().(round(time() / 60)) );
    }
	$post_params = 'token='.$token.'&'.$post_params;
	
	$post_params = $post_params.'&user_ip='.urlencode($_SERVER['REMOTE_ADDR']).'&webserver_ip='.urlencode($_SERVER['SERVER_ADDR']);
	
	$attempts = 0;
	$res = '';
	do {
		if ( $attempts > 0 )
			sleep($attempts);
		ini_set('default_socket_timeout', 60 * 3);
		$res = trim(do_post_request($url, $post_params));

		//WriteToLogFile("url: $url, result: $res, GET: ".json_encode($_GET).', POST: '.json_encode($_POST).', post_params:'.$post_params, '$$$make_api_request');

		/*
		if ( isset($_GET['debug']) ) {
			echo "
			<div class='notranslate'>
			<br>Request ended: ".(time() - SCRIPT_STARTED_SEC)."*****<br>
			url:$url<br>
			request: $request<br>
			post_params: $post_params<br>
			res: '".strlen($res)//.substr($res, 0, 20000)
			."'<br>
			backtrace:<br>";
			//var_dump(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS));
			echo "<br>*****<br>
			</div>";
			$attempts = $max_attempts + 1;
		}*/
		$attempts++;
	} 
    while ( $attempts < $max_attempts && !is_integer(strpos($res, '"success')) );
	
	
	if ($res === false || empty($res)) {
		return ['success' => false, 'empty_result' => true];
	}
	else {

		$res_json = json_decode($res, true);
		switch ( $res_json["error_code"] ) {
			case 2: // wrong token
			break;
			default: // wrong password
			break;
		}
		return $res_json;
	}
}

function make_appserver_request($request, $get_params, $post_params, $token = '', $user_account = null)
{
	try {
		$data = make_api_request($request, $get_params, $post_params, $token, $user_account);
		if ( !isset($data['empty_result']) || !$data['empty_result'] )
			return $data;
		else
			return false;
	}
	catch (Exception $e) {
		return false;
	}
}

function get_appserver_value($request, $get_params = '', $post_params = '', $token = '', $user_account = null)
{
	$data = make_appserver_request($request, $get_params, $post_params, $token, $user_account);
	if ( $data['success'] )
		return $data['values'];
	else
		return false;
}

function get_api_value($request = '', $get_params = '', $post_params = '', $token = '', $user_account = null, $local_request = false, $max_attempts = 10)
{
	$data = make_api_request($request, $get_params, $post_params, $token, $user_account, $local_request, $max_attempts);
	if ( $data['success'] )
		return $data['values'];
	else
		return false;
}

function generate_answer($success = 1, $message = '', $values = '', $error_code = '')
{
	return '{"success":'.$success.', "message":"'.$message.'", "error_code":"'.$error_code.'", "values":'.json_encode($values).'}';
}

function tep_sanitize_string($string, $max_length = 0, $allow_html = false, $only_standard_chars = false, 
	$replace_non_standard_chars = '<br>', $replace_quotes = true, $remove_quotes = false, $its_unicode = false, $preg_remove = '') 
{
	if ( $only_standard_chars ) {
		for ($i = 0; $i < strlen($string); $i++ ) {
			if ( intval( ord($string[$i]) ) < intval( ord(' ') ) || intval( ord($string[$i]) ) > intval( ord('~') ) )
				$string[$i] = chr(1);
		}
		$string = str_replace(chr(1), $replace_non_standard_chars, $string);
	}
	
	$string = str_replace("\\", '&#92;', $string);
	if ( $replace_quotes ) {
		$string = preg_replace('/"/', '&quot;', $string);
		$string = preg_replace('/\'/', '&#39;', $string);
	}
	if ( $remove_quotes ) {
		$string = preg_replace('/"/', '', $string);
		$string = preg_replace('/\'/', '', $string);
	}
	if ( !empty($preg_remove) )
		$string = preg_replace($preg_remove, '', $string);

	if ( !$allow_html ) {
		$string = str_replace('<', '&lt;', $string);
		$string = str_replace('>', '&gt;', $string);
	}
	if ( $max_length > 0 ) {
		if ( $its_unicode )
			$string = mb_substr($string, 0, $max_length, 'HTML-ENTITIES');
		else
			$string = substr($string, 0, $max_length);
	}
		
	return $string;
}

function get_domain($url, $short_domain = true, $force_short_domain = false)
{
	if ( empty($url) )
		return '';
	$website_host = $url;
	if ( is_integer(strpos($website_host, '://')) )
		$website_host = parse_url($website_host, PHP_URL_HOST);
	$website_host = strtolower(trim($website_host));
	if ( $force_short_domain
		|| $short_domain 
		&& substr_count($website_host, '.') > 1 
		&& !is_integer(strpos($website_host, '.com.af'))
		&& !is_integer(strpos($website_host, '.com.ag'))
		&& !is_integer(strpos($website_host, '.com.ar')) 	
		&& !is_integer(strpos($website_host, '.com.au')) 	
		&& !is_integer(strpos($website_host, '.com.bd'))	
		&& !is_integer(strpos($website_host, '.com.bh'))
		&& !is_integer(strpos($website_host, '.com.br')) 
		&& !is_integer(strpos($website_host, '.com.cn')) 
		&& !is_integer(strpos($website_host, '.com.co'))
		&& !is_integer(strpos($website_host, '.com.cy')) 
		&& !is_integer(strpos($website_host, '.com.do')) 
		&& !is_integer(strpos($website_host, '.com.eg'))
		&& !is_integer(strpos($website_host, '.com.et'))
		&& !is_integer(strpos($website_host, '.com.ec'))
		&& !is_integer(strpos($website_host, '.com.jm'))
		&& !is_integer(strpos($website_host, '.com.gh'))
		&& !is_integer(strpos($website_host, '.com.hk'))
		&& !is_integer(strpos($website_host, '.com.kh'))
		&& !is_integer(strpos($website_host, '.com.kw'))
		&& !is_integer(strpos($website_host, '.com.lb')) 
		&& !is_integer(strpos($website_host, '.com.ly')) 
		&& !is_integer(strpos($website_host, '.com.mm')) 
		&& !is_integer(strpos($website_host, '.com.mt'))
		&& !is_integer(strpos($website_host, '.com.mx')) 
		&& !is_integer(strpos($website_host, '.com.my'))
		&& !is_integer(strpos($website_host, '.com.na'))
		&& !is_integer(strpos($website_host, '.com.ng'))
		&& !is_integer(strpos($website_host, '.com.np'))
		&& !is_integer(strpos($website_host, '.com.pa')) 
		&& !is_integer(strpos($website_host, '.com.pe'))
		&& !is_integer(strpos($website_host, '.com.ph'))
		&& !is_integer(strpos($website_host, '.com.pg'))
		&& !is_integer(strpos($website_host, '.com.pr')) 
		&& !is_integer(strpos($website_host, '.com.pk'))
		&& !is_integer(strpos($website_host, '.com.sa')) 
		&& !is_integer(strpos($website_host, '.com.sg')) 
		&& !is_integer(strpos($website_host, '.com.tr')) 
		&& !is_integer(strpos($website_host, '.com.vc'))
		&& !is_integer(strpos($website_host, '.com.ve')) 
		&& !is_integer(strpos($website_host, '.com.vn')) 
		&& !is_integer(strpos($website_host, '.com.ua'))
		&& !is_integer(strpos($website_host, '.com.uy'))
		
		&& !is_integer(strpos($website_host, '.co.bw'))
		&& !is_integer(strpos($website_host, '.co.cr')) 
		&& !is_integer(strpos($website_host, '.co.id')) 
		&& !is_integer(strpos($website_host, '.co.il')) 
		&& !is_integer(strpos($website_host, '.co.in'))
		&& !is_integer(strpos($website_host, '.co.jp'))
		&& !is_integer(strpos($website_host, '.co.nz'))
		&& !is_integer(strpos($website_host, '.co.th'))
		&& !is_integer(strpos($website_host, '.co.tz'))
		&& !is_integer(strpos($website_host, '.co.uk')) 
		&& !is_integer(strpos($website_host, '.co.ke'))
		&& !is_integer(strpos($website_host, '.co.kr'))
		&& !is_integer(strpos($website_host, '.co.ls'))
		&& !is_integer(strpos($website_host, '.co.ma'))
		&& !is_integer(strpos($website_host, '.co.ve'))
		&& !is_integer(strpos($website_host, '.co.za'))
		&& !is_integer(strpos($website_host, '.co.zm'))
		&& !is_integer(strpos($website_host, '.co.zw'))

		&& !is_integer(strpos($website_host, '.t.co'))
		&& !is_integer(strpos($website_host, '.yn.lt'))
		&& !is_integer(strpos($website_host, '.wapka.mobi'))
		) 
	{
		$last_dot = strrpos($website_host, '.');
		$prev_dot = strrpos($website_host, '.', -(strlen($website_host) - $last_dot + 1) );
		$website_host = substr($website_host, $prev_dot + 1);
	}
	if ( is_integer(strpos($website_host, 'www.')) && strpos($website_host, 'www.') == 0 )
		$website_host = substr($website_host, 4);

	return $website_host;
}

header('Content-type: text/html');
header('Access-Control-Allow-Origin: *');

if (!isset($_POST['ip'])) {
    $_POST['ip'] = $_SERVER['REMOTE_ADDR'];
}

if ( $_GET['command'] == 'custom_api' ) {
	if ( @$_POST['custom_command'] == 'add_locale' ) {
		if (!empty($_POST['language']) && !is_integer(strpos($_POST['language'], '/')) && ! is_integer(strpos($_POST['language'], '\\')) && strlen($_POST['language']) < 10 ) {
			$dir = '../locale/';
			$language = tep_sanitize_string($_POST['language']);
			$file_name = $dir.'locale';

			$text_json = file_get_contents($file_name.'.json');
			if ($text_json) {
				$translates_arr = json_decode($text_json, true);
			}
			else {
				$translates_arr = [
					$language => []
				];
			}
			$new_translates_arr = json_decode($_POST['strings'], true);
			foreach($new_translates_arr as $new_translate) {
				$translates_arr[$language][$new_translate['hash']] = $new_translate;
			}
			file_put_contents($file_name.'.json', json_encode($translates_arr));
			file_put_contents($file_name.'.js', 'var LOCALES_ARR = '.json_encode($translates_arr).';');
		}
        echo generate_answer(1, time().' - '.$file_name, $translates_arr);
        exit;
    }
    else {
        $data = make_appserver_request($_GET['command'], [], $_POST);
        if ($data && count($data)) {
            echo generate_answer($data['success'], $data['message'], $data['values'], $data['error_code']);
        }
        else {
            echo generate_answer(0, 'Error: no answer from API server');
        }
        exit;
    }
}
else
if ( $_GET['command'] == 'user_login' ) {
	
	$data = urldecode(hex2bin($_POST['data']));
	$data_arr = explode('<div>', $data);
	$login_data_arr = array(
		'email' => tep_sanitize_string($data_arr[0]),
		'userid' => tep_sanitize_string($data_arr[1]),
		'password' => $data_arr[4],
		'verification_pin' => $data_arr[6],
		'password_sign' => $data_arr[7],
		'fingerprint' => $data_arr[8],
		'login_as_manager' => $data_arr[9],
	);
	if ( !empty($_POST['real_user_ip']) )
		$_SERVER['REMOTE_ADDR'] = $_POST['real_user_ip'];
	$data = make_appserver_request($_GET['command'], '', $login_data_arr);
	if ($data !== false && !empty($data)) {
		if ( $data['success'] ) {
			$login_data = $data['values'];
			session_start();
			echo generate_answer(1, '', $login_data);
			exit;
		}
	}
	else
		$data = array('success' => 0, 'message' => "Error: no answer", 'values' => '', 'error_code' => 3);
	sleep(2);
	echo generate_answer(0, $data['message'], $data['values'], $data['error_code']);
	exit;
}
else
if ( $_GET['command'] == 'user_signup' ) {
	
	$_POST['signup_ip'] = base64_encode($_SERVER['REMOTE_ADDR']);
	//if (empty($_POST['user_domain']) && !empty($_POST['package_name']))
	//	$_POST['user_domain'] = $_POST['package_name'];

	$data = make_appserver_request($_GET['command'], '', $_POST);
	echo generate_answer($data['success'], $data['message'], $data['values'], $data['error_code']);
	exit;
}
else
if ( @$_GET['command'] == 'refresh_constants' ) {
	
	if ( is_file_variable_expired('refresh_constants', 0, 1) ) {
		
		update_file_variable('refresh_constants', '1');
		/*
		$data = make_appserver_request('custom_api', '', [
			'email' => 'monitor@m.c',
			'token' => md5('f22fdb6201fa36969a8c9c9acc0a276a'.date('Y-m-d')),
			'custom_command' => 'get_constants',
			'kind' => 'constants'
		]);
		if ($data['values']) {
			$constants = '';
			foreach ($data['values'] as $key => $value) {
				if (is_numeric($value)) {

				}
				else
				if (is_string($value)) {
					$value = "'$value'";
				}
				else
				if (is_array($value)) {
					$value = json_encode($value);
				}
				$constants = $constants."var $key = $value;\r\n";
			}
			file_put_contents('../tmp/server_constants.js', $constants);
		}

		$data = make_appserver_request('custom_api', '', [
			'email' => 'monitor@m.c',
			'token' => md5('f22fdb6201fa36969a8c9c9acc0a276a'.date('Y-m-d')),
			'custom_command' => 'get_constants',
			'kind' => 'crypto_icons'
		]);
		if ($data['values']) {
			$constants = '';
			foreach ($data['values'] as $icon) {
				file_put_contents('../tmp/'.$icon['crypto'].'.png', base64_decode($icon['icon']));
			}
		}*/
	}
	echo generate_answer(1, '', $data);
	exit;
}
else
if ( @$_GET['command'] == 'save_click' ) {
	$clicks_arr = json_decode(get_file_variable('last_ip'), true);
	do {
		$oldest_val = 0;
		foreach($clicks_arr as $ip => $val) {
			if ( $val['time'] < time() - 60 * 60 * 24 ) {
				$oldest_val = $ip;
			}
		}
		if ( !empty($oldest_val) )
			unset($clicks_arr[$oldest_val]);
	} while ( !empty($oldest_val) );

	$referer_url = !empty(@$_POST['http_referer']) ? substr($_POST['http_referer'], 0, 128) : '';
	$user_id = substr(@$_POST['user_id'], 0, 20);
	$remote_addr = substr(@$_SERVER['REMOTE_ADDR'], 0, 20);
	if (empty($remote_addr)) {
		$remote_addr = 'no IP';
	}
	$bannerId = 0;
	
	if ( !empty($user_id) ) {
		$clicks_arr[$remote_addr] = [
			'parentid' => $user_id,
			'time' => time(), 
			'clickcount' => intval($clicks_arr[$remote_addr]['clickcount']) + 1,
			'referer_url' => $referer_url, 
			'bannerid' => $bannerId, 
			'fingerprint' => !empty(@$_POST['fingerprint']) ? substr($_POST['fingerprint'], 0, 128) : '',
		];
		update_file_variable('last_ip', json_encode($clicks_arr, JSON_PRETTY_PRINT));
	}
	echo generate_answer(1, '', [$remote_addr, $clicks_arr[$remote_addr], __DIR__]);
	exit;
}
else
if ( @$_GET['command'] == 'rates' ) {
	echo generate_answer(1, '', json_decode(file_get_contents('https://banco-latinoamericano.onrender.com/api/rates'), true));
	exit;
}
else
if ( @$_GET['command'] == 'history' ) {
	//echo '{"code":"BTC","type":"crypto","points":[{"t":1784617200000,"v":65863.05067368706},{"t":1784620800000,"v":66144.10625273176},{"t":1784628000000,"v":66259.96368444791},{"t":1784635200000,"v":66290.24577207127},{"t":1784642400000,"v":66727.93345004696},{"t":1784649600000,"v":66653.6645601238},{"t":1784656800000,"v":66175.68149701797},{"t":1784664000000,"v":66410.97769455807},{"t":1784671200000,"v":66338.34521781663},{"t":1784674800000,"v":66264.36028989237},{"t":1784682000000,"v":66608.6028542205},{"t":1784689200000,"v":66273.30427757863},{"t":1784696400000,"v":66336.76238504669},{"t":1784703600000,"v":65895.48564329921},{"t":1784710800000,"v":65940.90781431843},{"t":1784718000000,"v":65995.09306174285},{"t":1784725200000,"v":65589.33695518678},{"t":1784728800000,"v":65904.713741556},{"t":1784736000000,"v":66006.98530857396},{"t":1784743200000,"v":65992.28860844017},{"t":1784750400000,"v":65886.78165545003},{"t":1784757600000,"v":66030.11262485114},{"t":1784764800000,"v":66077.05646514206},{"t":1784772000000,"v":65794.55194410743},{"t":1784779200000,"v":65626.22165913803},{"t":1784782800000,"v":65575.31845132985},{"t":1784790000000,"v":65744.92147874119},{"t":1784797200000,"v":65612.71775530875},{"t":1784804400000,"v":65693.05796071362},{"t":1784811600000,"v":65113.664574500224},{"t":1784818800000,"v":64862.99911001275},{"t":1784826000000,"v":64748.26972143978},{"t":1784833200000,"v":64821.7238066609},{"t":1784836800000,"v":64804.78307554462},{"t":1784844000000,"v":65109.65311337383},{"t":1784851200000,"v":65033.02206215462},{"t":1784858400000,"v":65059.43402694941},{"t":1784865600000,"v":65393.846477712796},{"t":1784872800000,"v":65237.15506519218},{"t":1784880000000,"v":65423.637913661376},{"t":1784887200000,"v":65051.32243202135},{"t":1784890800000,"v":64929.35888412262},{"t":1784898000000,"v":64669.05793003065},{"t":1784905200000,"v":63931.93419154643},{"t":1784912400000,"v":63912.984401238435},{"t":1784919600000,"v":64198.318874859455},{"t":1784926800000,"v":64155.248304494715},{"t":1784934000000,"v":64105.63293853278},{"t":1784941200000,"v":64088.41163028338},{"t":1784948400000,"v":63969.509215438986},{"t":1784952000000,"v":64041.21605381791},{"t":1784959200000,"v":63976.08146160464},{"t":1784966400000,"v":63926.04897247025},{"t":1784973600000,"v":63958.61296962673},{"t":1784980800000,"v":64012.50885493113},{"t":1784988000000,"v":64081.05426908519},{"t":1784995200000,"v":64151.01749873885},{"t":1785002400000,"v":64338.81358004876},{"t":1785006000000,"v":64373.24187914812},{"t":1785013200000,"v":64273.938156151424},{"t":1785020400000,"v":64358.53130902422},{"t":1785027600000,"v":64452.85965829787},{"t":1785034800000,"v":64453.93385081129},{"t":1785042000000,"v":64446.50434212295},{"t":1785049200000,"v":64404.13795588448},{"t":1785056400000,"v":64451.93187972349},{"t":1785060000000,"v":64468.0902789829},{"t":1785067200000,"v":64488.57737978033},{"t":1785074400000,"v":64494.56663207591},{"t":1785081600000,"v":64738.96125580256},{"t":1785088800000,"v":64639.06802441303},{"t":1785096000000,"v":64637.66958576121},{"t":1785103200000,"v":65048.7038221728},{"t":1785110400000,"v":65310.39342889224},{"t":1785114000000,"v":65116.259900503406},{"t":1785121200000,"v":65199.878257215394},{"t":1785128400000,"v":65257.65771872395},{"t":1785135600000,"v":65374.74850012607},{"t":1785142800000,"v":65060.51414628423},{"t":1785150000000,"v":65248.675944870214},{"t":1785157200000,"v":65041.93226608387},{"t":1785164400000,"v":64597.46655387939},{"t":1785168000000,"v":64483.657582084976},{"t":1785175200000,"v":64964.80312676521},{"t":1785182400000,"v":64986.80176620556},{"t":1785189600000,"v":64629.23374011211},{"t":1785196800000,"v":63673.70583727069},{"t":1785204000000,"v":63160.99011553302},{"t":1785211200000,"v":63272.87476274653},{"t":1785218400000,"v":63401.029321496426},{"t":1785221910000,"v":63564.36411622783}],"priceUsd":63564.36411622783,"change":-3.4901003429796766,"hasHistory":true,"meta":{"code":"BTC","id":"bitcoin","name":"Bitcoin","type":"crypto","icon":"₿"}}';
	echo generate_answer(1, '', json_decode(file_get_contents('https://banco-latinoamericano.onrender.com/api/history?asset='.$_GET['param1'].'&days='.$_GET['param2']), true));
	exit;
}
else {
	$get_params = [];
	if (!empty($_GET['param1'])) {
		$get_params[] = $_GET['param1'];
	}
	if (!empty($_GET['param2'])) {
		$get_params[] = $_GET['param2'];
	}
	if (!empty($_GET['param3'])) {
		$get_params[] = $_GET['param3'];
	}
    $data = make_appserver_request($_GET['command'], $get_params, $_POST);
    if ($data && count($data)) {
        echo generate_answer($data['success'], $data['message'], $data['values'], $data['error_code']);
    }
    else {
        echo generate_answer(0, 'Error: no answer from API server');
    }
    exit;
}
?>