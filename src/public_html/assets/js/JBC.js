'use strict'
class LBC {
    constructor(){
        this.plu = null;
        this.weight = null;
    }

    wformat(x) {
        if(typeof x === 'undefined' || x === '' || x === NaN) return NaN;

        switch(x.toString().length) {
            case 1:
                return new Intl.NumberFormat('en-US').format(Number('0.00'+x));
            break;
            case 2:
                return new Intl.NumberFormat('en-US').format(Number('0.0'+x));
            break;
            case 3:
                return new Intl.NumberFormat('en-US').format(Number('0.'+x));
            break;
            case 4:
                return new Intl.NumberFormat('en-US').format(Number(x));
            break;
        }
    }

    LDecodeBar(x) {
        if(typeof x === 'undefined' || x === '' || x === NaN) return NaN;

        if(x.length === 13) {
            this.plu = x.substring(2,7);
            this.weight = parseInt(x.substring(7,12));
            //alert(Number(this.wformat(this.weight)));
            return {plu: Number(this.plu), weight: Number(this.wformat(this.weight))};
        } else {
            throw "CodeBar Formated is invalid!";
        }
    }
}