/* ============================================================
   DEMO · patentes de ejemplo para no tener que tipear.

   En la demostración, quien la prueba no conoce ninguna patente. Pedirle que
   escriba una "de ejemplo" que no sabe cuál es lo deja pegado en la primera
   pantalla de la recepción. Estos chips le dan las patentes que SÍ existen en
   los datos de ejemplo, con el modelo al lado, y al tocar una la busca sola.

   Vive solo en la demo. En la plataforma real el contenedor #demoPatentes no
   existe, así que este script no hace nada aunque se cargara.
   ============================================================ */
(function () {
  "use strict";

  // las que tienen cita agendada: son las que abren una recepción completa.
  var EJEMPLOS = [
    { pat: "KLXH23", auto: "Hyundai Accent" },
    { pat: "BFGT45", auto: "Hyundai Creta" },
    { pat: "JRPD67", auto: "Mahindra Pik Up" },
    { pat: "HDNM12", auto: "BAIC X25" }
  ];

  function pintar() {
    var caja = document.getElementById("demoPatentes");
    if (!caja || caja.dataset.listo) return;
    caja.dataset.listo = "1";
    caja.innerHTML =
      '<span class="demo-patentes__t">Prueba con una de estas:</span>' +
      EJEMPLOS.map(function (e) {
        return '<button type="button" class="demo-chip" data-pat="' + e.pat + '">' +
          '<b>' + e.pat + '</b> ' + e.auto + "</button>";
      }).join("");
    [].forEach.call(caja.querySelectorAll(".demo-chip"), function (b) {
      b.addEventListener("click", function () {
        var inp = document.getElementById("recBuscarPat");
        if (inp) inp.value = b.dataset.pat;
        if (typeof window.agRecepcionPorPatente === "function") {
          window.agRecepcionPorPatente(b.dataset.pat);
        }
      });
    });
  }

  // el bloque de recepción se pinta al abrir esa vista, no al cargar la página
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setInterval(pintar, 700); });
  } else { setInterval(pintar, 700); }
})();
