/* ============================================================
   Carrusel de fondo del hero de la landing.

   Tres fotos que se funden una en otra, solas cada unos segundos, y también a
   mano deslizando o con los puntos de abajo.

   Es DECORATIVO: si este script no corre, queda la primera foto fija y la
   página funciona igual. Por eso no bloquea nada ni es indispensable.

   Respeta prefers-reduced-motion: quien pidió menos movimiento no recibe el
   cambio automático -solo la primera foto-, pero sí puede cambiarlas a mano.
   ============================================================ */
(function () {
  "use strict";

  var fotos = [].slice.call(document.querySelectorAll(".hero__foto"));
  var cont = document.getElementById("heroFotos");
  var dots = document.getElementById("heroDots");
  if (fotos.length < 2 || !dots) return;

  var actual = 0;
  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timer = null;
  var LAPSO = 5000;

  // un punto por foto
  fotos.forEach(function (_, i) {
    var b = document.createElement("button");
    b.className = "hero__dot" + (i === 0 ? " is-on" : "");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Foto " + (i + 1) + " de " + fotos.length);
    b.addEventListener("click", function () { ir(i); reiniciar(); });
    dots.appendChild(b);
  });
  var botones = [].slice.call(dots.children);

  function ir(i) {
    i = (i + fotos.length) % fotos.length;
    fotos[actual].classList.remove("is-on");
    botones[actual].classList.remove("is-on");
    actual = i;
    fotos[actual].classList.add("is-on");
    botones[actual].classList.add("is-on");
  }

  function avanzar() { ir(actual + 1); }

  function arrancar() {
    if (menosMovimiento) return;               // sin auto-play si pidieron calma
    timer = setInterval(avanzar, LAPSO);
  }
  function parar() { if (timer) { clearInterval(timer); timer = null; } }
  function reiniciar() { parar(); arrancar(); }

  // no gastar en animar cuando la pestaña no se ve
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar(); else reiniciar();
  });

  // deslizar con el dedo o arrastrando el mouse
  var x0 = null;
  function inicio(x) { x0 = x; }
  function fin(x) {
    if (x0 === null) return;
    var d = x - x0; x0 = null;
    if (Math.abs(d) > 40) { ir(actual + (d < 0 ? 1 : -1)); reiniciar(); }
  }
  cont.addEventListener("touchstart", function (e) { inicio(e.touches[0].clientX); }, { passive: true });
  cont.addEventListener("touchend", function (e) { fin(e.changedTouches[0].clientX); }, { passive: true });
  cont.addEventListener("mousedown", function (e) { inicio(e.clientX); });
  window.addEventListener("mouseup", function (e) { if (x0 !== null) fin(e.clientX); });

  arrancar();
})();
