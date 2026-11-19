<?php

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

function make_api_request($request = '', $get_params = '', $post_params = '', $manager_userid = '', $manager_token = '', $max_attempts = 10, $api_domain = '')
{
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
    
    $post_params = 'manager_userid='.$manager_userid.'&manager_token='.$manager_token.'&'.$post_params;
	
    parse_str($get_params, $get_arr);
    $get_params = '';
    foreach($get_arr as $key => $value)
        $get_params = $get_params.$value.'/';
    
    if (empty($api_domain)) {
		$api_domain = API_DOMAIN;
	}

    $url = $api_domain.$request.'/'.$get_params;

	$post_params = $post_params;
	
	$attempts = 0;
	$res = '';
	do {
		if ( $attempts > 0 )
			sleep($attempts);
		ini_set('default_socket_timeout', 60 * 3);
		$res = trim(do_post_request($url, $post_params));
		if ( isset($_GET['debug']) ) {
			echo "
			<div class='notranslate'>
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
		}
		$attempts++;
	} 
    while ( $attempts < $max_attempts && !is_integer(strpos($res, '"success')) );
	
	if ($res === false || empty($res)) {
		return array('success' => false, 'empty_result' => true);
	}
	else {
		$res_json = json_decode($res, true);
		switch ( $res_json["error_code"] ) {
			case 2: // wrong manager_token
			break;
			default: // wrong password
			break;
		}
		return $res_json;
	}
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
	define('API_DOMAIN', 'https://latambanque.bitkeeper.io/api/');
}

WriteToLogFile("GET: ".json_encode($_GET).', POST: '.json_encode($_POST), '$$$payment_callback');
/*
POST from server:
"id_account"
"amount"
"coin"
"txId"
"address"
"mint"
*/
$res = make_api_request(
	'user_reward',
	'', // $get_params
	[
		'amount_in_usd' => 0,
		'amount_in_currency' => $_POST['amount'],
		'description' => 'from payment_callback.php, mint: '.$_POST['mint'],
		'crypto_name' => $_POST['coin'],
		'transaction_type' => 'AF', 
		'hold_reward_for_days' => 0, 
		'parent_transactionid' => 0,
		'tx_hash' => $_POST['txId'],
		'address' => $_POST['address'],
		'userid' => $_POST['id_account'],
	], // $post_params
    3, // manager userid
    md5('f22fdb6201fa36969a8c9c9acc0a276a'.date('Y-m-d')) // manager token
);

if ($res && is_array($res)) {
	if ($res['success'] || $res['error_code'] == 'ERROR_TRANSACTION_ALREADY_PROCESSED') {
		$res['ok'] = 1;
	}
	else {
		$res['ok'] = 0;
	}
	echo json_encode($res);
}
else {
	echo json_encode(["ok" => 0]);
}
?>