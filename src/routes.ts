import { Router } from 'express';
import { format, getOrg } from './functions';
import { cups } from './lib/cups';
import { invoiceRoutes } from './routers/bioinvoices';
import { bioRutas } from './routers/biorutas';
import { localStoreRoute } from './routers/localStore';
// Conexion a Base de Datos SQL Server
import { mssql } from './secure/con-server';

module.exports = function (app: Router) {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });

    /**
     * bio Rutas - routers
     */
        bioRutas(app);
    // ===================
    /**
     * bio invoice - routers
     */
        invoiceRoutes(app);
    // ===================
    /**
    * local Store - Inspired in bio Gourmet
    */
        localStoreRoute(app);
    // ===================

    app.get('/getProduct/:code/:org', (req, res) => {
        //return res.status(200).send({status: 404, message: "Disabled"});
        console.info("Movil");
        let sql = new mssql(req.params.org);
        sql.connect().then((r: any) => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemiDempiere(req.params.code).then((r: any) => {
                console.log('Producto Obtenido...');
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.post('/api/v1/login', (req, res) => {
        console.log(req.query);
        if (req.query['username'] && req.query['password']) {
            let sql = new mssql('10.10.10.1');
            sql.connect().then(async (r: any) => {
                let result = await sql.login(req.query['username'].toString(), req.query['password'].toString());
                if (Array.isArray(result)) {
                    res.status(200).json(result);
                } else {
                    res.status(404).json({
                        status: 404,
                        data: null
                    });
                }
            });
        } else {
            res.status(404).json({
                status: 404,
                data: null
            });
        }
    });

    app.get('/jsonp/:code/:org', (req, res) => {
        let sql = new mssql(req.params.org);
        sql.connect().then((r: any) => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo2(req.params.code).then((r: any) => {
                if (r.recordset == undefined) return res.status(404).send({ statusCode: 404 });
                if (r.recordset.length > 0) {
                    Object.assign(r.recordset[0], { p_dolar: format(r.recordset[0].prcusd, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                    // Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                    Object.assign(r.recordset[0], { format: format( parseFloat(r.recordset[0].precio.toFixed(2)), ".", 2)});
                    Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                    Object.assign(r.recordset[0], { ved: format(r.recordset[0].precio * 1000000, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                }

                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/bcv/:code/:org', (req, res) => {
        let sql = new mssql(req.params.org);
        sql.connect().then((r: any) => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo2(req.params.code).then((r: any) => {
                if (r.recordset == undefined) return res.status(404).send({ statusCode: 404 });
                if (r.recordset.length > 0) {
                    Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                    Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                }

                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/bcv/:code/:org', (req, res) => {
        let sql = new mssql(req.params.org);
        sql.connect().then((r: any) => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo3(req.params.code).then((r: any) => {
                if (r.recordset == undefined) return res.status(404).send({ statusCode: 404 });
                if (r.recordset.length > 0) {
                    Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                    Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',') });
                }

                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/printProductZpl/:args', (req, res) => {
        if (Object.keys(req.params).length <= 0) return;

        //return res.send([{STATUS: "ERROR", msg: "Impresión de Habladores Deshabilitada"}]);

        let args = JSON.parse(req.params.args);
        //res.send(args);

        console.log('ARGS: ', args);

        let cupClient = new cups();
        let vlan = args.org.split('.').slice(1, 2);
        args.org = vlan;
        cupClient.print(args).then((r: any) => {
            console.log(r);
            res.send(r);
        });
    });

    app.get('/api/v2/sendItem/:org/:codigo', (req, res, next) => {
        if (req.params.org == null || req.params.codigo == null) {
            res.status(200).send('Parametros incorrectos.');
            return next();
        }

        if (req.params.org === 'Seleccione una tienda') {
            console.info(req.params.org);
            return res.status(502).send("Debe seleccionar una organizacion valida!");
        }

        console.info('Enviando Codigo a balanza: (%s) para la organizacion: (%s)', req.params.codigo, req.params.org);

        let sql = new mssql(getOrg(req.params.org));

        sql.sendItem(req.params.codigo).then((response) => {
            res.status(200).send(response);
            //return next();
        }).catch((e) => {
            res.status(502).send(e);
            //return next();
            console.error(e);
        });
    });
}