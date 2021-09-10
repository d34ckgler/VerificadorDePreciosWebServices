import { Router } from "express";
import { mssql } from "../secure/con-server";
export const invoiceRoutes = (app: Router) => {
    /**
     * Bio Invoice Routes
     */
     app.get('/api/v1/consulta/tracking/factura/:org', async (req, res, next) => {
        let sql = new mssql(req.params.org);
        let dataInvoice = await sql.getBioInvoice(req.query.invoice.toString());
        res.status(200).json(dataInvoice);
    });

    app.get('/api/v1/procesar/tracking/factura/:org', async (req, res, next) => {
        let sql = new mssql(req.params.org);
        let dataInvoice = await sql.setBioInvoice(req.query.invoice.toString(), req.query.fecha.toString(), req.query.hora.toString());
        res.status(200).json(dataInvoice);
        // next();
    });
};