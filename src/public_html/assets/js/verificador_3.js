var szDesc = document.getElementById("szDescription");
var prcbs = document.getElementById("prcbs");
var nved = document.getElementById("nved");
var prcusd = document.getElementById("prcusd");
var ntasa = document.getElementById("ntasa");
var publishing = document.getElementById("publishing");
var isprice = document.getElementById("isprice");

setTimeout(function() {
    document.location.reload();
}, 200000)

var codigo = "";
$(document).on('keypress', function(e) {
    // if (e.key >= 0 && e.key < 9) {
    //     //codigo = codigo + e.key;
    // }

    if (codigo.length > 0 && e.which == 13) {
        $(isprice).fadeIn('fast');
        $(publishing).fadeOut('fast');
        //Toggle fullscreen off, activate it
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen(); // Firefox
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(); // Chrome and Safari
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen(); // IE
            }
            //Toggle fullscreen on, exit fullscreen
        }
        ScanBar(codigo);
    }
});

// $.ajaxSetup({
// Disable caching of AJAX responses
//     cache: false
// });

$(document).keypress(function(event) {
    var letter = event.which || event.keyCode;
    codigo = codigo + String.fromCharCode(letter);
});

var flag = false;

function ScanBar(sku) {
    codigo = '';
    if (flag) return;

    fetch(`/jsonp/${sku}/10.30.10.1`, {
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json()).then(data => {
            if (data['statusCode'] != undefined) {
                $('.awesome').hide('fast', () => {
                    szDesc.value = "Producto no encontrado";
                });

                setTimeout(function() {
                    $(isprice).fadeOut('fast');
                    $(publishing).fadeIn('fast');
                    szDesc.value = "";
                }, 5000);
            } else {
                flag = true;
                $('.awesome').hide('fast', () => {});

                szDesc.value = data[0].C_DESCRI;
                prcbs.value = 'Bs ' + data[0].format;
                nved.value = 'Bs ' + data[0].ved;
                ntasa.value = data[0]['tasaf'];
                prcusd.value = 'USD ' + data[0].p_dolar;

                setTimeout(function() {
                    $(publishing).fadeIn('fast');
                    codigo = "";
                    szDesc.value = "";
                    prcbs.value = '';
                    nved.value = '';
                    ntasa.value = '';
                    prcusd.value = '';
                    $('.awesome').fadeIn('fast');
                    flag = false
                }, 6000);
            }
        }).catch(err => {
            $(publishing).fadeIn('fast');
            codigo = "";
            szDesc.value = "";
            prcbs.value = '';
            nved.value = '';
            ntasa.value = '';
            prcusd.value = '';
            $('.awesome').fadeOut('fast');
            flag = false
        });
}
$('body').css("background-size", "cover");