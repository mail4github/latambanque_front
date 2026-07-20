<?php
function delete_text_between_tags(&$inputStr, $delimeterLeft = '', $delimeterRight = '', $debug = false, $replace_with = '') 
{ 
	if ( empty($delimeterLeft) )
		$posLeft = 0;
	else
		$posLeft = stripos($inputStr, $delimeterLeft); 
    if ( $posLeft === false ) { 
        if ( $debug )
            echo "Warning: left delimiter '{$delimeterLeft}' not found"; 
        return false; 
    } 
	if ( empty($delimeterRight) )
		$posRight = strlen($inputStr);
	else {
		$posRight = stripos($inputStr, $delimeterRight, $posLeft); 
		if ( $posRight === false ) { 
			if ( $debug )
				echo "Warning: right delimiter '{$delimeterRight}' not found"; 
			return false; 
		}
	}
	$posRight = $posRight + strlen($delimeterRight); 
	$inputStr = substr_replace($inputStr, $replace_with, $posLeft, $posRight - $posLeft);
	return true;
} 


$api_url = readline('Enter server domain (like srv.com):');
$server_domain = $api_url;

echo "Enter step:
0 - create apache files
1 - configure apache
2 - create HTTPS files
";
$step = readline("Step:");

if (empty($step)) {
    // creating apache files
    $apache_file_name = "/etc/apache2/sites-available/$server_domain";
    if ( file_exists($apache_file_name)) {
        unlink($apache_file_name);
    }
    echo "Creating apache file: $apache_file_name\r\n";
    file_put_contents($apache_file_name, "
<VirtualHost *:80>
    ServerName $server_domain
    ServerAlias www.$server_domain
    DocumentRoot ".dirname(__FILE__)."/front_js/
    DirectoryIndex index.html
    IndexIgnore *
</VirtualHost>
    ");
}
if (empty($step) || $step <= 1) { // configure apache
    $config_file = '/etc/apache2/apache2.conf';
    $cnf = file_get_contents($config_file);
    if (is_integer(strpos($cnf, '# '.$server_domain))) {
        delete_text_between_tags($cnf, '# '.$server_domain, '# << '.$server_domain);
    }
    file_put_contents($config_file, $cnf."

<IfModule mpm_prefork_module>
        StartServers     100
        MinSpareServers  20
        MaxSpareServers  10
        MaxClients       500
        ServerLimit      500
        MaxRequestsPerChild   100
        MaxMemFree       10
</IfModule>
LimitRequestFieldSize   1638000
Include sites-available/*
<Directory /var/www/>
       AllowOverride All
</Directory>
Listen 443
LoadModule ssl_module /usr/lib/apache2/modules/mod_ssl.so

    ");
    echo "Changed apache file: $config_file\r\n";
}

if (empty($step) || $step <= 2) { // creating HTTPS files
    echo "Enter:\r\n0 - server doesn't have HTTPS files\r\n1 - server has HTTPS files\r\n";
    $need_https = intval(readline("Need HTTPS:"));
    if ($need_https) {
        $apache_file_name = "/etc/apache2/sites-available/".$server_domain."_443";
        if ( file_exists($apache_file_name)) {
            unlink($apache_file_name);
        }
        echo "Creating apache file: $apache_file_name\r\n";
        $all_files_found = true;
        
        $chainfile = glob(dirname(__FILE__).'/*.ca-bundle');
        $filename_not_found = '';
        if ($chainfile && is_array($chainfile) && count($chainfile) > 0)
            $chainfile = $chainfile[0];
        else {
            $chainfile = glob(dirname(__FILE__).'/*.ca*');
            if ($chainfile && is_array($chainfile) && count($chainfile) > 0)
                $chainfile = $chainfile[0];
            else {
                $all_files_found = false;
                $filename_not_found = 'SSLCertificateChainFile';
            }
        }
        
        $keyfile = glob(dirname(__FILE__).'/*.key');
        $filename_not_found = '';
        if ($keyfile && is_array($keyfile) && count($keyfile) > 0)
            $keyfile = $keyfile[0];
        else {
            $keyfile = glob(dirname(__FILE__).'/*_key.*');
            if ($keyfile && is_array($keyfile) && count($keyfile) > 0)
                $keyfile = $keyfile[0];
            else {
                $all_files_found = false;
                $filename_not_found = 'SSLCertificateKeyFile';
            }
        }

        if ($all_files_found) {
            file_put_contents($apache_file_name, "
<VirtualHost *:443>
ServerName $server_domain
ServerAlias www.$server_domain
DocumentRoot ".dirname(__FILE__)."/front_js/
DirectoryIndex index.html
IndexIgnore *
SSLEngine on
SSLCertificateFile ".glob(dirname(__FILE__).'/*.crt')[0]."
SSLCertificateKeyFile $keyfile
SSLCertificateChainFile $chainfile
</VirtualHost>
            ");
        }
        else {
            echo "\033[91m Error: file: $filename_not_found not found \033[0m\r\n";
        }
    }
}

echo "Restarting apache2 server:\r\n";
system('service apache2 restart', $retval);
echo "\033[92mAll done\033[0m\r\n";

?>