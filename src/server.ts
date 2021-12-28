const express:any = require('express');
const cors:any = require('cors');
const helmet:any = require('helmet');
const path:any = require('path');
const http:any = require('http');
//const https:any = require('https');
const socketIO = require('socket.io');
const fs:any = require('fs');
const zlib = require('compression');
const bodyParser = require('body-parser');
const compression = new zlib();
// var corsOptions = {
//     "origin": "*",
//     "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//     "preflightContinue": false,
//     "optionsSuccessStatus": 204
//   }

// Cors Options
let corsOptions = {
    origin: true,
    credentials: true
  };

// Administrando Certificado
var privateKey = fs.readFileSync('./src/ssl/srvopappnginx.key');
var certificate = fs.readFileSync('./src/ssl/srvopappnginx.crt');

var credentials = {key: privateKey, cert: certificate};
// Creacion del servidor
const app:any = express();
var server:any;

module.exports = server = http.createServer(app);
server.timeout = 0;
const io = socketIO(server);

// Asignando puerto
app.set('port', process.env.port || 3000);

// sockets
const sockets = require('./socket');

// creando socket object
var socket = new sockets(io);

require('./routes')(app);

// Ruta Absoluta
//app.use(helmet());
app.use(cors(corsOptions));
app.use(compression);
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public_html'), {
    extensions: ['html', 'php']
}));

function Printer() {
    var ipp = require("ipp");
    var printer = ipp.Printer("http://172.30.143.117:631/printers/HBT03");
    var document;

    fs.readFile("./src/TEST.ZPL", function(err, data) {
        if (err) {
            console.log(err)
        } else {
            var cmds =  "^XA";
            cmds += "^FO20,30^GB750,1100,4^FS";
            cmds += "^FO20,30^GB750,200,4^FS";
            cmds += "^FO20,30^GB750,400,4^FS";
            cmds += "^FO20,30^GB750,700,4^FS";
            cmds += "^FO20,226^GB325,204,4^FS";
            cmds += "^FO30,40^ADN,36,20^FDShip to:^FS";
            cmds += "^FO30,260^ADN,18,10^FDPart number #^FS";
            cmds += "^FO360,260^ADN,18,10^FDDescription:^FS";
            cmds += "^FO30,750^ADN,36,20^FDFrom:^FS";
            cmds += "^FO150,125^ADN,36,20^FDAcme Printing^FS";
            cmds += "^FO60,330^ADN,36,20^FD14042^FS";
            cmds += "^FO400,330^ADN,36,20^FDScrew^FS";
            cmds += "^FO70,480^BY4^B3N,,200^FD12345678^FS";
            cmds += "^FO150,800^ADN,36,20^FDMacks Fabricating^FS";
            cmds += "^XZ";

            var msg = {
                "operation-attributes-tag": {
                    "requesting-user-name": "userprint",
                    "document-format": "application/vnd.cups-raw"
                },
                data: data };

                console.log(data)
        
            printer.execute("Print-Job", msg, function(err, res) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    return;
            });
        }
    });
}

// Creando Servidor web
server.listen(app.get('port'), () => {
    console.log("Servidor Corriendo en: srvopappnginx:" + app.get('port'));
    //20739

    // test
    //Printer();
});