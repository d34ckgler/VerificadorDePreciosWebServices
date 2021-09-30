import { Router } from "express";
import { mssql } from "../secure/con-server";
export const localStoreRoute = (app: Router) => {
    /**
     * Local Store - Inspired in bio Gourmet
     */
     app.get('/localstore/api/getProducts/:org', async (req: any, res) => {
        let sql = new mssql(req?.params?.org);
        let productList = await sql.getProducts();
        res.status(200).json(productList);
    });
};