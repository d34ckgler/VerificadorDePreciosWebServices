export class cups {
    private exec = require('child_process').exec;
    private child = null;
    private printer: String;
    constructor() {}

    getOrg(vlan:Number) {
        switch(vlan) {
            case 10:
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01'];
            break;
            case 20:
                return ['TIENDA T02 PARAPARAL', 'HABLADORES_T02'];
            break;
            case 30:
                return ['TIENDA T03 SANTA CECILIA', 'HABLADORES_T03'];
            break;
            case 40:
                return ['TIENDA T04 CABUDARE', 'HABLADORES_T04'];
            break;
            case 50:
                return ['TIENDA T05 PATIO TRIGAL', 'HABLADORES_T05'];
            break;
            case 1:
                return ['EXPRESS LA GRANJA', 'HABLADORES_E01'];
            break;
            case 2:
                return ['EXPRESS EL BOSQUE', 'HABLADORES_E02'];
            break;
            default: 
                return ['TIENDA T01 MANONGO', 'HABLADORES_T01'];
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
    rounded(float: number, taxamt: number) {
        return Math.floor( (float/(taxamt/100+1))*100)/100;
    }
    getTaxAmt(float: number, taxamt: number) {
        return Math.floor((Math.floor( (float/(taxamt/100+1))*100)/100)*(taxamt/100)*100)/100;
    }
    print(Parameters: any) {
        return new Promise( (resolve, reject) => {
            if(typeof Parameters === 'undefined' || Object.keys(Parameters).length <= 0) return reject();
            let s = ' ';
            console.log("Parametros", this.getOrg(parseInt(Parameters.org[0]))[0], this.getOrg(parseInt(Parameters.org[0]))[1]);
            this.child = this.exec('java -jar ./src/plugin/PrintHablClass.jar '
                                                                        + '"'+this.getOrg(parseInt(Parameters.org[0]))[0]+'"'+s
                                                                        + '"'+this.getOrg(parseInt(Parameters.org[0]))[1]+'"'+s
                                                                        + Parameters.c_codigo+s
                                                                        + Parameters.c_codnasa+s
                                                                        + '"'+Parameters.C_DESCRI+'"'+s
                                                                        + (Parameters?.currency === 'USD' ? this.rounded(Parameters?.price.toFixed(2), Parameters?.n_impuesto1) : this.rounded(Parameters?.price, Parameters?.n_impuesto1))+s
                                                                        + Parameters.iva+s
                                                                        + Parameters.pv+s
                                                                        + Parameters.currency+s
                                                                        + (Parameters?.currency === 'USD' ? this.getTaxAmt(Parameters?.price.toFixed(2), Parameters?.n_impuesto1) : this.getTaxAmt(Parameters?.price, Parameters?.n_impuesto1))+s
                                                                        + Parameters.prcusd, (error, stdout, stderr) => {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                if(stderr.indexOf('Error: Unable to access jarfile ../src/plugin/PrintHablClass.jar ') >= 0)
                    return resolve([{STATUS: "ERROR", msg: "Libreria no encontrada"}]);
                else if(stderr.indexOf('GRAVE: null') >= 0) {
                    return resolve([{STATUS: "ERROR", msg: "Error, Verificar Cups de Impresiòn Reportar a Sistemas OP."}]);
                }
                else
                    return resolve([{STATUS: "OK", msg: "Impresión de Hablador Exitosa"}]);
            });

        });
    }

    printf(args: any) {
        const self = this;
        return new Promise((resolve, reject) => {
            if(typeof args === 'undefined' || Object.keys(args).length <= 0) return reject(null);
            let scape = ' ';
            let orgData = self.getOrg(parseInt(args['org'][0]));
            let orgName = orgData[0];
            let orgPrinter = orgData[1];
            // return args;
            self.child = self.exec(`java -jar ./src/plugin/cupsPrinter.jar ` + `"${orgName}" "${orgPrinter}" "${args['C_DESCRI']}" "${args['c_codigo']}" ${args['c_codnasa']} "${args['price']}" "${args['iva']}" "${args['pv']}" "${args['ved']}" "${args['prcusd']}" "${args['isUsd']}"`, (error, stdout, stderr) => {
                if(error) {
                    console.error(error, "\n", stdout, "\n", stderr);
                    return resolve([{STATUS: "ERROR", msg: "Libreria no encontrada"}]);
                } else if(stderr.indexOf('GRAVE: null') >= 0) {
                    return resolve([{STATUS: "ERROR", msg: "Error, Verificar Cups de Impresiòn Reportar a Sistemas OP."}]);
                }
                else    return resolve([{STATUS: "OK", msg: "Impresión de Hablador Exitosa"}]);
            });
        });
    }
}