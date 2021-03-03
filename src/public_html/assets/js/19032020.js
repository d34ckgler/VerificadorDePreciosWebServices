'use strict'

// GLOBAL VARIABLE
let socket = io();
let cart = [];
// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';
// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;
// Chrome 1 - 71
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;

/*let xhrs = new XMLHttpRequest();
xhrs.open('GET', 'http://net.ipcalf.com/', true);
xhrs.onreadystatechange = function() {
    if(4 == xhrs.readyState) {
        alert(xhrs.response);
    }
}
xhrs.send();*/

socket.emit('connect');

//setInterval( () => {
    socket.on('ping', d => {
        console.log(d);
        if(typeof d !== 'undefined' && d['beat'] == 1) {
            socket.emit('pong', {beat: 1});
            socket.removeListener('pong');
        }
    });

    setTimeout( () => {
        socket.disconnect();
    }, 300000);
//}, 500);

function getClient() {
    socket.emit('update', {
        auth: 'DGz',
        version: '2.3.2020',
        priorid: 'verifier-md'
    });
}

getClient();

setInterval( () => {
    console.log(socket['connected']);
    if(socket['connected'] == false || typeof socket['connected'] === 'undefined') {
        socket = io();
        socket.emit('connect');
        getClient();
        //console.log('Status: ', socket['connected'] )
        if(socket['connected'] == false) {
            $('.reconnect').show('slow');
        } else {
            $('.reconnect').hide('slow');
            console.log('reconexion exitosa' );
        }
    } else {
        $('.reconnect').hide('slow');
        console.log('reconexion exitosa' );
    }
}, 3000);

// Comprobando Datos en SzCode
function CheckCode() {
 //CONSTRUCTOR INIT MAIN
}

// DOCUMENTO CARGADO
$(document).ready( () => {
    let szCode = $('#szCode'), btnSend = $('#btn-send'), btnPrint = $('#btn-print'), PrintHabTab = document.querySelector('#PrintHabTab'), PrintHab = document.querySelector('#PrintHab');
    let fszCode = $('#forszCodeinv');
    let fvszCode = $('#forszCodev');
    let btnClose = $('.close');
    let btxReconnect = $('#btxReconnect');
    let btxClear = document.querySelector('#btxClear');
    let print = new Audio('assets/sound/print.wav');

    // GRID LIST
    let productList = document.querySelector('#GridViewList');
    let nIva = document.querySelector('#nIva');
    let nSubTotal = document.querySelector('#nSubTotal');
    let nTotal = document.querySelector('#nTotal');
    let ndTotal = document.querySelector('#ndTotal');

    // Lib Label Decode Bar
    let LDecodeBar = new LBC();
    let weight = null;
    let isSsl = (document.location.protocol == 'http:') ? false : true;
    let szOrg = document.querySelector('#szOrg');
    if(isSsl) {
        $('#jszOrg').show();
    }

    szCode.select();

let elem = document.getElementById("html");
function openFullscreen() {
  if(elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if(elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if(elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if(elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
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
    return new Promise( function(resolve, reject) {
       //$.get('http://srvopappnginx.biomercados.local:8080/index.php', async function(res,msg) {
        $.get('https://apirestbiomer.000webhostapp.com/index.php', async function(res,msg) {
            res = JSON.parse(res);     
            console.log("My First IP 00: ", res.REMOTE_ADDR);
            return resolve(res.REMOTE_ADDR);
        });
    }); 
}

CheckCode.prototype.getips = function() { //  onNewIp - your listener function for new IPs
    return new Promise( function(res, rej) {
        //compatibility for firefox and chrome
    var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var pc = new myPeerConnection({
        iceServers: []
    }),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

    function iterateIP(ip) {
        //alert(ip);
        if (!localIPs[ip]) return res(ip);
        localIPs[ip] = true;
    }

     //create a bogus data channel
    pc.createDataChannel("");

    // create offer and set local description
    pc.createOffer().then(function(sdp) {
        sdp.sdp.split('\n').forEach(function(line) {
            if (line.indexOf('candidate') < 0) return;
            line.match(ipRegex).forEach(iterateIP);
        });

        pc.setLocalDescription(sdp, noop, noop);
    }).catch(function(reason) {
        // An error occurred, so handle the failure to connect
    });

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
    };
    })
}

/* MOVIL AND PC MOZILLA */
CheckCode.prototype.getIP = function() {
    return new Promise( function(res, rej) {
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;   //compatibility for firefox and chrome
        var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
        pc.createDataChannel("");    //create a bogus data channel
        pc.createOffer(pc.setLocalDescription.bind(pc), noop);    // create offer and set local description
        pc.onicecandidate = function(ice){  //listen for candidate events
            if(!ice || !ice.candidate || !ice.candidate.candidate)  return;
            
            var myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
            
            pc.onicecandidate = noop;
            return res(myIP);
        };
    })
}

CheckCode.prototype.set = function(obj, ct) {
    let _this = this;
    if(typeof obj === 'undefined' || obj == null || obj === false) return;

    console.log(obj);

    if(cart.length <= 0) {
        cart.push({
            codigo: obj.c_codigo,
            sku: obj.c_codnasa,
            producto: obj.C_DESCRI,
            count: ct,
            pvp: obj.precio,
            sub: obj.price,
            iva: obj.impuesto,
            tasa: obj.tasa
        });
    } else {
        let flag = false;
        for(let i in cart) {
            
            if(cart[i].producto === obj.C_DESCRI) 
                {
                    flag = true;
                    cart[i].count += 1;
                }
            else {
                if((cart.length-1) == i) {
                    if(!flag) {
                        cart.push({
                            codigo: obj.c_codigo,
                            sku: obj.c_codnasa,
                            producto: obj.C_DESCRI,
                            count: ct,
                            pvp: obj.precio,
                            sub: obj.price,
                            iva: obj.impuesto,
                            tasa: obj.tasa
                        });
                    }
                }
            }
            
        }
    }
}
CheckCode.prototype.clear = function() {
    cart = [];
    this.update();
}
CheckCode.prototype.del = function(s) {
    let _this = this;
    if(typeof s === 'undefined' || s === null || s === '') return;
    let ncart = [];

    if(cart.length <= 1)
        productList.innerHTML = `<tr>
        <td colspan="3" align="center">NO HAY PRODUCTOS</td>
    </tr>`;

    for(let i in cart) {            
        if(cart[i].sku != s) 
        {
            ncart.push(cart[i]);
        }
    }
    cart = ncart;
    _this.update();
}
CheckCode.prototype.msg = function(s) {
    let _this = this;
    if(typeof s === 'undefined' || s === null || s === '') return;

    for(let i in cart) {
            
        if(cart[i].sku === s) 
        {
            let ct = $('#'+s).val();
            cart[i].count = ct;
            _this.update();
        }
    }
}
// Actualizar lista
CheckCode.prototype.update = function() {
    let _this = this;
    if(cart.length <= 0) {
        nIva.value = _this.formatMoney(0.00);
        nSubTotal.value = _this.formatMoney(0.00);
        nTotal.value = _this.formatMoney(0.00);
        ndTotal.value = _this.formatMoney(0.00);
        return productList.innerHTML = `<tr>
        <td colspan="3" align="center">NO HAY PRODUCTOS</td>
    </tr>`;
    }

    let hm = "";
    let Tiva = 0, TSub = 0, TT = 0, Dolar = 0;
    let Tasa = cart[0].tasa;

    for(let i in cart) {
        Tiva += (cart[i].iva * cart[i].count);
        TSub += (cart[i].sub * cart[i].count);
        TT += (cart[i].pvp * cart[i].count);
        hm += `<tr class="table-active">
                    <td><span>${cart[i].producto}</span></td>
                    <td align="right"><input maxlength="5" style="background: none; width: 100% !important; padding: 0px" onchange="new CheckCode().msg('${cart[i].sku}')" value="${cart[i].count}" id="${cart[i].sku}" type="number" class="form-control"></td>
                    <td><span>${_this.formatMoney(cart[i].sub * cart[i].count)}</span></td>
                    <td><button onclick="new CheckCode().del('${cart[i].sku}')" style="position: relative; right: -5%;" class="btn btn-danger"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
    }
    Dolar = (TT / Tasa).toString().split('.');
    console.log(Dolar);
    productList.innerHTML = hm;
    nIva.value = _this.formatMoney(Tiva);
    nSubTotal.value = _this.formatMoney(TSub);
    nTotal.value = _this.formatMoney(TT);
    ndTotal.value = _this.formatMoney((TT / Tasa)) + "$ / " + Dolar[0] + '$ con ' + _this.formatMoney(('0.' + Dolar[1]) * Tasa);
    $('.totalizer').slideDown('fast');
}

let response  = null;
CheckCode.prototype.getChar = async function(argv) {
    let _this = this;
    let Code = null;

    if(argv.length <= 4) {
        fszCode.html('Error, por favor inserte los datos correctamente.');
        szCode.addClass('is-invalid');
        console.log("Error, No cumple los requisitos");
    } else {
        szCode.removeClass('is-invalid');
        // Consultando precio
            Code = szCode.val();
            if(!isSsl) {
                _this.getMyIP().then( Addr => {
                    if(Code.indexOf("21") == 0) {
                        weight = LDecodeBar.LDecodeBar(Code)['weight'];
                        socket.emit('getPrice', {code: LDecodeBar.LDecodeBar(Code).plu, addr: Addr});
                    }
                    else
                        socket.emit('getPrice', {code: Code, addr: Addr});
                });
            } else {
                //_this.getMyIP().then( Addr => {
                     // MANUAL AD_ORG_ID
                    let Addr = null
                    Addr = szOrg[szOrg.selectedIndex].value;

                    if(Code.indexOf("21") == 0) {
                        weight = LDecodeBar.LDecodeBar(Code)['weight'];
                        socket.emit('getPrice', {code: LDecodeBar.LDecodeBar(Code).plu, addr: Addr});
                    }
                    else
                        socket.emit('getPrice', {code: Code, addr: Addr});
                //});
            }
        // Obteniendo precio
        socket.on('getPrice', res => {
            socket.removeListener('getPrice');
            if(!res) {
                fvszCode.show('slow');
                fvszCode.html('Error, Producto no encontado.');
                szCode.removeClass('is-valid');
                szCode.addClass('is-invalid');
                setTimeout( () => {
                    fvszCode.hide(1000);
                    szCode.removeClass('is-invalid');
                }, 1500)
            }
            else res = res.recordset[0];
                           
            setTimeout( () => {
                if(typeof res === 'undefined') {
                    szCode.addClass('is-invalid');
                    btnSend.removeAttr('disabled');
                }
                response=res;

                // Checando Impresion
                if(PrintHab.getAttribute('checked') === 'true') {                
    
                }

                let count = 1;
                if(Code.indexOf('21') == 0) {
                    //res.precio *= LDecodeBar.LDecodeBar(Code).weight;
                    count = LDecodeBar.LDecodeBar(Code).weight;
                }

                // Insert Into Matriz
                _this.set(res, count);
                _this.update();
            
               /* $('#szDesc').html(res.C_DESCRI);
                $('#prcbs').html(_this.formatMoney(res.precio));
                $('#prcusd').val(parseFloat(res.prcusd).toFixed(2));
                $('#ntasa').val(_this.formatMoney(res.tasa));*/
            }, 500)

            // DELAY DE VISUALIZACION
                szCode.val('');
                $('#szDesc').html('');
                $('#prcbs').html('0.00');
                $('#prcusd').val('0.00');
                $('#ntasa').val('0.00');

            setTimeout( () => { 
                btnSend.removeAttr('disabled');
                btnPrint.attr('disabled','true');
            }, 1000)
        });

        setTimeout( () => {
            // Checando Impresion
            btnPrint.removeAttr('disabled');
            if(PrintHab.getAttribute('checked') === 'true') {
                socket.emit('printlabel', {szcode: response.c_codigo, sku: response.c_codnasa, desc: response.C_DESCRI, price: _this.formatMoney(response.price) + "", iva: '0,00', pv: _this.formatMoney(response.precio) + ""});
                fvszCode.show('slow');
                fvszCode.html('Correcto, Hablador impreso correctamente.');
                szCode.addClass('is-valid');
                setTimeout( () => {
                    fvszCode.hide(1000);
                    szCode.removeClass('is-valid');
                }, 800)
            }
        }, 3000)
    }
}

CheckCode.prototype.ZxIng = (code) => {
    let _this = this;
    if(_this.flag === true) return;
            sound.play();
            _this.flag=true;
            szCode.val(code);
            btnClose.click();
                socket.emit('scanned', code);
                console.log(code);
                szCode.val(code);
                if(szCode.val() !== '') CC.getChar(szCode.val());
            setTimeout(() => {
                _this.flag=false;
            }, 3000);
}

var CC = new CheckCode();
    
    szCode.keypress((e) => {
        let is = typeof document.querySelector("html").requestFullscreen;
        if(is !== 'undefined')
            document.querySelector("html").requestFullscreen();

        if(szCode.val().length > 13) return;

        if(e.keyCode === 13) {
            CC.getChar(szCode.val());
        }
        
        return e.charCode >= 48 && e.charCode <= 57;
    });

    btnPrint.click( e => {
         // Checando Impresion
             socket.emit('printlabel', {szcode: response.c_codigo, sku: response.c_codnasa, desc: response.C_DESCRI, price: CC.formatMoney(response.price) + "", iva: CC.formatMoney(parseFloat(response.price * response.n_impuesto1 / 100)), pv: CC.formatMoney(response.precio) + ""});
            setTimeout( () => {
                fvszCode.html('Correcto, Hablador impreso correctamente.');
                fvszCode.show('slow');
                szCode.addClass('is-valid');
                setTimeout( () => {
                    fvszCode.hide(1000);
                    szCode.removeClass('is-valid');
                }, 800)
            }, 3000)
    })

    PrintHab.setAttribute('checked', 'false');
    PrintHab.click();
    PrintHabTab.addEventListener('mouseup', () => {
        console.log("o");
        if(PrintHab.getAttribute('checked') == 'true') {
            PrintHab.setAttribute('checked', 'false');
            console.log(PrintHab.getAttribute('checked'));
        } else if (PrintHab.getAttribute('checked') == 'false') {
            PrintHab.setAttribute('checked', 'true');
            console.log(PrintHab.getAttribute('checked'));
        }
    })

    btnSend.click( e => {
        if ( !$('#go').click() ) alert('Scanner no iniciado');
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

    btnClose.click( e => {
        $('#central').show();
        $('#centrals').show();
        $('.laser').hide();
        $('#camera').hide();
        $('.ocrloader').hide();
        $('.parentv').hide();
        $('.parentc').hide();
        $('.close').hide();
        CC.flag=false;
    })

    btxReconnect.click( e => {
        window.location.reload();
    })

    btxClear.addEventListener('click', e => {
        CC.clear();
    });

});