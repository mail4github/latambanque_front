<?php
$api_url = readline('Enter server domain (like srv.com):');
$server_domain = $api_url;

echo "Enter step:
1 - create apache files
2 - create HTTPS files
";
$step = readline("Step:");

if (empty($step)) {
    // creating apache files
    $apache_file_name = "/etc/apache2/sites-available/$server_domain";
    if (!file_exists($apache_file_name)) {
        echo "Creating apache file: $apache_file_name\r\n";
        file_put_contents($apache_file_name, "
<VirtualHost *:80>
    ServerName $server_domain
    ServerAlias www.$server_domain
    DocumentRoot ".dirname(__FILE__)."/front_js/
    DirectoryIndex index.php
    IndexIgnore *
</VirtualHost>
        ");
    }
    else {
        echo "\033[93mApache file: $apache_file_name already exists. Creation skipped.\033[0m\r\n";
    }
}

if (empty($step) || $step <= 1) { // creating HTTPS files
    echo "Enter:\r\n0 - server doesn't have HTTPS files\r\n1 - server has HTTPS files\r\n";
    $need_https = intval(readline("Need HTTPS:"));
    if ($need_https) {
        $apache_file_name = "/etc/apache2/sites-available/".$server_domain."_443";
        if (!file_exists($apache_file_name)) {
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
DirectoryIndex index.php
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
        else {
            echo "\033[93mApache file: $apache_file_name already exists. Creation skipped.\033[0m\r\n";
        }
    }
}

echo "Restarting apache2 server:\r\n";
system('service apache2 restart', $retval);
echo "\033[92mAll done\033[0m\r\n";

?>