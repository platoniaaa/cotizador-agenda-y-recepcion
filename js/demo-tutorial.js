/* ============================================================
   DEMO · recorrido guiado.

   Quien abre la demostración está solo, sin nadie que le explique. Sin una
   guía termina apretando botones al azar, no llega al acta —que es lo que hay
   que mostrar— y se va con la idea de que el sistema es confuso.

   Tres decisiones de fondo:

   · El recorrido AVANZA SOLO cuando detecta que el paso se hizo. Un tutorial
     que solo dice "ahora aprieta Siguiente" es una presentación con botones;
     uno que reacciona demuestra que la plataforma responde de verdad.

   · Cada paso dice QUÉ hacer y POR QUÉ importa. Lo segundo es lo que un
     cliente potencial vino a evaluar: no le interesa dónde está el botón, le
     interesa qué problema le resuelve apretarlo.

   · Nunca bloquea. Es un panel al costado, no un modal encima: si el visitante
     quiere irse por su cuenta a mirar otra cosa, puede, y el paso lo sigue
     esperando.

   El estado vive en localStorage porque el recorrido cruza cuatro páginas.
   ============================================================ */
(function () {
  "use strict";

  var LLAVE = "demoTutorialPaso";
  var CERRADO = "demoTutorialCerrado";

  /* En qué pantalla estamos.

     Para el taller NO sirve mirar la URL: agenda y recepción viven en la misma
     página, y al abrir una recepción desde la agenda el formulario se pinta en
     el sitio sin navegar. Mirando la dirección, el recorrido se quedaba
     esperando para siempre un cambio de URL que nunca llegaba. Manda lo que
     está en pantalla. */
  function pagina() {
    var f = location.pathname.split("/").pop() || "index.html";
    if (f !== "taller.html") return f;
    var rec = document.getElementById("recForm");
    if (rec && !rec.hidden && rec.offsetParent !== null) return "taller:recepcion";
    return "taller:" + (new URLSearchParams(location.search).get("vista") === "recepcion"
                        ? "recepcion" : "agenda");
  }

  function elTexto(sel) {
    var e = document.querySelector(sel);
    return e ? e.textContent.trim() : "";
  }
  function visible(sel) {
    var e = document.querySelector(sel);
    return !!e && !e.hidden && e.offsetParent !== null;
  }

  /* Los pasos. `hecho` es lo que se revisa para avanzar solo; `hazlo` es el
     atajo para quien prefiere que se lo muestren en vez de tipear. */
  var PASOS = [
    {
      pag: "index.html",
      titulo: "Esto es lo que usa el equipo del taller",
      texto: "Tres pantallas: cotizar, agendar y recibir el vehículo. Vamos a recorrer " +
             "el camino completo de un auto, de la consulta hasta la orden de trabajo.",
      porque: "Toma unos diez minutos y termina con los documentos que se le entregan al cliente.",
      cta: "Partamos por cotizar",
      ir: "cotizador.html"
    },
    {
      pag: "cotizador.html",
      titulo: "Con la patente basta",
      texto: "Escribe <b>KLXH23</b> arriba y presiona Buscar.",
      porque: "Trae el vehículo y también a su dueño. El asesor no tipea nada más.",
      foco: "#inpPatente",
      hazlo: function () {
        var i = document.getElementById("inpPatente");
        if (!i) return;
        i.value = "KLXH23";
        document.getElementById("btnPatente").click();
      },
      ctaHazlo: "Escribirla por mí",
      hecho: function () {
        return elTexto("#cliNombreTxt").length > 0 &&
               elTexto("#cliNombreTxt") !== "Sin datos del cliente";
      }
    },
    {
      pag: "cotizador.html",
      titulo: "Apareció el cliente, no solo el auto",
      texto: "Ahora elige una <b>versión</b> en el selector y presiona " +
             "<b>Ver plan de mantención</b>.",
      porque: "El registro no informa la versión, así que la confirma el asesor. Es el único dato que se elige a mano.",
      foco: "#selVersion",
      hecho: function () { return visible("#paso2"); }
    },
    {
      pag: "cotizador.html",
      titulo: "El cliente no siempre quiere todo",
      texto: "En la lista de repuestos, <b>destilda uno</b>.",
      porque: "«Hazme el aceite, pero el filtro de aire no.» El total se rehace solo y queda escrito qué quedó fuera: eso es lo que evita la discusión en la entrega.",
      foco: ".chk-item",
      hecho: function () { return !!document.querySelector(".dg-parcial"); }
    },
    {
      pag: "cotizador.html",
      titulo: "La orden, en PDF",
      texto: "Presiona <b>Descargar PDF</b>.",
      porque: "Sale a nombre del cliente, con lo incluido y lo excluido. Es el documento que se lleva o recibe por correo.",
      foco: "#btnPDF",
      hecho: function () { return window.__demoPdf === true; }
    },
    {
      pag: "cotizador.html",
      titulo: "Y de aquí se agenda",
      texto: "Presiona <b>Agendar</b> para llevar esta cotización a la agenda del taller.",
      porque: "Viaja completa: el auto, el cliente, la mantención y lo que se sacó. Nadie la vuelve a escribir.",
      foco: "#btnAgendar",
      hecho: function () { return pagina().indexOf("taller:") === 0; }
    },
    {
      pag: "taller:agenda",
      titulo: "La agenda del día",
      texto: "Estas son las horas de hoy. Presiona <b>Ingresar</b> en cualquiera para recibir ese vehículo.",
      porque: "Arriba a la izquierda, «Reservas web» son las horas que pidieron los clientes desde la página pública y esperan confirmación.",
      foco: "#tblAgenda",
      hecho: function () { return pagina() === "taller:recepcion"; }
    },
    {
      pag: "taller:recepcion",
      titulo: "Recibiendo el vehículo",
      texto: "Usa el botón <b>Usar fotos de ejemplo</b>. Sin la inspección fotográfica no se puede ingresar el auto.",
      porque: "Son la única prueba del estado en que llegó. Cada foto se revisa: si sale borrosa o repetida, se rechaza.",
      foco: "#demoFotos",
      hecho: function () {
        return document.querySelectorAll(".photo-slot.has-photo").length >= 7;
      }
    },
    {
      pag: "taller:recepcion",
      titulo: "Los daños se marcan, no se describen",
      texto: "Baja hasta el diagrama del auto, elige un tipo de daño y <b>toca dónde viene</b>.",
      porque: "«Rayón en la puerta trasera derecha» depende de quién cuente las puertas y desde dónde mire. Un punto en un dibujo no depende de nada.",
      foco: "#danoMapa",
      hecho: function () { return !!document.querySelector(".dm-lista li"); }
    },
    {
      pag: "taller:recepcion",
      titulo: "Falta firmar",
      texto: "Firma los dos recuadros con el mouse y presiona <b>Ingresar a Taller</b>.",
      porque: "Ahí se abre la orden de trabajo y se descarga el acta: fotos, mapa de daños, condiciones generales y tratamiento de datos personales.",
      foco: ".firmas",
      hecho: function () { return window.__demoActa === true; }
    },
    {
      pag: "taller:recepcion",
      titulo: "Ese es el recorrido del taller",
      texto: "El acta quedó descargada y la orden de trabajo abierta, con su número correlativo.",
      porque: "Falta ver lo que ve el cliente: una página pública donde cotiza y pide su hora sin instalar nada.",
      cta: "Ver la página del cliente",
      ir: "cliente.html"
    },
    {
      pag: "cliente.html",
      titulo: "Lo que ve el cliente",
      texto: "Elige una marca y sigue hasta pedir una hora. Prueba también <b>Ford</b>.",
      porque: "La solicitud llega a la agenda del taller para que un asesor la confirme. Ford se agenda en el sistema del fabricante, así que se deriva sola.",
      foco: ".marca",
      fin: true
    }
  ];

  /* ---------- estado ---------- */
  function leerPaso() {
    try { return parseInt(localStorage.getItem(LLAVE) || "0", 10) || 0; }
    catch (e) { return 0; }
  }
  function guardarPaso(n) {
    try { localStorage.setItem(LLAVE, String(n)); } catch (e) {}
  }
  function cerrado() {
    try { return localStorage.getItem(CERRADO) === "1"; } catch (e) { return false; }
  }

  var caja = null, resaltado = null, reloj = null;

  function quitarResaltado() {
    if (resaltado) { resaltado.classList.remove("demo-foco"); resaltado = null; }
  }

  function resaltar(sel) {
    quitarResaltado();
    if (!sel) return;
    var e = document.querySelector(sel);
    if (!e) return;
    e.classList.add("demo-foco");
    resaltado = e;
  }

  function pintar() {
    var n = leerPaso();
    var paso = PASOS[n];
    if (!paso || cerrado()) { if (caja) caja.hidden = true; quitarResaltado(); return; }

    // el paso pertenece a otra página: se espera sin estorbar
    if (paso.pag !== pagina()) {
      if (caja) caja.hidden = true;
      quitarResaltado();
      return;
    }

    if (!caja) {
      caja = document.createElement("aside");
      caja.id = "demoTutor";
      document.body.appendChild(caja);
    }
    caja.hidden = false;

    var total = PASOS.length;
    caja.innerHTML =
      '<div class="dt-cab">' +
        '<span class="dt-n">Paso ' + (n + 1) + ' de ' + total + '</span>' +
        '<button type="button" class="dt-x" id="dtCerrar" aria-label="Cerrar el recorrido">&#10005;</button>' +
      '</div>' +
      '<h4 class="dt-t">' + paso.titulo + '</h4>' +
      '<p class="dt-d">' + paso.texto + '</p>' +
      (paso.porque ? '<p class="dt-p">' + paso.porque + '</p>' : "") +
      '<div class="dt-pie">' +
        (n > 0 ? '<button type="button" class="dt-b dt-b--ghost" id="dtAtras">Atrás</button>' : "") +
        (paso.hazlo ? '<button type="button" class="dt-b dt-b--alt" id="dtHazlo">' +
                      (paso.ctaHazlo || "Hazlo por mí") + "</button>" : "") +
        '<button type="button" class="dt-b" id="dtSig">' +
          (paso.fin ? "Terminar" : (paso.cta || "Siguiente")) +
        "</button>" +
      "</div>" +
      '<div class="dt-barra"><i style="width:' + Math.round((n / (total - 1)) * 100) + '%"></i></div>';

    document.getElementById("dtCerrar").onclick = function () {
      try { localStorage.setItem(CERRADO, "1"); } catch (e) {}
      caja.hidden = true; quitarResaltado();
    };
    var atras = document.getElementById("dtAtras");
    if (atras) atras.onclick = function () { guardarPaso(Math.max(0, n - 1)); pintar(); };
    var hazlo = document.getElementById("dtHazlo");
    if (hazlo) hazlo.onclick = function () { paso.hazlo(); };
    document.getElementById("dtSig").onclick = function () { avanzar(paso, n); };

    resaltar(paso.foco);
  }

  function avanzar(paso, n) {
    if (paso.fin) {
      try { localStorage.setItem(CERRADO, "1"); } catch (e) {}
      guardarPaso(0);
      caja.hidden = true; quitarResaltado();
      return;
    }
    guardarPaso(n + 1);
    if (paso.ir) { location.href = paso.ir; return; }
    pintar();
  }

  /* Revisa si el paso ya se cumplió. Cada 700 ms alcanza de sobra para que se
     sienta inmediato y no cuesta nada. */
  function vigilar() {
    var n = leerPaso();
    var paso = PASOS[n];
    /* Se evalúa AUNQUE ya no estemos en la página del paso: hay pasos que se
       completan justamente navegando a otra ("presiona Agendar" termina en el
       taller). Exigir seguir en la misma página dejaba el recorrido colgado en
       la página nueva, sin panel y sin manera de seguir.

       Los predicados miran elementos que solo existen en su propia pantalla,
       así que fuera de ella devuelven falso solos. */
    if (!paso || cerrado() || !paso.hecho) return;
    var ok = false;
    try { ok = !!paso.hecho(); } catch (e) { ok = false; }
    if (!ok) return;
    guardarPaso(n + 1);
    pintar();
  }

  /* Dos acciones no dejan rastro en el DOM —descargar un PDF y generar el
     acta—, así que se marcan al vuelo interceptando el botón. */
  function marcarDescargas() {
    var pdf = document.getElementById("btnPDF");
    if (pdf && !pdf._demoTut) {
      pdf._demoTut = 1;
      pdf.addEventListener("click", function () {
        setTimeout(function () { window.__demoPdf = true; }, 1200);
      });
    }
    var ing = [].slice.call(document.querySelectorAll(".agbtn-green"))
      .filter(function (b) { return /Ingresar a Taller/i.test(b.textContent); })[0];
    if (ing && !ing._demoTut) {
      ing._demoTut = 1;
      ing.addEventListener("click", function () {
        setTimeout(function () { window.__demoActa = true; }, 2500);
      });
    }
  }

  function reiniciar() {
    try { localStorage.removeItem(CERRADO); } catch (e) {}
    guardarPaso(0);
    if (location.pathname.split("/").pop() !== "index.html" &&
        location.pathname.split("/").pop() !== "") {
      location.href = "index.html";
    } else { pintar(); }
  }
  window.DEMO_TUTORIAL = { reiniciar: reiniciar, pintar: pintar };

  function arrancar() {
    pintar();
    reloj = setInterval(function () { marcarDescargas(); vigilar(); }, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
