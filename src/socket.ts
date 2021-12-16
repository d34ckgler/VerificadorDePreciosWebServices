import { disconnect } from "cluster";
import { mssql } from './secure/con-server';

// const MobileDetect = require('mobile-detect');
const clr = require('colors');
let device = null;

module.exports = class io {
    private io: any;
    private addr: String;
    constructor(io: any) {
        let _this = this;
        _this.io = io;
        _this.addr = null;
        var clients = {}

        _this.io.on('connection', socket => {
            clients[socket.id] = socket;

            _this.ping(socket);
            // Autenticado
            clients[socket.id].on('getPrice', dt => {
                console.log("DATA", dt);
                // AUDITORIA IP Y CODIGO
                console.log(clr.bold.bgRed.yellow('USUARIO CONSULTOR / ' + dt.addr));

                _this.addr = dt.addr;
                // CREANDO CONEXION
                // let sql = require('./secure/con-server');
                let sql = new mssql(dt.addr);
                sql.connect().then(res => {
                    console.log('Conexion establecida con servidor de base de datos.');
                    sql.getItemInfo(dt.code).then(res => {
                        socket.emit('getPrice', res);
                        sql.disconnect();
                        delete clients[socket.id];
                    });
                });
            });
            // socket.on('log', data => {
            //     device = new MobileDetect(data);
            // })

            _this.io.of('/').clients((error, clients) => {
                if (error) throw error;
                console.log(clr.green('Usuario: Autenticado.'));
                console.log(clients);
            });

            socket.on('pong', data => {
                console.log("Beats Recibidos /ms : ");
            });

            clients[socket.id].on('printlabel', data => {
                // let sql = require('./secure/con-server');
                let sql = new mssql(_this.addr);
                let vlan = _this.addr.split('.').slice(1, 2);
                console.log("Probando impresora");
                sql.printlabel('"' + sql.getOrg(parseInt(vlan[0]))[0] + '"', sql.getOrg(parseInt(vlan[0]))[1].toString(), '"' + data.szcode + '"', '"' + data.sku + '"', '"' + data.desc + '"', '"' + data.price + '"', '"' + data.iva + '"', '"' + data.pv + '"', data.ved);
            })

            socket.on('disconnect', function (data) {
                delete clients[socket.id];
                clients[socket.id] = socket;
            });
        });
    }

    ping(client) {
        setTimeout(() => {
            this.ping(client);
            client.emit('ping', { beat: 1 });
        }, 5000);

        setTimeout(() => {
            disconnect();
        }, 20000);
    }

}