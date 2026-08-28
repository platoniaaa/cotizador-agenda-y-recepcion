/* ============================================================
   DEMO · fotos de ejemplo.

   La recepción no deja ingresar el vehículo sin las 7 fotos obligatorias, y
   eso está bien: son la única prueba del estado en que llegó el auto. Pero
   quien está viendo la demostración no tiene un auto al lado para
   fotografiar, y sin pasar de ahí no se llega al acta en PDF, que es
   justamente lo que hay que mostrar.

   Este botón las inventa. Entran por el MISMO camino que una foto de verdad
   -se arma un File y se le pasa a agSubirFoto()-, así que pasan por el
   redimensionado, por el control de calidad y por la subida igual que
   cualquier otra. No es un atajo que se salta la lógica: es una cámara falsa.

   Las imágenes tienen que pasar js/foto-control.js, que rechaza las borrosas,
   las planas y las repetidas. Por eso cada una se arma con un patrón de brillo
   distinto y con bordes: una foto gris uniforme sería rechazada, y con razón.
   ============================================================ */
(function () {
  "use strict";

  function generar(texto, i) {
    var cv = document.createElement("canvas");
    cv.width = 800; cv.height = 600;
    var c = cv.getContext("2d");

    var semilla = i * 7919 + 104729;
    function az() { semilla = (semilla * 1103515245 + 12345) & 0x7fffffff; return semilla / 0x7fffffff; }

    /* El control de fotos repetidas compara un hash perceptual de 8x8: mira la
       LUMINANCIA A GRAN ESCALA, no el detalle. El primer intento dibujaba
       figuras al azar sobre el mismo degradado, y las ocho salían idénticas a
       esa resolución -el detector las rechazó, con razón-.

       Por eso el fondo se arma como un tablero de 8x6 con brillos distintos en
       cada foto: es exactamente la escala que el hash observa. */
    var celdaW = 800 / 8, celdaH = 600 / 6;
    for (var cx = 0; cx < 8; cx++) {
      for (var cy = 0; cy < 6; cy++) {
        var v = Math.floor(40 + az() * 190);
        c.fillStyle = "rgb(" + v + "," + Math.floor(v * 0.92) + "," + Math.floor(v * 0.84) + ")";
        c.fillRect(cx * celdaW, cy * celdaH, celdaW + 1, celdaH + 1);
      }
    }

    /* Encima, formas y líneas: el control mide el DETALLE con una laplaciana y
       rechaza lo borroso. Un tablero de bloques planos no tiene bordes finos. */
    for (var k = 0; k < 30; k++) {
      c.beginPath();
      c.moveTo(az() * 800, az() * 600);
      c.lineTo(az() * 800, az() * 600);
      c.lineTo(az() * 800, az() * 600);
      c.closePath();
      c.fillStyle = "rgba(255,255,255," + (0.06 + az() * 0.20).toFixed(2) + ")";
      c.fill();
      c.strokeStyle = "rgba(15,25,40,0.55)";
      c.lineWidth = 1 + az() * 3;
      c.stroke();
    }
    for (var l = 0; l < 16; l++) {
      c.beginPath();
      c.arc(az() * 800, az() * 600, 8 + az() * 55, 0, Math.PI * 2);
      c.strokeStyle = "rgba(255,255,255,0.4)";
      c.lineWidth = 2;
      c.stroke();
    }

    // el rótulo, para saber qué vista es cada una al mirar el acta
    c.fillStyle = "rgba(10,18,32,0.75)";
    c.fillRect(0, 470, 800, 130);
    c.fillStyle = "#fff";
    c.font = "bold 46px system-ui, sans-serif";
    c.fillText(texto, 34, 528);
    c.font = "22px system-ui, sans-serif";
    c.fillStyle = "#c9d6e8";
    c.fillText("Imagen de ejemplo", 34, 566);
    return cv;
  }

  function comoArchivo(cv, nombre) {
    return new Promise(function (listo) {
      cv.toBlob(function (b) {
        listo(new File([b], nombre, { type: "image/jpeg" }));
      }, "image/jpeg", 0.9);
    });
  }

  function cargar(btn) {
    var vistas = window.AGFOTOS || [];
    if (!vistas.length || typeof window.agSubirFoto !== "function") {
      alert("Abre primero una recepción.");
      return;
    }
    btn.disabled = true;
    var original = btn.textContent;
    var i = 0;

    function siguiente() {
      if (i >= vistas.length) {
        btn.disabled = false;
        btn.textContent = original;
        return;
      }
      btn.textContent = "Cargando " + (i + 1) + " de " + vistas.length + "…";
      var idx = i;
      comoArchivo(generar(vistas[idx], idx), "demo_" + idx + ".jpg").then(function (f) {
        var input = document.querySelectorAll("#photoWrap input[type=file]")[idx];
        if (input) {
          // se le pone el archivo al input igual que si el usuario lo hubiera
          // elegido, y se dispara el mismo manejador de siempre
          var dt = new DataTransfer();
          dt.items.add(f);
          input.files = dt.files;
          window.agSubirFoto(input, idx);
        }
        i++;
        // una a una: cada foto se compara con las anteriores para detectar
        // repetidas, y en paralelo se pisarían entre ellas
        setTimeout(siguiente, 900);
      });
    }
    siguiente();
  }

  function poner() {
    var cont = document.getElementById("photoWrap");
    if (!cont || document.getElementById("demoFotos")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "demoFotos";
    b.className = "demo-btn";
    b.textContent = "Usar fotos de ejemplo (para no fotografiar un auto ahora)";
    b.addEventListener("click", function () { cargar(b); });
    cont.parentNode.insertBefore(b, cont);
  }

  // el formulario de recepción se pinta cuando se abre una cita, no al cargar
  // la página: se revisa cada vez que cambia
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setInterval(poner, 800); });
  } else { setInterval(poner, 800); }
})();
