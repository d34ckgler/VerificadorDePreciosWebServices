module.exports = class cups {
    private exec = require('child_process').exec;
    private child = null;
    private printer: String;
    constructor() {}

    getOrg(vlan:Number) {
        switch(vlan) {
            case 10:
                return ['TIENDA T01 MANONGO', 'HBT01'];
            break;
            case 20:
                return ['TIENDA T02 PARAPARAL', 'HBT02'];
            break;
            case 30:
                return ['TIENDA T03 SANTA CECILIA', 'HBT03'];
            break;
            case 40:
                return ['TIENDA T04 CABUDARE', 'HBT04'];
            break;
            case 1:
                return ['EXPRESS LA GRANJA', 'HBT03'];
            break;
            case 2:
                return ['EXPRESS EL BOSQUE', 'HBT03'];
            break;
            default: 
                return ['TIENDA T01 MANONGO', 'HHS'];
            break;
        }
    }

    // Printer Hab
    printl(Org:String, Print:String, szCode:String, sku:String, desc:String, price:String, iva:String, pv:String) {
    console.log('la tienda es ', Org, 'La impresora es ', Print);
        let s = ' ';
        this.child = this.exec('java -jar ./src/plugin/PrintHablClass.jar '
                                                                        + Org+s
                                                                        + Print+s
                                                                        + szCode+s
                                                                        + sku+s
                                                                        + desc+s
                                                                        + price+s
                                                                        + iva+s
                                                                        + pv, (error, stdout, stderr) => {
            console.log("stdout: " + stdout);
            console.log("stderr: " + stderr);
        })
    }
    print(Parameters: any) {
        return new Promise( (resolve, reject) => {
            if(typeof Parameters === 'undefined' || Object.keys(Parameters).length <= 0) return reject();
            let s = ' ';
            console.log("Parametros", Parameters);
            this.child = this.exec('java -jar ./src/plugin/PrintHablClass.jar '
                                                                        + '"'+this.getOrg(parseInt(Parameters.org[0]))[0]+'"'+s
                                                                        + '"'+this.getOrg(parseInt(Parameters.org[0]))[1]+'"'+s
                                                                        + Parameters.c_codigo+s
                                                                        + Parameters.c_codnasa+s
                                                                        + '"'+Parameters.C_DESCRI+'"'+s
                                                                        + Parameters.pricelist+s
                                                                        + Parameters.iva+s
                                                                        + Parameters.pv+s
                                                                        + Parameters.currency, (error, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                if(stderr.indexOf('Error: Unable to access jarfile ../src/plugin/PrintHablClass.jar') >= 0)
                    return resolve([{STATUS: "ERROR", msg: "Libreria no encontrada"}]);
                else if(stderr.indexOf('GRAVE: null') >= 0) {
                    return resolve([{STATUS: "ERROR", msg: "Error, Verificar Cups de Impresiòn Reportar a Sistemas OP."}]);
                }
                else
                    return resolve([{STATUS: "OK", msg: "Impresión de Hablador Exitosa"}]);
            });

        });
    }
}