/* ============================================================
   DEMO · Supabase de mentira.

   La plataforma corre EXACTAMENTE con el mismo código que la de producción.
   Lo único que cambia es que acá se intercepta `fetch` y las llamadas a la
   base se responden desde el navegador. Se hizo así, y no editando cada
   módulo, por dos razones:

     · lo que se muestra es la plataforma de verdad, no una maqueta parecida;
     · cuando la real cambie, este demo se actualiza copiando los archivos, sin
       tener que rehacer nada.

   NADA sale del navegador. js/agenda-config.js apunta a un dominio inexistente
   (demo.postventa.invalid), así que aunque esta intercepción fallara, la petición
   no llegaría a ningún servidor de la empresa.

   Todo lo que el usuario haga -agendar, recibir, corregir datos- se guarda en
   el localStorage de su propio navegador. El botón "Reiniciar demo" lo borra y
   deja los datos de ejemplo como al principio.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.CURIFOR_AGENDA || {};
  var BASE = CFG.url || "";
  var LLAVE = "curiforDemoBD_v1";
  var SESKEY = "curiforTallerWebSes_v1";
  var D = window.DEMO_DATOS;

  /* ---------- la "base de datos" ---------- */
  function semilla() {
    return {
      personal: D.personal.slice(),
      clientes: D.clientes.slice(),
      vehiculos: D.vehiculos.slice(),
      reservas_web: JSON.parse(JSON.stringify(D.reservas)),
      taller_estado: [{
        sucursal: "SUCURSAL CENTRO",
        version: 1,
        data: {
          agendamientos: [],
          orders: D.orders(),
          ocSeq: D.correlativos.oc,
          roSeq: D.correlativos.ro,
          webImp: {}
        }
      }],
      taller_archivo: [],
      correlativos: JSON.parse(JSON.stringify(D.correlativos))
    };
  }

  var BD;
  try {
    BD = JSON.parse(localStorage.getItem(LLAVE) || "null") || semilla();
  } catch (e) { BD = semilla(); }

  function grabar() {
    try { localStorage.setItem(LLAVE, JSON.stringify(BD)); }
    catch (e) { /* sin espacio: el demo sigue en memoria */ }
  }
  grabar();

  /* Las fotos y firmas viven SOLO en memoria: son dataURL de cientos de kB y
     llenarían el localStorage a la tercera recepción. Se pierden al recargar,
     y eso está dicho en el LÉEME: para mostrar el flujo alcanza de sobra. */
  var ARCHIVOS = {};

  /* ---------- consultas tipo PostgREST ----------
     La plataforma consulta con la sintaxis de PostgREST (?patente=eq.X&
     select=...&order=...). Acá se interpreta lo justo que la plataforma usa;
     no pretende ser PostgREST completo. */
  function valorFiltro(txt) {
    if (txt === "null") return null;
    if (txt === "true") return true;
    if (txt === "false") return false;
    var n = Number(txt);
    return txt !== "" && !isNaN(n) ? n : txt;
  }

  function cumple(fila, campo, expr) {
    var i = expr.indexOf(".");
    var op = i < 0 ? "eq" : expr.slice(0, i);
    var arg = i < 0 ? expr : expr.slice(i + 1);
    var v = fila[campo];
    if (op === "eq")  return String(v) === String(valorFiltro(arg));
    if (op === "neq") return String(v) !== String(valorFiltro(arg));
    if (op === "gt")  return v > valorFiltro(arg);
    if (op === "gte") return v >= valorFiltro(arg);
    if (op === "lt")  return v < valorFiltro(arg);
    if (op === "lte") return v <= valorFiltro(arg);
    if (op === "is")  return arg === "null" ? (v == null) : (v === (arg === "true"));
    if (op === "in") {
      var lista = arg.replace(/^\(|\)$/g, "").split(",").map(function (x) {
        return x.replace(/^"|"$/g, "");
      });
      return lista.indexOf(String(v)) >= 0;
    }
    if (op === "like" || op === "ilike") {
      var re = new RegExp("^" + arg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$",
                          op === "ilike" ? "i" : "");
      return re.test(String(v == null ? "" : v));
    }
    return true;
  }

  function consultar(tabla, params) {
    var filas = (BD[tabla] || []).slice();
    params.forEach(function (p) {
      var k = p[0], v = p[1];
      if (k === "select" || k === "order" || k === "limit" || k === "offset") return;
      filas = filas.filter(function (f) { return cumple(f, k, v); });
    });
    /* order acepta varios campos separados por coma ("fecha.asc,hora.asc"),
       que es como ordena la plataforma la bandeja de reservas. */
    var orden = params.find(function (p) { return p[0] === "order"; });
    if (orden) {
      var criterios = orden[1].split(",").map(function (c) {
        var t = c.split(".");
        return { campo: t[0], desc: t.indexOf("desc") >= 0 };
      });
      filas.sort(function (a, b) {
        for (var i = 0; i < criterios.length; i++) {
          var c = criterios[i], x = a[c.campo], y = b[c.campo];
          if (x === y) continue;
          if (x == null) return 1;
          if (y == null) return -1;
          return (x > y ? 1 : -1) * (c.desc ? -1 : 1);
        }
        return 0;
      });
    }
    var lim = params.find(function (p) { return p[0] === "limit"; });
    if (lim) filas = filas.slice(0, +lim[1]);
    return filas;
  }

  function json(cuerpo, estado) {
    return Promise.resolve(new Response(JSON.stringify(cuerpo), {
      status: estado || 200,
      headers: { "Content-Type": "application/json" }
    }));
  }
  function vacio(estado) {
    return Promise.resolve(new Response(null, { status: estado || 204 }));
  }

  /* ---------- sesión ---------- */
  function token(email) {
    // con la forma de un JWT solo para que nada se extrañe; no cifra nada
    return "demo." + btoa(JSON.stringify({ email: email, demo: true })).replace(/=/g, "") + ".demo";
  }
  function sesionDe(email) {
    return {
      access_token: token(email), refresh_token: "demo-refresh",
      expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400,
      user: { email: email, id: "demo-" + email }
    };
  }

  /* La estación tiene que estar en una sucursal, o el taller consulta una
     bandeja vacía y la agenda aparece sin ninguna cita. En la plataforma real
     el asesor la elige la primera vez; acá viene puesta para que la
     demostración empiece con datos en pantalla. Se puede cambiar en el
     selector como siempre. */
  try {
    if (!localStorage.getItem("curiforTallerSucursal")) {
      localStorage.setItem("curiforTallerSucursal", "SUCURSAL CENTRO");
    }
  } catch (e) { /* sin storage */ }

  /* Deja una sesión puesta al abrir el demo. Sin esto, cada página redirige al
     login y quien está viendo la demostración se topa con un formulario antes
     de ver nada. El login igual funciona si alguien cierra sesión. */
  (function sesionInicial() {
    try {
      var s = JSON.parse(localStorage.getItem(SESKEY) || "null");
      if (s && s.access) return;
      var j = sesionDe("demo@empresa.demo");
      localStorage.setItem(SESKEY, JSON.stringify({
        access: j.access_token, refresh: j.refresh_token,
        exp: j.expires_at, email: j.user.email
      }));
    } catch (e) { /* sin storage: el guard mandará al login */ }
  })();

  /* ---------- el interceptor ---------- */
  var fetchReal = window.fetch.bind(window);

  window.fetch = function (entrada, opciones) {
    var url = typeof entrada === "string" ? entrada : (entrada && entrada.url) || "";
    if (!BASE || url.indexOf(BASE) !== 0) return fetchReal(entrada, opciones);

    var o = opciones || {};
    var metodo = (o.method || "GET").toUpperCase();
    var resto = url.slice(BASE.length);
    var cuerpo = null;
    try { cuerpo = o.body ? JSON.parse(o.body) : null; } catch (e) { cuerpo = o.body; }

    try {
      return responder(resto, metodo, cuerpo, o) || json({ message: "demo: ruta no cubierta" }, 404);
    } catch (e) {
      return json({ message: "demo: " + e.message }, 500);
    }
  };

  function responder(ruta, metodo, cuerpo, o) {
    // ---- auth ----
    if (ruta.indexOf("/auth/v1/token") === 0) {
      if (ruta.indexOf("refresh_token") >= 0) {
        var prev = JSON.parse(localStorage.getItem(SESKEY) || "null");
        return json(sesionDe((prev && prev.email) || "demo@empresa.demo"));
      }
      var mail = String((cuerpo && cuerpo.email) || "").toLowerCase();
      var clave = (cuerpo && cuerpo.password) || "";
      var existe = D.usuarios.indexOf(mail) >= 0;
      // en la demostración entra cualquier correo válido con la clave "demo":
      // quien la mira no tiene por qué adivinar un dominio
      var dominioOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail);
      if ((existe || dominioOk) && clave === D.clave) return json(sesionDe(mail));
      return json({ error: "invalid_grant",
                    error_description: "Escribe cualquier correo y la clave  demo" }, 400);
    }
    if (ruta.indexOf("/auth/v1/signup") === 0) {
      return json({ user: { email: (cuerpo && cuerpo.email) || "" } });
    }

    // ---- storage ----
    if (ruta.indexOf("/storage/v1/object/sign/recepciones/") === 0) {
      var pFirma = decodeURI(ruta.slice("/storage/v1/object/sign/recepciones/".length));
      return json({ signedURL: "/demo/" + pFirma });
    }
    if (ruta.indexOf("/storage/v1/object/recepciones/") === 0) {
      var pSub = decodeURI(ruta.slice("/storage/v1/object/recepciones/".length));
      return guardarArchivo(pSub, o.body).then(function () {
        return new Response(JSON.stringify({ Key: "recepciones/" + pSub }),
                            { status: 200, headers: { "Content-Type": "application/json" } });
      });
    }

    // ---- rpc ----
    if (ruta.indexOf("/rest/v1/rpc/siguiente_correlativo") === 0) {
      var tipo = (cuerpo && cuerpo.p_tipo) || "oc";
      var minimo = (cuerpo && cuerpo.p_minimo) || 0;
      var n = Math.max(BD.correlativos[tipo] || 0, minimo);
      BD.correlativos[tipo] = n + 1;
      grabar();
      return json(n);
    }
    if (ruta.indexOf("/rest/v1/rpc/") === 0) return json(null);

    // ---- tablas ----
    var m = ruta.match(/^\/rest\/v1\/([a-z_]+)(\?(.*))?$/);
    if (!m) return null;
    var tabla = m[1];
    if (!BD[tabla]) BD[tabla] = [];
    var params = (m[3] || "").split("&").filter(Boolean).map(function (par) {
      var i = par.indexOf("=");
      return [decodeURIComponent(par.slice(0, i)), decodeURIComponent(par.slice(i + 1))];
    });
    var devolver = /return=representation/i.test((o.headers && (o.headers.Prefer || o.headers.prefer)) || "");

    if (metodo === "GET") return json(consultar(tabla, params));

    if (metodo === "POST") {
      var nuevas = [].concat(cuerpo || []);
      /* Bloqueo optimista de la bandeja del taller: si ya existe la fila de esa
         sucursal, un INSERT choca. Es el mismo 409 que devuelve Postgres por la
         llave única, y la plataforma sabe manejarlo. */
      if (tabla === "taller_estado") {
        var yaEsta = BD.taller_estado.some(function (f) { return f.sucursal === nuevas[0].sucursal; });
        if (yaEsta) return json({ message: "duplicate key" }, 409);
      }
      nuevas.forEach(function (f) {
        if (!f.id) f.id = "demo-" + Math.abs(hash(JSON.stringify(f) + BD[tabla].length));
        if (tabla === "reservas_web") {
          if (!f.estado) f.estado = "nueva";
          if (!f.creado_en) f.creado_en = new Date().toISOString();
        }
        BD[tabla].push(f);
      });
      grabar();
      return devolver ? json(nuevas) : vacio(201);
    }

    if (metodo === "PATCH") {
      var afectadas = consultar(tabla, params);
      /* Sin filas que calcen se devuelve una lista VACÍA, no un error: así es
         como la plataforma detecta que otra estación se le adelantó. */
      afectadas.forEach(function (f) { Object.assign(f, cuerpo || {}); });
      grabar();
      return devolver ? json(afectadas) : vacio(204);
    }

    if (metodo === "DELETE") {
      var fuera = consultar(tabla, params);
      BD[tabla] = BD[tabla].filter(function (f) { return fuera.indexOf(f) < 0; });
      grabar();
      return vacio(204);
    }
    return null;
  }

  function hash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
    return h;
  }

  function guardarArchivo(path, blob) {
    return new Promise(function (listo) {
      if (!blob || typeof blob === "string") { ARCHIVOS[path] = blob || null; return listo(); }
      var fr = new FileReader();
      fr.onload = function () { ARCHIVOS[path] = fr.result; listo(); };
      fr.onerror = function () { ARCHIVOS[path] = null; listo(); };
      fr.readAsDataURL(blob);
    });
  }

  /* La plataforma arma la URL de una foto como `url + "/storage/v1" + signedURL`
     y la usa como src de un <img>. Eso no pasa por fetch, así que interceptarlo
     no basta: se reemplaza la función que la construye para devolver
     directamente el dataURL guardado. Es lo único del demo que toca una función
     de la plataforma, y lo hace desde afuera, sin editar taller.js. */
  function engancharArchivos() {
    if (typeof window.webUrlFirmada !== "function") return;
    window.webUrlFirmada = function (path) {
      return Promise.resolve(ARCHIVOS[path] || null);
    };
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", engancharArchivos);
  } else { engancharArchivos(); }

  /* ---------- control del demo ---------- */
  window.DEMO = {
    reiniciar: function () {
      BD = semilla();
      ARCHIVOS = {};
      grabar();
      /* No basta con rehacer la base falsa: la plataforma guarda ADEMÁS su
         propia copia de la bandeja en localStorage y la fusiona al arrancar.
         Sin borrarla, el reinicio devolvía las reservas al estado inicial pero
         dejaba las recepciones ya hechas en el taller. Se limpia todo lo suyo
         menos el id de estación, que no es un dato del demo. */
      try {
        Object.keys(localStorage)
          .filter(function (k) {
            return k.indexOf("curiforTaller_v1") === 0 || k === "curiforTallerPrefill";
          })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* sin storage */ }
      location.reload();
    },
    bd: function () { return BD; },
    archivos: function () { return Object.keys(ARCHIVOS); }
  };
})();
