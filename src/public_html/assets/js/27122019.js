'use strict'

let socket = io();
var reconversion = 1000000;

socket.emit('connection');

socket.on('ping', d => {
    console.log(d);
    if (d !== undefined && d['beat'] == 1) {
        socket.emit('pong', { beat: 1 });
        //socket.removeListener('pong');
    }
});

// Comprobando Datos en SzCode
function CheckCode() {
    // this.flag = false;
}

$(document).ready(() => {
    let szCode = $('#szCode'),
        btnSend = $('#btn-send'),
        btnPrint = $('#btn-print'),
        PrintHabTab = document.querySelector('#PrintHabTab'),
        PrintHab = document.querySelector('#PrintHab');
    let fszCode = $('#forszCodeinv');
    let fvszCode = $('#forszCodev');
    let btnClose = $('.close');
    let btxReconnect = $('#btxReconnect');
    let print = new Audio('assets/sound/print.wav');
    let isSsl = (document.location.protocol == 'http:') ? true : true;
    let szOrg = document.querySelector('#szOrg');
    if (isSsl) {
        $('#jszOrg').show();
    }

    szCode.select();

    let elem = document.getElementById("html");

    function openFullscreen() {
        if (elem !== null && elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem !== null && elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem !== null && elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem !== null && elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    function closeFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    CheckCode.prototype.constructor = () => {
        this.flag = false;
        console.log("Objeto iniciado.");
    }

    CheckCode.prototype.formatMoney = (amount, decimalCount = 2, decimal = ",", thousands = ".") => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        } catch (e) {
            console.log(e)
        }
    }

    CheckCode.prototype.getMyIP = async function() {
        return new Promise(function(resolve, reject) {
            $.get('http://srvopappnginx.biomercados.local:8080/index.php', async function(res, msg) {
                //$.get('https://apirestbiomer.000webhostapp.com/index.php', async function(res,msg) {
                res = JSON.parse(res);
                return resolve(res.REMOTE_ADDR);
            });
        });
    }


    CheckCode.prototype.getIP = function() {
        return new Promise(function(res, rej) {
            window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
            var pc = new RTCPeerConnection({ iceServers: [] }),
                noop = function() {};
            pc.createDataChannel(""); //create a bogus data channel
            pc.createOffer(pc.setLocalDescription.bind(pc), noop); // create offer and set local description
            pc.onicecandidate = function(ice) { //listen for candidate events
                if (!ice || !ice.candidate || !ice.candidate.candidate) return;
                var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
                pc.onicecandidate = noop;
                return res(myIP);
            };
        })
    }

    let response = null;
    CheckCode.prototype.getChar = async function(argv) {
        let _this = this;

        if (argv.length <= 4) {
            fszCode.html('Error, por favor inserte los datos correctamente.');
            szCode.addClass('is-invalid');
            console.log("Error, No cumple los requisitos");
        } else {
            szCode.removeClass('is-invalid');
            // Consultando precio
            var Code = szCode.val();
            if (!isSsl) {
                _this.getMyIP().then(Addr => {
                    socket.emit('getPrice', { code: Code, addr: Addr });
                });
            } else {
                // MANUAL AD_ORG_ID
                let Addr = null;
                Addr = szOrg[szOrg.selectedIndex].value;
                socket.emit('getPrice', { code: Code, addr: Addr });
            }
            // Obteniendo precio
            socket.on('getPrice', res => {
                socket.removeListener('getPrice');
                if (!res) {
                    fvszCode.show('slow');
                    fvszCode.html('Error, Producto no encontado.');
                    szCode.removeClass('is-valid');
                    szCode.addClass('is-invalid');
                    setTimeout(() => {
                        fvszCode.hide(1000);
                        szCode.removeClass('is-invalid');
                    }, 1500)
                } else res = res.recordset[0];

                setTimeout(() => {
                    if (typeof res === 'undefined') {
                        szCode.addClass('is-invalid');
                        btnSend.removeAttr('disabled');
                    }

                    response = res;

                    // Checando Impresion
                    if (PrintHab.getAttribute('checked') === 'true') {}

                    $('#szDesc').val(res.C_DESCRI);
                    $('#prcbs').val(_this.formatMoney(res.precio));
                    $('#prcusd').val(parseFloat(res.prcusd).toFixed(2));
                    $('#ntasa').val(_this.formatMoney(res.tasa));
                }, 500)

                // DELAY DE VISUALIZACION                           
                szCode.val('');
                $('#szDesc').val('');
                $('#prcbs').val('0.00');
                $('#prcusd').val('0.00');
                $('#ntasa').val('0.00');

                setTimeout(() => {
                    btnSend.removeAttr('disabled');
                    btnPrint.attr('disabled', 'true');
                }, 1000)
            });

            setTimeout(() => {
                // Checando Impresion
                btnPrint.removeAttr('disabled');
                if (PrintHab.getAttribute('checked') === 'true') {
                    socket.emit('printlabel', { szcode: response.c_codigo, sku: response.c_codnasa, desc: response.C_DESCRI, price: _this.formatMoney(response.price) + "", iva: '0,00', pv: _this.formatMoney(response.precio) + "", ved: [_this.formatMoney(response.price/reconversion) + "", _this.formatMoney(response.precio/reconversion) + "", "0,00"] });
                    fvszCode.show('slow');
                    fvszCode.html('Correcto, Hablador impreso correctamente.');
                    szCode.addClass('is-valid');
                    setTimeout(() => {
                        fvszCode.hide(1000);
                        szCode.removeClass('is-valid');
                    }, 800)
                }
            }, 3000)
        }
    }

    CheckCode.prototype.GoScan = () => {
        let flag = false;
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                numOfWorkers: navigator.hardwareConcurrency,
                target: document.querySelector('#camera')
            },
            decoder: {
                readers: ["ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "code_128_reader", "upc_reader", "upc_e_reader"]
            }
        }, function(err) {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Initialization finished. Ready to start");
            if (flag === true) return;
            $('#camera').show();
            $('.ocrloader').show();
            $('.parentv').show();
            $('.parentc').show();
            $('.laser').show();
            $('#camera').width(screen.width);
            $('body').width(screen.width);
            Quagga.start();
        });

        Quagga.onDetected(function(data) {
            if (flag === true) return;
            //sound.play();
            flag = true;
            $('#central').show();
            $('#centrals').show();
            $('.laser').hide();
            $('#camera').hide();
            $('.ocrloader').hide();
            $('.parentv').hide();
            $('.parentc').hide();
            Quagga.stop();
            socket.emit('scanned', data.codeResult.code);
            //console.log(data.codeResult.code);
            szCode.val(data.codeResult.code);
            if (szCode.val() !== '') CC.getChar(szCode.val());
            setTimeout(() => {
                flag = false;
            }, 3000);
        });
    }

    CheckCode.prototype.ZxIng = (code) => {
        let _this = this;
        if (_this.flag === true) return;
        sound.play();
        _this.flag = true;
        szCode.val(code);
        btnClose.click();
        socket.emit('scanned', code);
        console.log(code);
        szCode.val(code);
        if (szCode.val() !== '') CC.getChar(szCode.val());
        setTimeout(() => {
            _this.flag = false;
        }, 3000);
    }

    var CC = new CheckCode();

    szCode.keypress((e) => {
        document.querySelector("html").requestFullscreen();

        if (szCode.val().length > 13) return;

        if (e.keyCode === 13) {
            CC.getChar(szCode.val());
        }
        return e.charCode >= 48 && e.charCode <= 57;
    });

    btnPrint.click(e => {
        // Checando Impresion
        socket.emit('printlabel', { szcode: response.c_codigo, sku: response.c_codnasa, desc: response.C_DESCRI, price: CC.formatMoney(response.price) + "", iva: CC.formatMoney(parseFloat(response.price * response.n_impuesto1 / 100)), pv: CC.formatMoney(response.precio) + "", ved: [CC.formatMoney(response.price/reconversion) + "", CC.formatMoney(response.precio/reconversion) + "", CC.formatMoney(parseFloat((response.price/reconversion) * response.n_impuesto1 / 100))] });
        setTimeout(() => {
            fvszCode.html('Correcto, Hablador impreso correctamente.');
            fvszCode.show('slow');
            szCode.addClass('is-valid');
            setTimeout(() => {
                fvszCode.hide(1000);
                szCode.removeClass('is-valid');
            }, 800)
        }, 3000)
    })

    PrintHab.setAttribute('checked', 'false');
    PrintHab.click();
    PrintHabTab.addEventListener('mouseup', () => {
        console.log("o");
        if (PrintHab.getAttribute('checked') == 'true') {
            PrintHab.setAttribute('checked', 'false');
            console.log(PrintHab.getAttribute('checked'));
        } else if (PrintHab.getAttribute('checked') == 'false') {
            PrintHab.setAttribute('checked', 'true');
            console.log(PrintHab.getAttribute('checked'));
        }
    })

    btnSend.click(e => {
        if (!$('#go').click()) alert('Scanner no iniciado');
        $('#camera').show();
        btnClose.show();
        $('.ocrloader').show();
        $('.parentv').show();
        $('.parentc').show();
        $('.laser').show();
        $('#central').hide();
        $('#centrals').hide();
        openFullscreen();
        console.log("iniciado.");
    });

    btnClose.click(e => {
        $('#central').show();
        $('#centrals').show();
        $('.laser').hide();
        $('#camera').hide();
        $('.ocrloader').hide();
        $('.parentv').hide();
        $('.parentc').hide();
        $('.close').hide();
        CC.flag = false;
    })

    btxReconnect.click(e => {
        window.location.reload();
    })

});