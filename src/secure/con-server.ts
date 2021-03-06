'use strict'
const sql = require('mssql');
const color = require('colors');

module.exports = class mssql {
    private pool = null;
    private _pool = null;
    private request = null;
    private addr: number = null;
    private exec = require('child_process').exec;
    private child = null;
    // Config for yo database
    private config = {
        user: 'sa',
        password: '',
        server: '10.10.100.18',
        database: 'VAD20'
    };

    constructor(addr: string) {
        let _this = this;
        let vlan = addr.split('.').slice(1, 2);
        this.addr = parseInt(vlan[0]);

        this.config.server = (_this.addr == 60) ? `10.${_this.getVPN(_this.addr)}.100.19` : `10.${_this.getVPN(_this.addr)}.100.18`;
    }

    getVPN(t: number) {
        switch (t) {
            case 10:
                return 10;
                break;
            case 20:
                return 20;
                break;
            case 30:
                return 30;
                break;
            case 40:
                return 40;
                break;
            case 60:
                return 10;
                break;
            case 1:
                return 1;
                break;
            case 2:
                return 2;
                break;
            default:
                return 10;
                break;
        }
    }

    connect() {
        let _this = this;
        return new Promise(async (resolve, reject) => {
            // Creando conexion sql
            /*sql.connect(`mssql://${this.config.user}:${this.config.password}@${this.config.server}/${this.config.database}`).then( async(pool) => {
                let request = await pool;
                _this.request = request;
                return resolve(true);
            });*/
            _this.pool = new sql.ConnectionPool({
                user: `${this.config.user}`,
                password: `${this.config.password}`,
                server: `${this.config.server}`,
                database: `${this.config.database}`,
                encrypt: false
            });

            if (_this._pool != null && !_this._pool._connected && !_this._pool.connecting) {
                await _this.pool.connect().then(async i => {
                    _this._pool = await i;
                    console.info('As heen connected to Store Box.');
                    return resolve(true);
                }).catch(e => {
                    console.error('Error: Connection TimeOut: ', _this.pool.config.server);
                    return reject(e);
                })
            }
            else {
                await _this.pool.close();
                await _this.pool.connect().then(async i => {
                    _this._pool = await i;
                    console.info('As heen connected to Store Box.');
                    return resolve(true);
                }).catch(e => {
                    console.error('Error: Connection TimeOut: ', _this.pool.config.server);
                    return reject(e);
                })
            }
        });
    }

    disconnect() {
        sql.close();
        console.log('Desconectado correctamente.');
    }

    getItemInfo(szCode: string) {
        let _this = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            try {
                await _this.connect();
                if (_this._pool == null) return;
                _this.request = new sql.Request(_this._pool);
                _this.request.query("SELECT C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE C.c_codigo = '" + szCode + "'", (err, recordset) => {
                    _this.disconnect();
                    if (err) return console.log(err);
                    // send records as a response
                    if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;

                    let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                    let sku = 'SKU / ' + recordset.recordset[0].c_codigo;
                    console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                    return rs(recordset);
                });
            } finally {
                // CLOSE POOL
                console.dir('Datos retornados.')
                //_this.pool.close();
            }
        });
    }

    getItemInfo2(szCode: string) {
        let _this = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await _this.connect();
            if (_this._pool == null) return;
            _this.request = new sql.Request(_this._pool);
            _this.request.query("SELECT TOP(1) C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE (C.c_codnasa = '" + szCode + "' OR C.c_codigo = '" + szCode + "') AND C.nu_intercambio = 0", (err, recordset) => {
                _this.disconnect();
                if (err) return console.log(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                //recordset.recordset.price = _this.for
                return rs(recordset);
            });
        });
    }

    sendItem(szCode: string) {
        let _this = this;
        return new Promise( async (resolve, reject) => {
            await _this.connect();
            if(_this._pool == null) return;
            _this.request = new sql.Request(_this.pool);
            _this.request.query(`UPDATE VAD20..bio_txtscale SET app_update = NULL WHERE c_codigo = '${szCode}'`, (err, recordset) => {
                if(err) return reject(err.stack);

                return resolve(`Codigo: (${szCode}), debe esperar 1 minutos para que el proceso lo envie a balanza.`);
            });
        });
    }

    getItemiDempiere(szCode: string) {
        let _this = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await _this.connect();
            if (_this._pool == null) return;
            _this.request = new sql.Request(_this._pool);
            _this.request.query(`SELECT t.* FROM (SELECT 
                mc.c_codigo,
                mc.c_codnasa,
                convert(decimal(10,2), bpc.pricestdconverted * (bpc.taxrate/100+1) ) as price,
                convert(decimal(10,2), (bpc.pricestdconverted * (bpc.taxrate/100+1) ) / bpc.rate) as prcusd,
                convert(decimal(10,2), bpc.pricestdconverted * (bpc.taxrate/100+1) ) as precio,
                convert(decimal(10,2), mp.n_precio1 * (bpc.taxrate/100+1) ) as stellar,
                bpc.rate as tasa,
                mp.n_impuesto1,
                convert(decimal(10,2), bpc.pricestdconverted * (bpc.taxrate/100) ) as impuesto,
                mp.C_DESCRI,
                bpc.isimported
                FROM VAD20.dbo.MA_PRODUCTOS mp
                JOIN VAD20.dbo.MA_CODIGOS mc ON mc.c_codnasa = mp.C_CODIGO
                JOIN [192.168.100.19].VAD20.dbo.Bio_Price_Change bpc ON bpc.value = mc.c_codnasa and bpc.ad_org_id = ${_this.getOrg(_this.addr)[2]}
                WHERE (mc.c_codnasa = '${szCode}' or mc.c_codigo = '${szCode}')
                GROUP BY mc.c_codigo,
                mc.c_codnasa,
                bpc.pricestdconverted,
                mp.n_precio1,
                bpc.taxrate,
                bpc.rate,
                mp.n_impuesto1,
                mp.C_DESCRI,
                bpc.isimported) as t
                WHERE t.c_codigo = '${szCode}'`, (err, recordset) => {
                _this.disconnect();
                if (err) return console.log(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                //recordset.recordset.price = _this.for
                return rs(recordset);
            });
        });
    }

    getOrg(vlan: Number) {
        switch (vlan) {
            case 10:
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01', 1000003];
                break;
            case 20:
                return ['TIENDA T02 PARAPARAL', 'HBT02', 1000004];
                break;
            case 30:
                return ['TIENDA T03 SANTA CECILIA', 'HBT03', 1000005];
                break;
            case 40:
                return ['TIENDA T04 CABUDARE', 'HBT04', 1000006];
                break;
            case 1:
                return ['EXPRESS LA GRANJA', 'HBE01', 1000010];
                break;
            case 2:
                return ['EXPRESS EL BOSQUE', 'HBE02', 1000011];
                break;
            default:
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01', 1000003];
                break;
        }
    }

    // Printer Hab
    printlabel(Org: String, Print: String, szCode: String, sku: String, desc: String, price: String, iva: String, pv: String) {
        console.log('la tienda es ', Org, 'La impresora es ', Print);
        let s = ' ';
        this.child = this.exec('java -jar ./src/plugin/PrintHablClass.jar '
            + Org + s
            + Print + s
            + szCode + s
            + sku + s
            + desc + s
            + price + s
            + iva + s
            + pv, (error, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
            })
    }

}
