'use strict'
let sql = require('mssql');
const color = require('colors');

module.exports = class mssql {
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
        let vlan = addr.split('.').slice(1,2);
        this.addr = parseInt(vlan[0]);

        this.config.server = (_this.addr == 60) ? `10.${_this.getVPN(_this.addr)}.100.19` : `10.${_this.getVPN(_this.addr)}.100.18`;
    }

    getVPN(t: number) {
        switch(t) {
            case 10:
                return 10;
            break;
            case 20:
                return 20;
            break;
            case 30:
                return 30;
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
       return new Promise( (resolve, reject) => {
         // Creando conexion sql
        sql.connect(`mssql://${this.config.user}:${this.config.password}@${this.config.server}/${this.config.database}`).then( async(pool) => {
            let request = await pool;
            _this.request = request;
            return resolve(true);
        });
        /*sql.connect(this.config, (err) => {
            if (err) return console.log(err);

            let request = new sql.Request();            

            // Return Connection
            _this.request = request;
            return resolve(true);
        });*/
       });
    }

    disconnect() {
        sql.close();
        console.log('Desconectado correctamente.');
    }

    getItemInfo(szCode: string) {
        let _this = this;
        return new Promise( (rs, rj) => {
            // query to the database and get the records
            _this.connect();
            _this.request.query("SELECT C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE C.c_codigo = '" + szCode + "'", (err, recordset) => {
                _this.disconnect();
                if(err) return console.log(err);
                // send records as a response
                if(recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;

                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo;
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.blue(sku));
                return rs(recordset);
            });
        });
    }

    getItemInfo2(szCode: string) {
        let _this = this;
        return new Promise( (rs, rj) => {
            // query to the database and get the records
            _this.connect();
            _this.request.query("SELECT TOP(1) C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE (C.c_codnasa = '"+szCode+"' OR C.c_codigo = '"+szCode+"') AND C.nu_intercambio = 0", (err, recordset) => {
                _this.disconnect();
                if(err) return console.log(err);
                // send records as a response
                if(recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.blue(sku));
                //recordset.recordset.price = _this.for
                return rs(recordset);
            });
        });
    }

    getOrg(vlan:Number) {
        switch(vlan) {
            case 10:
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01'];
            break;
            case 20:
                return ['TIENDA T02 PARAPARAL', 'HBT02'];
            break;
            case 30:
                return ['TIENDA T03 SANTA CECILIA', 'HBT03'];
            break;
            case 1:
                return ['EXPRESS LA GRANJA', 'HBE01'];
            break;
            case 2:
                return ['EXPRESS EL BOSQUE', 'HBE02'];
            break;
            default: 
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01'];
            break;
        }
    }

    // Printer Hab
    printlabel(Org:String, Print:String, szCode:String, sku:String, desc:String, price:String, iva:String, pv:String) {
    console.log('la tienda es ', Org, 'La impresora es ', Print);
        let s = ' ';
        this.child = this.exec('java -jar ./src/plugin/PrintHablClass.jar '
                                                                        + Org+s
                                                                        + Print+s
                                                                        + szCode+s
                                                                        + sku+s
                                                                        + desc+s
                                                                        + price+s
                                                                        + iva+s
                                                                        + pv, (error, stdout, stderr) => {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
        })
    }

}