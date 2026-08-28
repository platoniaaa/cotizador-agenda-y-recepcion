# Plataforma de Postventa — demostración

Cotizador, agenda y recepción de vehículos para un taller de servicio.
Esta es una **demostración con datos de ejemplo**, pensada para mostrar la
plataforma funcionando sin conectarla a ningún sistema.

**Ver la demostración:** https://platoniaaa.github.io/cotizador-agenda-y-recepcion/

## Qué se puede probar

| | |
|---|---|
| **Cotizador** | Precios de mantención por marca, modelo, versión y kilometraje, con disponibilidad de repuestos. Cotización parcial y orden en PDF. |
| **Agenda** | Horas por sucursal, solicitudes que llegan desde la web y corrección de citas sin anularlas. |
| **Recepción** | Inspección fotográfica con control de calidad, mapa de daños sobre un diagrama del vehículo, y acta de recepción en PDF con condiciones y firmas. |
| **Vista del cliente** | Página pública, sin clave, donde el cliente cotiza y pide su hora. |

La guía completa, con las patentes de ejemplo, está en
[LEEME.html](https://platoniaaa.github.io/cotizador-agenda-y-recepcion/LEEME.html).

## Cómo funciona

Son archivos estáticos: HTML, CSS y JavaScript, sin nada que compilar ni
instalar. No hay servidor detrás. Las consultas que la plataforma haría a su
base de datos las responde `js/demo-api.js` dentro del mismo navegador, y lo
que el visitante haga queda en su `localStorage`.

Eso permite que la demostración corra **el mismo código que la versión
instalada**: lo que se muestra es la plataforma, no una maqueta parecida.

Para verla en local basta un servidor estático en esta carpeta:

```
python -m http.server 8000
```

## Sobre los datos

Los clientes, patentes, RUT, teléfonos y correos son **inventados**. Ninguno
corresponde a una persona real. Los RUT tienen dígito verificador válido
porque la plataforma lo comprueba.

`Automotora Ejemplo S.A.` y los datos de contacto del acta son marcadores de
posición: en una instalación real se reemplazan por los de la empresa.

## Alcance

- Los avisos por correo al cliente no se envían: requieren un servidor de correo.
- Las fotos que se carguen se pierden al recargar la página; el resto del
  estado se mantiene.
- Cualquier correo entra con la clave `demo`.
