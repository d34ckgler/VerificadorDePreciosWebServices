let cups = require('./lib/cups');

function format(n, sep, decimals) {
    sep = sep || "."; // Default to period as decimal separator
    decimals = decimals || 2; // Default to 2 decimals

    return n.toLocaleString().split(sep)[0]
        + sep
        + n.toFixed(decimals).split(sep)[1];
}

function getOrg(org) {
    switch(org) {
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
    }
}

module.exports = function(app) {
    app.get('/json/:code/:org', (req,res) => {
        return res.status(200).send({status: 404, message: "Disabled"});
        let sql = require('./secure/con-server');
        sql = new sql(req.params.org);
        sql.connect().then( r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            sql.getItemInfo2(req.params.code).then( r => { 
                console.log('Producto Obtenido...');
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/jsonp/:code/:org', (req,res) => {
        // let sql = require('./secure/con-server');
        import { mssql } from './secure/con-server';
        sql = new sql(req.params.org);
        sql.connect().then( r => {
            console.log('Conexion establecida con servidor de base de datos mediante GET.');
            sql.getItemInfo2(req.params.code).then( r => {
                if(r.recordset == undefined) return res.status(404).send({statusCode: 404});
                if(r.recordset.length > 0)
                    {
                        r.recordset[0]['C_DESCRI'] = r.recordset[0]['C_DESCRI'].replace('/', '-');
                        Object.assign(r.recordset[0], { format: format(r.recordset[0].precio, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                        Object.assign(r.recordset[0], { tasaf: format(r.recordset[0].tasa, ".", 2).replace('.', '..').replace(/,/g, '.').replace('..', ',')});
                    }
                
                res.send(r.recordset);
                sql.disconnect();
            });
        });
    });

    app.get('/printzpl/:args', (req,res) => {
        if(Object.keys(req.params).length <= 0) return;

        return res.send([{STATUS: "ERROR", msg: "Impresión de Habladores Deshabilitada"}]);

        let args = JSON.parse(req.params.args);
        //res.send(args);

        console.log('ARGS: ', args);

        let cupClient = new cups();
        let vlan = args.org.split('.').slice(1,2);
        args.org = vlan;
        cupClient.print(args).then( r => {
            console.log(r);
            res.send(r);
        });
    });

    app.get('/api/v2/sendItem/:org/:codigo', (req, res, next) => {
        if(req.params.org === null || req.params.codigo === null) {
            res.status(200).send('Parametros incorrectos.');
            return next();
        }

        let sql = require('./secure/con-server');
        sql = new sql(getOrg(req.params.org));

        sql.sendItem(req.params.codigo).then( (response) => {
            res.status(200).send(response);
            return next();
        }).catch( (e) => {
            console.error(e);
        });
    });
}