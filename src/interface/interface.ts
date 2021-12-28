export interface orderlines {
    sku: string,
    cant: number,
    nombre: string,
    precio: number,
    peso: number,
    peso_total: number,
    total: number,
    iva: number
}

export interface detallepago {
    method: string,
    mount: number,
    id_trans: number,
    referencia: string,
    payment_status: string
}

export interface order {
    localidad: string,
    tienda_id: string,
    norder: string,
    envio: string,
    sub_total: string,
    exento: string,
    base_imponible: string,
    iva: string,
    total: string,
    rif: string,
    direccion_de_entrega: string,
    direccion_b: string,
    descripcion: string,
    telefono: string,
    email: string,
    fecha_de_orden: string,
    fecha_para_entrega: string,
    delivery: string,
    orderlines: orderlines[],
    detallepago: detallepago[],
    direccion_a: string
}