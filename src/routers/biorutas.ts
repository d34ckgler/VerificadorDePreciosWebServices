import { Router } from 'express';
// Conexion a Base de Datos SQL Server
import { mssql } from '../secure/con-server';
export const bioRutas = (app: Router) => {
    /**
     * Bio Ruta
     */
    // Buscar Factura
    app.get('/api/v1/checkInvoice/:invoice/:org', (req, res) => {
        console.log(req.params);
        if (req.params.invoice && req.params.org) {
            let sql = new mssql(req.params.org);
            sql.connect().then(r => {
                sql.getInvoice(req.params.invoice).then( (r: any) => {
                    console.log('Factura Obtenida...');
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
            let sql = new mssql(req.params.org);
            sql.connect().then(r => {
                sql.getZones().then( (r: any) => {
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
            let sql = new mssql(req.params.org);
            sql.connect().then(r => {
                sql.getSubZones().then((r: any) => {
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
        res.status(200).json({ status: "OK" });
        if (req.params.org) {
            let sql = new mssql(req.params.org);
            sql.connect().then(() => {
                sql.setInvoice(req.params).then((r: any) => {
                    res.status(200).send(r.recordset);
                    sql.disconnect();
                });
            });
        } else {
            return res.sendStatus(404);
        }
    });
};