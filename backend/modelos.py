class Credito:
    def __init__(self, cliente, monto, tasa_interes, plazo, fecha_otorgamiento, id=None):
        self.id = id
        self.cliente = cliente
        self.monto = monto
        self.tasa_interes = tasa_interes
        self.plazo = plazo
        self.fecha_otorgamiento = fecha_otorgamiento

    def to_dict(self):
        return {
            'id': self.id,
            'cliente': self.cliente,
            'monto': self.monto,
            'tasa_interes': self.tasa_interes,
            'plazo': self.plazo,
            'fecha_otorgamiento': self.fecha_otorgamiento
        }
    """
    creamos un objeto Credito a partir de los datos del formulario y los requerimientos solicitados
    """