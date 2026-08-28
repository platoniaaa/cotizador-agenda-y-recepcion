/* ============================================================
   DEMO · Datos de ejemplo.

   TODO lo de este archivo es inventado. Ningún cliente, patente, RUT, teléfono
   ni correo de acá corresponde a una persona real: son nombres de fantasía y
   RUTs construidos para que pasen la validación del dígito verificador, que es
   lo único que la plataforma exige.

   Los modelos SÍ son del catálogo real (data/indice.json), porque si no, no
   habría pauta de mantención que mostrar y el cotizador quedaría vacío.
   ============================================================ */
(function () {
  "use strict";

  /* Fechas relativas al día en que se abre el demo: una agenda con citas de
     marzo pasado no se puede mostrar.

     Se arma con los componentes LOCALES y no con toISOString(), que devuelve la
     fecha en UTC: en Chile eso adelanta un día y las citas de "hoy" aparecían
     mañana, con la agenda del día vacía. Es la misma cuenta que hace hoyISO()
     en la plataforma. */
  function dia(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + "-" +
           String(d.getMonth() + 1).padStart(2, "0") + "-" +
           String(d.getDate()).padStart(2, "0");
  }

  // hace n días, con hora: para creado_en, que la plataforma filtra
  function hace(dias) {
    return new Date(Date.now() - dias * 86400000).toISOString();
  }

  var PERSONAL = [
    { email: "demo@empresa.demo",     nombre: "Ignacio Calderón Rojas", corto: "Ignacio Calderón", rol: "asesor",  sucursal: "SUCURSAL CENTRO" },
    { email: "asesor@empresa.demo",   nombre: "Matías Figueroa Vera",   corto: "Matías Figueroa",  rol: "asesor",  sucursal: "SUCURSAL CENTRO" },
    { email: "tecnico@empresa.demo",  nombre: "Rodrigo Salas Núñez",    corto: "Rodrigo Salas",    rol: "tecnico", sucursal: "SUCURSAL CENTRO" },
    { email: "jefe@empresa.demo",     nombre: "Carolina Bravo Pinto",   corto: "Carolina Bravo",   rol: "jefe",    sucursal: "SUCURSAL CENTRO" }
  ];

  /* Clientes de fantasía. Los RUT tienen dígito verificador correcto: la
     plataforma lo valida y con un RUT inventado a la ligera el demo se caería
     justo en la pantalla que se está mostrando. */
  var CLIENTES = [
    { rut: "11111111-1", nombre: "Comercial Los Andes Ltda.",  cel: "+56 9 8765 4321", fono: "", mail: "flota@losandes.demo" },
    { rut: "12345678-5", nombre: "Juan Pérez Soto",            cel: "+56 9 5555 1234", fono: "", mail: "juan.perez@correo.demo" },
    { rut: "22222222-2", nombre: "Transportes El Roble SpA",   cel: "+56 9 6120 7788", fono: "", mail: "pagos@elroble.demo" },
    { rut: "33333333-3", nombre: "María Fernanda Ortiz Lagos", cel: "+56 9 4411 9032", fono: "", mail: "mf.ortiz@correo.demo" },
    { rut: "5126663-3",  nombre: "Sociedad Agrícola Maitén",   cel: "+56 9 7788 2211", fono: "", mail: "contacto@maiten.demo" }
  ];

  /* Vehículos. Marca y modelo salen del catálogo real para que el cotizador
     encuentre pauta; la patente y el VIN son inventados. */
  var VEHICULOS = [
    { patente: "KLXH23", modelo: "HYUNDAI ACCENT",    anio: "2019", km: "58200",  vin: "DEMOKMHCT41DAKU0001", rut: "11111111-1" },
    { patente: "BFGT45", modelo: "HYUNDAI CRETA",     anio: "2022", km: "31400",  vin: "DEMOMALC381CBLM0002", rut: "12345678-5" },
    { patente: "JRPD67", modelo: "MAHINDRA PIK UP",   anio: "2021", km: "96750",  vin: "DEMOMA1TA2YS1M2C003", rut: "22222222-2" },
    { patente: "LSVK89", modelo: "JAC JS2",           anio: "2023", km: "18900",  vin: "DEMOLJ12KL9A8P10004", rut: "33333333-3" },
    { patente: "HDNM12", modelo: "BAIC X25",          anio: "2020", km: "72300",  vin: "DEMOLSJW74U97LN0005", rut: "5126663-3" },
    // sin dueño registrado: sirve para mostrar el flujo de escribir el cliente a mano
    { patente: "PPQR34", modelo: "HYUNDAI TUCSON",    anio: "2024", km: "4100",   vin: "DEMOKMHJ2813BNU0006", rut: null }
  ];

  /* Citas ya agendadas. Cubren los estados que el asesor ve en pantalla:
     una para recibir hoy, una confirmada para la próxima semana, una solicitud
     del cliente sin atender y una que ya entró a taller. */
  var RESERVAS = [
    { id: "demo-1", creado_en: hace(6), nombre: "Comercial Los Andes Ltda.", fono: "+56 9 8765 4321", email: "flota@losandes.demo",
      rut: "11111111-1", patente: "KLXH23", fecha: dia(0), hora: "09:30",
      comentario: "El cliente dice que suena algo adelante al frenar.",
      marca: "Hyundai", modelo: "Accent", version: "Accent 1.4 (HCi)", anio: "2019",
      km: 60000, rev_n: "6", estado: "agendada", origen: "cotizador_interno",
      sucursal: "SUCURSAL CENTRO", asesor: "Matías Figueroa", valor: 136223, oc: 1190045 },

    { id: "demo-2", creado_en: hace(5), nombre: "Juan Pérez Soto", fono: "+56 9 5555 1234", email: "juan.perez@correo.demo",
      rut: "12345678-5", patente: "BFGT45", fecha: dia(0), hora: "11:00",
      comentario: null, marca: "Hyundai", modelo: "Creta", version: "Creta 1.6", anio: "2022",
      km: 30000, rev_n: "3", estado: "agendada", origen: "taller",
      sucursal: "SUCURSAL CENTRO", asesor: "Ignacio Calderón", valor: 98400, oc: 1190046 },

    { id: "demo-3", creado_en: hace(3), nombre: "Transportes El Roble SpA", fono: "+56 9 6120 7788", email: "pagos@elroble.demo",
      rut: "22222222-2", patente: "JRPD67", fecha: dia(4), hora: "08:30",
      comentario: "Necesita el vehículo el mismo día, sale a ruta el viernes.",
      marca: "Mahindra", modelo: "Pik Up", version: "Pik Up 2.2 CRDe", anio: "2021",
      km: 100000, rev_n: "10", estado: "agendada", origen: "cotizador_interno",
      sucursal: "SUCURSAL CENTRO", asesor: "Matías Figueroa", valor: 214900, oc: 1190047 },

    // solicitud entrante del sitio público: aparece en "Reservas web" sin atender
    { id: "demo-4", creado_en: hace(1), nombre: "María Fernanda Ortiz Lagos", fono: "+56 9 4411 9032", email: "mf.ortiz@correo.demo",
      rut: null, patente: "LSVK89", fecha: dia(2), hora: "indiferente",
      comentario: "Prefiero en la mañana si se puede.",
      marca: "JAC", modelo: "JS2", version: null, anio: "2023",
      km: 20000, rev_n: "2", estado: "nueva", origen: "cliente_web",
      sucursal: null, asesor: null, valor: null, oc: null },

    { id: "demo-5", creado_en: hace(8), nombre: "Sociedad Agrícola Maitén", fono: "+56 9 7788 2211", email: "contacto@maiten.demo",
      rut: "5126663-3", patente: "HDNM12", fecha: dia(-1), hora: "10:00",
      comentario: null, marca: "BAIC", modelo: "X25", version: "X25 1.5", anio: "2020",
      km: 70000, rev_n: "7", estado: "en_taller", origen: "taller",
      sucursal: "SUCURSAL CENTRO", asesor: "Ignacio Calderón", valor: 121500, oc: 1190044,
      ro: "2000001", recibido_en: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      recibido_por: "asesor@empresa.demo", km_real: 70412, comb: "1/2",
      obs: "Rayón en tapa de maleta, ya venía. Falta tapa de rueda trasera izquierda.",
      acc: { "Gata": true, "Llave de rueda": true, "Extintor": false, "Triángulos": true } }
  ];

  /* La bandeja del taller nace VACÍA de citas a propósito.

     Sembrarlas también acá, además de en reservas_web, dejaba cada cita
     duplicada: la plataforma refresca las reservas antes de que termine de
     cargar la bandeja, no encuentra la cita todavía y la crea de nuevo con
     otro uid. Y no es un error del demo: reservas_web es la fuente de verdad
     de la cita según el propio diseño de la plataforma, así que dejar que ella
     arme la bandeja es además lo más fiel.

     Las órdenes SÍ van sembradas: viven solo en la bandeja, no existen en
     reservas_web y por lo tanto nadie las duplica. */

  /* Órdenes ya en taller. Solo la que fue recibida ayer. */
  function orders() {
    return RESERVAS.filter(function (r) { return r.ro; }).map(function (r) {
      return {
        ro: r.ro, oc: r.oc, fecha: r.fecha, pat: r.patente,
        marca: r.marca, modelo: r.modelo, version: r.version,
        anio: r.anio, km: r.km, revN: r.rev_n, pautaId: null, valorRef: r.valor,
        vin: (VEHICULOS.find(function (v) { return v.patente === r.patente; }) || {}).vin || "—",
        color: "—", cliente: r.nombre, asesor: r.asesor,
        tipo: "mant", dur: 60, rec: r.hora, del: "—",
        tec: null, ini: null, etapa: "citas_hoy", stop: null, picking: "pendiente",
        kmReal: r.km_real != null ? r.km_real : null,
        comb: r.comb || null, acc: r.acc || null, obs: r.obs || null,
        coment: r.comentario || null,
        recibidoEn: r.recibido_en, recibidoPor: r.recibido_por
      };
    });
  }

  window.DEMO_DATOS = {
    dia: dia,
    personal: PERSONAL,
    clientes: CLIENTES,
    vehiculos: VEHICULOS,
    reservas: RESERVAS,
    orders: orders,
    // correlativos donde los deja la plataforma real
    correlativos: { oc: 1190048, ro: 2000002 },
    usuarios: PERSONAL.map(function (p) { return p.email; }),
    clave: "demo"
  };
})();
