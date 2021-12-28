import { Router, Request } from "express";
const bodyParser = require('body-parser');
import { mssql } from "../secure/con-server";
export const invoiceRoutes = (app: Router) => {

    app.use(bodyParser.json({ limit: '50mb', extended: true }));

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

    app.get('/api/v1/procesar/tracking/Parking/:org', async (req, res, next) => {
        let sql = new mssql(req.params.org);
        let dataInvoice = await sql.setParkingTicket(req.query.invoice.toString(), req.query.ticket.toString());
        res.status(200).json(dataInvoice);
        // next();
    });

    app.post('/api/v2/consulta/camioneta/factura/:org', async (req: Request, res, next) => {
        let sql = new mssql(req.params?.org);
        console.info(req?.body);
        let dataInvoice = await sql.consultaSorteoCamioneta(req?.body);
        res.status(200).json(dataInvoice);
    });
};