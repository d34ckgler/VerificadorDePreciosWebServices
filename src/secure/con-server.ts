'use strict'
const sql = require('mssql');
const color = require('colors');

export class mssql {
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
        let self = this;
        let vlan = addr.split('.').slice(1, 2);
        this.addr = parseInt(vlan[0]);

        this.config.server = (self.addr == 60) ? `10.${self.getVPN(self.addr)}.100.19` : `10.${self.getVPN(self.addr)}.100.18`;
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
        let self = this;
        return new Promise(async (resolve, reject) => {
            // Creando conexion sql
            /*sql.connect(`mssql://${this.config.user}:${this.config.password}@${this.config.server}/${this.config.database}`).then( async(pool) => {
                let request = await pool;
                self.request = request;
                return resolve(true);
            });*/
            self.pool = new sql.ConnectionPool({
                user: `${this.config.user}`,
                password: `${this.config.password}`,
                server: `${this.config.server}`,
                database: `${this.config.database}`,
                encrypt: false
            });

            if (self._pool != null && !self._pool._connected && !self._pool.connecting) {
                await self.pool.connect().then(async i => {
                    self._pool = await i;
                    console.info('As heen connected to Store Box.');
                    return resolve(true);
                }).catch(e => {
                    console.error('Error: Connection TimeOut: ', self.pool.config.server);
                    return reject(e);
                })
            }
            else {
                await self.pool.close();
                await self.pool.connect().then(async i => {
                    self._pool = await i;
                    console.info('As heen connected to Store Box.');
                    return resolve(true);
                }).catch(e => {
                    console.error('Error: Connection TimeOut: ', self.pool.config.server);
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
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            try {
                await self.connect();
                if (self._pool == null) return;
                self.request = new sql.Request(self._pool);
                self.request.query("SELECT C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE C.c_codigo = '" + szCode + "'", (err, recordset) => {
                    self.disconnect();
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
                //self.pool.close();
            }
        });
    }

    getItemInfo2(szCode: string) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query("SELECT TOP(1) C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE (C.c_codnasa = '" + szCode + "' OR C.c_codigo = '" + szCode + "') AND C.nu_intercambio = 0", (err, recordset) => {
                self.disconnect();
                if (err) return console.log(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                //recordset.recordset.price = self.for
                return rs(recordset);
            });
        });
    }

    getItemInfo3(szCode: string) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query("SELECT TOP(1) C.c_codigo, C.c_codnasa, P.n_precio1 as price, (SELECT CONVERT(DECIMAL(10,2),((CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END)/(select 1804994.46 as n_factor  from vad10..MA_MONEDAS where c_codmoneda = '0000000004'))) AS prcusd FROM VAD20..MA_PRODUCTOS WHERE c_codigo = P.C_CODIGO) as prcusd, (SELECT 1804994.46 as n_factor FROM VAD10..MA_MONEDAS WHERE c_codmoneda = '0000000004') as tasa, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 1.16) WHEN 8 THEN (P.n_precio1 * 1.08) ELSE P.n_precio1 END) as precio, P.n_impuesto1, (CASE P.n_impuesto1 WHEN 16 THEN (P.n_precio1 * 0.16) WHEN 8 THEN (P.n_precio1 * 0.08) ELSE '0.00' END) as impuesto, P.C_DESCRI FROM VAD20..MA_CODIGOS C INNER JOIN VAD20..MA_PRODUCTOS P ON  C.c_codnasa= P.C_CODIGO WHERE (C.c_codnasa = '" + szCode + "' OR C.c_codigo = '" + szCode + "') AND C.nu_intercambio = 0", (err, recordset) => {
                self.disconnect();
                if (err) return console.log(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                //recordset.recordset.price = self.for
                return rs(recordset);
            });
        });
    }

    sendItem(szCode: string) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self.pool);
            if (szCode === 'allmsv') {
                self.request.query(`UPDATE VAD20.dbo.bio_txtscale SET app_update = NULL`, (err, recordset) => {
                    if (err) return reject(err.stack.split('\n')[0]);
                    return resolve(`👍 Masivo Enviado con exito❕`);
                });
            } else {
                self.request.query(`SELECT c_codnasa FROM VAD20.dbo.MA_CODIGOS_IDEMPIERE WHERE c_codigo = '${szCode}'`, (err, master) => {
                    if (err) return reject(err.stack.split('\n')[0]);
                    if (master.recordset.length > 0) {
                        master = master.recordset[0];
                        self.request.query(`UPDATE VAD20..bio_txtscale SET app_update = NULL WHERE c_codigo = '${master.c_codnasa}'`, (err, recordset) => {
                            if (err) return reject(err.stack.split('\n')[0]);
                            self.request.query(`SELECT C_DESCRI as name, n_precio1 as precio FROM VAD20..MA_PRODUCTOS WHERE c_codigo='${master.c_codnasa}'`, (err, data) => {
                                if (err) return reject(err.stack.split('\n')[0]);
                                if (data !== undefined && data.recordset !== null && data.recordset.length > 0)
                                    return resolve(`👍 🔑Codigo: (${master.c_codnasa}) - 📄${data.recordset[0].name} 🏷️Precio: ${data.recordset[0].precio}, debe esperar 1 minutos para que el proceso lo envie a balanza❕`);
                                else return resolve(`El 🔑Codigo (${master.c_codnasa}) no existe❕`);
                            });
                        });
                    } else {
                        return resolve(`El 🔑Codigo (${master.c_codnasa}) no existe❕`);
                    }


                });
            }
        });
    }

    getItemiDempiere(szCode: string) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query(`SELECT t.* FROM (SELECT 
                mc.c_codigo,
                mc.c_codnasa,
                convert(decimal(10,2), coalesce(bpc.pricestdconverted, mp.n_precio1) * (coalesce(bpc.taxrate, mp.n_impuesto1)/100+1) ) as price,
                convert(decimal(10,2), (coalesce(bpc.pricestdconverted, mp.n_precio1) * (coalesce(bpc.taxrate, mp.n_impuesto1)/100+1) ) / coalesce(bpc.rate, mm.n_factor)) as prcusd,
                convert(decimal(10,2), coalesce(bpc.pricestdconverted, mp.n_precio1) * (coalesce(bpc.taxrate, mp.n_impuesto1)/100+1) ) as precio,
                convert(decimal(10,2), mp.n_precio1 * (coalesce(bpc.taxrate, mp.n_impuesto1)/100+1) ) as stellar,
                bpc.rate as tasa,
                mp.n_impuesto1,
                convert(decimal(10,2), coalesce(bpc.pricestdconverted, mp.n_precio1) * (coalesce(bpc.taxrate, mp.n_impuesto1)/100) ) as impuesto,
                mp.C_DESCRI,
                bpc.isimported
                FROM VAD20.dbo.MA_PRODUCTOS mp
                JOIN VAD20.dbo.MA_CODIGOS mc ON mc.c_codnasa = mp.C_CODIGO
                JOIN VAD10.dbo.MA_MONEDAS mm ON mm.c_simbolo = 'USD'
                LEFT JOIN [192.168.100.19].VAD20.dbo.Bio_Price_Change bpc ON bpc.value = mc.c_codnasa and bpc.ad_org_id = ${self.getOrg(self.addr)[2]}
                WHERE (mc.c_codnasa = '${szCode}' or mc.c_codigo = '${szCode}')
                GROUP BY mc.c_codigo,
                mc.c_codnasa,
                bpc.pricestdconverted,
                mp.n_precio1,
                bpc.taxrate,
                bpc.rate,
                mm.n_factor,
                mp.n_impuesto1,
                mp.C_DESCRI,
                bpc.isimported) as t
                WHERE t.c_codigo = '${szCode}'`, (err, recordset) => {
                self.disconnect();
                if (err) return console.log(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false); //console.log('ERROR NO HAY PRODUCTO');;
                let date = new Date();
                let descri = 'Articulo / ' + recordset.recordset[0].C_DESCRI;
                let sku = 'SKU / ' + recordset.recordset[0].c_codigo + color.bold.bgRed.yellow(' Fecha & Hora : ' + `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${(date.getHours() > 11 && date.getHours() < 23) ? 'PM' : 'AM'}`);
                console.log(color.bold.bgRed.yellow(descri), color.bold.bgRed.white(sku));
                //recordset.recordset.price = self.for
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
                return ['TIENDA T04 CABUDARE', 'HABLADORES_T04', 1000006];
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
    printlabel(Org: String, Print: String, szCode: String, sku: String, desc: String, price: String, iva: String, pv: String, ved: Array<any>) {
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
            + pv + s
            //+ '"VES"'+ s
            //+ '"'+ved[0]+'"' + s // Price Base
            //+ '"'+ved[1]+'"' + s // Price Total
            //+ '"'+ved[2]+'"' + s // IVA
            , (error, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
            })
    }

    login(username: string, password: string) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            try {
                await self.connect();
                if (self._pool == null) return;
                self.request = new sql.Request(self._pool);
                self.request.query(`select *, (1000003) as org from VAD20.dbo.MA_CODIGOS_IDEMPIERE WHERE c_codnasa = '${username}' AND c_codigo = '${password}'`, (err, result) => {
                    self.disconnect();
                    if (err) return console.log(err);
                    // send records as a response
                    if (result.recordset.length <= 0) return rs(false);

                    console.info("as");

                    return rs(result.recordset);
                });
            } finally {
                // CLOSE POOL
                console.dir('Datos retornados.')
                //self.pool.close();
            }
        });
    }

    /**
     * Bio Ruta
     */

    // Bio Ruta
    getInvoice(cInvoice: string) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query(`select top 1 coalesce(ssl.biozonas_id, BRR.biozonas_id) as bz_id, coalesce(ssl.biosubzonas_id, BRR.biosubzonas_id) as bsz_id, P.C_Caja, P.C_Numero, coalesce(ssl.C_Email, BRR.C_Email) as C_Email, P.C_CONCEPTO, P.F_Fecha, coalesce(BR.created_at, BRR.created_at) as created_at, SUBSTRING(P.C_RIF, 1, 1) as doctype, P.C_RIF, P.C_DESC_CLIENTE, coalesce(ssl.N_Telefono, BRR.N_Telefono) as N_Telefono, coalesce(ssl.C_Direccion, BRR.C_Direccion) as cu_direccion_cliente, BR.biozonas_id, BR.biosubzonas_id,
            DATEDIFF(SECOND,convert(date, P.F_Fecha, 105), convert(date, GETDATE(), 105)) as dateDoc,
			--(case when BR.id is null then 'N' else 'Y' end) as isProcess
            'N' as isProcess
            from VAD20.dbo.MA_PAGOS P
            left join VAD20.dbo.BioRuta BR on P.C_RIF = BR.C_RIF or P.C_Numero = BR.C_Numero
			left join VAD20.dbo.BioRuta BRR on BRR.C_RIF = '${cInvoice}'
            LEFT join VAD10.dbo.MA_CLIENTES MC on mc.c_RIF = P.C_RIF
            left join (select top 1 max(id) as id, biozonas_id as biozonas_id, biosubzonas_id as biosubzonas_id, N_Telefono, C_Direccion, C_Email, max(created_at) as created, C_RIF as C_RIF from BioRuta Group By C_RIF, biosubzonas_id, biozonas_id, N_Telefono, C_Direccion, C_Email Order By max(created_at) DESC) ssl on ssl.C_RIF = P.C_RIF
            where (P.C_RIF = '${cInvoice}' OR P.C_Numero = '${cInvoice}')
			--and CONVERT(date, P.F_Fecha, 105) = CONVERT(date, GETDATE(), 105)
            order by coalesce(BR.created_at, P.F_Fecha) desc`, (err, recordset) => {
                self.disconnect();

                if (err) return console.error(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs({ recordset: [] });

                recordset.recordset[0].C_RIF = recordset.recordset[0]?.C_RIF.replace(/[VEJGvejg]/gm, '');

                return rs(recordset);
            });
        });
    }

    // Bio Zonas
    getZones() {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query(`select * from VAD20.dbo.BioZonas(NOLOCK)`, (err, recordset) => {
                self.disconnect();

                if (err) return console.error(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false);

                return rs(recordset);
            });
        });
    }

    // Bio SubZonas
    getSubZones() {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query(`select bsz.id, bsz.subzone, bz.id as zones_id from VAD20.dbo.BioSubZonas bsz 
            inner join VAD20.dbo.BioZonas bz on bsz.biozonas_id = bz.id`, (err, recordset) => {
                self.disconnect();

                if (err) return console.error(err);
                // send records as a response
                if (recordset.recordset.length <= 0) return rs(false);

                return rs(recordset);
            });
        });
    }

    // Bio Ruta
    setInvoice(RouteInvoice: object) {
        let self = this;
        return new Promise(async (rs, rj) => {
            // query to the database and get the records
            await self.connect();
            if (self._pool == null) return;
            self.request = new sql.Request(self._pool);
            self.request.query(`IF EXISTS(SELECT 1 FROM VAD20.dbo.BioRuta WHERE C_RIF = '${RouteInvoice['C_RIF']}' AND CONVERT(date, created_at, 105) = CONVERT(date, GETDATE(), 105))
            BEGIN
                UPDATE [VAD20].[dbo].[BioRuta] SET
                        created_at = GETDATE(),
                        isProcess = 'Y'
                        WHERE C_RIF = '${RouteInvoice['C_RIF']}' 
                        AND CONVERT(date, created_at, 105) = CONVERT(date, GETDATE(), 105)
            END
            ELSE
                INSERT INTO [dbo].[BioRuta]
                        ([C_RIF]
                        ,[C_Numero]
                        ,[C_Direccion]
                        ,[N_Telefono]
                        ,[C_Email]
                        ,[biozonas_id]
                        ,[biosubzonas_id]
                        ,[isProcess])
                  VALUES
                        ('${RouteInvoice['C_RIF']}'
                        ,'${RouteInvoice['C_Numero']}'
                        ,'${RouteInvoice['C_Direccion']}'
                        ,'${RouteInvoice['N_Telefono']}'
                        ,'${RouteInvoice['C_Email']}'
                        ,${RouteInvoice['zones_id']}
                        ,${RouteInvoice['subzones_id']}
                        ,'N')`, (err, recordset) => {
                self.disconnect();

                if (err) return console.error(err);

                return rs(true);
            });
        });
    }

    /**
     * Bio Invoice
     */

    getBioInvoice(invoiceNo: string) {
        let self = this;
        return new Promise( async(resolve, reject) => {
            if (!invoiceNo || invoiceNo.length < 8) {
                return [{ status: 'DC_INVALID', message: 'Numero de factura incorrecto.' }];
            } else {
                await self.connect();
                if(self._pool === null) return;
                self.request = new sql.Request(self._pool);
                self.request.query(`select row_number() over(order by (select 0)) as id, PO.documentno, PO.rif, PO.client, PO.totaldoc, PO.f_fecha, PO.f_hora, PO.codnasa, PO.description, PO.price, sum(PO.qty) as qty, sum(PO.total) as total, PO.Estado, PO.Duplicado, PO.dateDoc, PO.totaldoc/sum(bcc.n_factor) as totaldocusd
				from (select TOP 5
                row_number() over(order by (select 0)) as id
                ,mp.C_Numero as documentno
                ,mp.C_RIF as rif
                ,mp.C_DESC_CLIENTE as client
                ,mp.N_Total as totaldoc
                ,mp.F_Fecha as f_fecha
                ,mp.F_Hora as f_hora
                ,mt.COD_PRINCIPAL as codnasa
                ,mp2.C_DESCRI as description
                ,mt.Precio as price
                ,mt.Cantidad as qty
                ,mt.Subtotal as total
                ,coalesce(cis.Estado, 'False') as Estado
                ,coalesce(cis.Duplicado, 'False') as Duplicado
                ,DATEDIFF(SECOND,convert(date, mp.F_Fecha, 105), convert(date, GETDATE(), 105)) as dateDoc,
				sum(mt.Cantidad) as qtysum
                from MA_PAGOS mp 
                inner join MA_TRANSACCION mt on mt.C_Numero = mp.C_Numero
                left join c_invoicescanned cis on cis.C_Numero = mp.C_Numero
                inner join MA_PRODUCTOS mp2 on mp2.C_CODIGO = mt.COD_PRINCIPAL 
                where mp.C_Numero = '${invoiceNo}'
                and mp.C_CONCEPTO = 'VEN'
                --and mt.Cantidad > 0
                group by mp.C_Numero, mp.C_RIF, mp.C_DESC_CLIENTE, mp.N_Total, mp.F_Fecha, mp.F_Hora, mt.COD_PRINCIPAL, mp2.C_DESCRI, mt.Precio, mt.Cantidad, mt.Subtotal, cis.Estado, cis.Duplicado
				--having sum(Cantidad) > 0
                --order by mt.Subtotal Desc
				) AS PO
				inner join VAD20.dbo.bio_c_conversion_rate bcc on bcc.f_fecha = convert(date, getdate(), 105)
				group by PO.documentno, PO.rif, PO.client, PO.totaldoc, PO.f_fecha, PO.f_hora, PO.codnasa, PO.description, PO.price, PO.Estado, PO.Duplicado, PO.dateDoc
				having sum(PO.qty) > 0
				order by PO.price DESC
                `, (err, recordset) => {
                    if(err) return resolve([]);

                    return resolve(recordset?.recordset);
                });
            }
        });
    }

    setBioInvoice(invoiceNo: String, fecha: String, hora: String) {
        let self = this;
        return new Promise( async(resolve, reject) => {
            if(!invoiceNo || invoiceNo.length < 8) {
                return [{ status: 'DC_INVALID', message: 'Numero de factura incorrecto.' }];
            } else {
                await self.connect();
                if(self._pool === null) return;
                self.request = new sql.Request(self._pool);
                self.request.query(`if not exists(select * from c_invoicescanned where C_Numero = '${invoiceNo}')
                begin
                    insert into c_invoicescanned ([C_Numero], [F_Fecha], [F_Hora], [Estado], [Duplicado], [Creado]) VALUES ('${invoiceNo}', '${fecha}', '${hora}', 'True', 'False', GETDATE())
                end
                else
                begin
                    update c_invoicescanned set Duplicado = 'True' where C_Numero = '${invoiceNo}'
                end`, (err, recordset) => {
                    if(err) return console.error(err);

                    return resolve([{ status: 'DC_VALID' }]);
                });
            }
        });
    }

}
