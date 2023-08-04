export function format(n, sep, decimals) {
    sep = sep || "."; // Default to period as decimal separator
    decimals = decimals || 2; // Default to 2 decimals
    

    return n.toLocaleString().split(sep)[0]
        + sep.slice(1)
        // + n.toFixed(decimals).split(sep)[1];
}

export function getOrg(org) {
    switch (org) {
        case "Tienda 01 Manongo":
            return '10.10.10.1';
            break;
        case "Tienda 02 Paraparal":
            return '10.20.10.1';
            break;
        case "Tienda 03 Santa Cecilia":
            return '10.30.10.1';
            break;
        case "Tienda 04 Cabudare":
            return '10.40.10.1';
        break;
        case "Tienda E01 La Granja":
            return '10.1.10.1';
        break;
        case "Tienda E02 El Bosque":
            return '10.2.10.1';
        break;
    }
}