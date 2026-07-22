if (typeof SITE_DOMAIN == "undefined") {
    var SITE_DOMAIN = "https://latambanque.com/";
}
var BASE_CURRENCY_DESCRIPTION = "USDT Solana";
var TRACK_COOKIE_NAME = get_domain_name(SITE_DOMAIN) + "_ref_id";

var SPINNER_CODE = `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:50px; height:50px; margin: auto; display: block;">
    <style>
        .spinner_qM83{
            animation:spinner_8HQG 1.05s infinite;
            fill:rgba(255, 255, 255, 0.5);
        }
        .spinner_oXPr{
            animation-delay:.1s
        }
        .spinner_ZTLf{
            animation-delay:.2s
        }
        @keyframes spinner_8HQG{
            0%,57.14%{ animation-timing-function:cubic-bezier(0.33,.66,.66,1); transform:translate(0) }
            28.57%{ animation-timing-function:cubic-bezier(0.33,0,.66,.33);transform:translateY(-6px)}
            100%{ transform:translate(0)}
        }
    </style>
    <circle class="spinner_qM83" cx="4" cy="12" r="3"/>
    <circle class="spinner_qM83 spinner_oXPr" cx="12" cy="12" r="3"/>
    <circle class="spinner_qM83 spinner_ZTLf" cx="20" cy="12" r="3"/>
</svg>
`;

var PASSWORD_CPEC_SYMBOLS = ".!#@%";
var debug_code_begin = "<!--";
var debug_code_end = "-->";
var prod_code_begin = "";
var prod_code_end = "";

var language_checks = 0;
var selected_language = "";
var timer_collect_translated_strings = 0;
var google_translate_initiated = false;
var global_language = get_cookie("language") || "en"; //!!!!!!!<<<<<<<<<<<<<<<<

