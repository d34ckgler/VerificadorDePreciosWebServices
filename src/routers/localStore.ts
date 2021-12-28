import { Router, Request, Response } from "express";
import { mssql } from "../secure/con-server";
const bodyParser = require('body-parser');
export const localStoreRoute = (app: Router) => {

    app.use(bodyParser.json({ limit: '50mb', extended: true }));

    /**
     * Local Store - Inspired in bio Gourmet
     */
    app.get('/localstore/api/getProducts/:org', async (req: Request, res: Response) => {
        let sql = new mssql(req?.params?.org);
        let productList = await sql.getProducts();
        res.status(200).json(productList);
    });

    app.get('/localstore/api/getProduct/:sku/:org', async (req: Request, res: Response) => {
        let sql = new mssql(req?.params?.org);
        let productList = await sql.getItemInfo(req?.params?.sku);
        res.status(200).json(productList['recordset']);
    });

    // Registro de orden en base de datos SQL Server - SpeedCart
    app.post('/localstore/api/processOrder/:org', async (req: Request, res: Response, next) => {
        const order = req.body;
        const sql = new mssql(req?.params?.org);

        console.log(req.body, req.params);

        // Iniciar procesar orden
        sql.setProcessOrder(order)
            .then(response => {
                res.status(200).send(response);
            })
            .catch(error => {
                console.error(error);
                res.status(500).send(error);
            });
    });
};