import { isArray } from "util";

let cups = require('./lib/cups');

function format(n, sep, decimals) {
    sep = sep || "."; // Default to period as decimal separator
    decimals = decimals || 2; // Default to 2 decimals

    return n.toLocaleString().split(sep)[0]
        + sep
        + n.toFixed(decimals).split(sep)[1];
}

function getOrg(org) {
    switch (org) {
        case "Tienda 01 Manongo":
            return '10.10.10.1';
            break;
        case "Tienda 02 Paraparal":
            return '10.20.10.1';
            break;
        case "Tienda 03 Santa Cecilia":
            return '10.30.10.1';
            break;
        case "Tienda 04 Cabudare":
            return '10.40.10.1';
        break;
        case "Tienda E01 La Granja":
            return '10.1.10.1';
        break;
        case "Tienda E02 El Bosque":
            return '10.2.10.1';
        break;
    }
}

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
        });
        
    app.get('/getProduct/:code/:org', (req,res) => {
        //return res.status(200).send({status: 404, message: "Disabled"});
        console.info("Movil");
        let sql = require('./secure/con-server');
        sql = new sql(req.params.org);
        sql.connect().then(r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemiDempiere(req.params.code).then( r => { 
                console.log('Producto Obtenido...');
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    // Buscar Factura
    app.get('/api/v1/checkInvoice/:invoice/:org', (req, res) => {
        console.log(req.params);
        if (req.params.invoice && req.params.org) {
            let sql = require('./secure/con-server');
            sql = new sql(req.params.org);
            sql.connect().then(r => {
                sql.getInvoice(req.params.invoice).then(r => {
                    console.log('Factura Obtenida...');
                    console.log(r.recordset);
                    res.send(r.recordset);
                    sql.disconnect();
                });
            });
        } else {
            return res.sendStatus(404);
        }
    });

    // Lista de Zonas
    app.get('/api/v1/getZones/:org', (req, res) => {
        if (req.params.org) {
            let sql = require('./secure/con-server');
            sql = new sql(req.params.org);
            sql.connect().then(r => {
                sql.getZones().then(r => {
                    console.log('Listando Zonas...');
                    res.send(r.recordset);
                    sql.disconnect();
                });
            });
        } else {
            return res.sendStatus(404);
        }
    });

    // Lista de SubZonas
    app.get('/api/v1/getSubZones/:org', (req, res) => {
        if (req.params.org) {
            let sql = require('./secure/con-server');
            sql = new sql(req.params.org);
            sql.connect().then(r => {
                sql.getSubZones().then(r => {
                    console.log('Listando Zonas...');
                    res.send(r.recordset);
                    sql.disconnect();
                });
            });
        } else {
            return res.sendStatus(404);
        }
    });

    // Setear Factura
    app.get('/api/v1/setInvoice/:C_RIF/:C_Numero/:C_Direccion/:N_Telefono/:C_Email/:zones_id/:subzones_id/:org', (req, res) => {
        console.log(req.params);
        res.status(200).json({status: "OK"});
        if (req.params.org) {
            let sql = require('./secure/con-server');
            sql = new sql(req.params.org);
            sql.connect().then(r => {
                sql.setInvoice(req.params).then(r => {
                    res.status(200).send(r.recordset);
                    sql.disconnect();
                });
            });
        } else {
            return res.sendStatus(404);
        }
    });

    app.post('/api/v1/login', (req, res) => {
        console.log(req.query);
        if (req.query['username'] && req.query['password']) {
            let sql = require('./secure/con-server');
            sql = new sql('10.10.10.1');
            sql.connect().then(async (r) => {
                let result = await sql.login(req.query.username, req.query.password);
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
        let sql = require('./secure/con-server');
        sql = new sql(req.params.org);
        sql.connect().then(r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo2(req.params.code).then(r => {
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
        let sql = require('./secure/con-server');
        sql = new sql(req.params.org);
        sql.connect().then(r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo2(req.params.code).then( r => {
                if(r.recordset == undefined) return res.status(404).send({statusCode: 404});
                if(r.recordset.length > 0)
                    {
                        Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                        Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                    }
                
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/bcv/:code/:org', (req,res) => {
        let sql = require('./secure/con-server');
        sql = new sql(req.params.org);
        sql.connect().then( r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            console.info(`IP Consultor: ${req.params.org}`);
            sql.getItemInfo3(req.params.code).then( r => {
                if(r.recordset == undefined) return res.status(404).send({statusCode: 404});
                if(r.recordset.length > 0)
                    {
                        Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                        Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                    }
                
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/printProductZpl/:args', (req,res) => {
        if(Object.keys(req.params).length <= 0) return;

        //return res.send([{STATUS: "ERROR", msg: "Impresión de Habladores Deshabilitada"}]);

        let args = JSON.parse(req.params.args);
        //res.send(args);

        console.log('ARGS: ', args);

        let cupClient = new cups();
        let vlan = args.org.split('.').slice(1, 2);
        args.org = vlan;
        cupClient.print(args).then(r => {
            console.log(r);
            res.send(r);
        });
    });

    app.get('/api/v2/sendItem/:org/:codigo', (req, res, next) => {
        if(req.params.org == null || req.params.codigo == null) {
            res.status(200).send('Parametros incorrectos.');
            return next();
        }

        if(req.params.org === 'Seleccione una tienda') {
            console.info(req.params.org);
            return res.status(502).send("Debe seleccionar una organizacion valida!");
        }

        console.info('Enviando Codigo a balanza: (%s) para la organizacion: (%s)', req.params.codigo, req.params.org);

        let sql = require('./secure/con-server');
        sql = new sql(getOrg(req.params.org));

        sql.sendItem(req.params.codigo).then((response) => {
            res.status(200).send(response);
            //return next();
        }).catch( (e) => {
            res.status(502).send(e);
            //return next();
            console.error(e);
        });
    });
}