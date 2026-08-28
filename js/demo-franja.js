/* ============================================================
   DEMO · barra de presentación.

   Esto lo ve un cliente potencial evaluando la plataforma, no alguien de
   Postventa. Por eso la barra PRESENTA en vez de advertir: dice qué está viendo
   e invita a probar.

   La primera versión decía "nada de lo que hagas acá toca la plataforma real".
   Es cierto, y es tranquilizador para quien trabaja en Postventa, pero a un
   prospecto le habla de un sistema que no conoce y le siembra la duda de si
   está viendo algo de segunda. Lo mismo dicho al revés —"prueba lo que
   quieras, no se guarda nada"— invita en lugar de prevenir.

   Se mantiene visible todo el tiempo por una razón que sí corresponde: quien
   la mire tiene que saber que los datos son de ejemplo y no de clientes.
   ============================================================ */
(function () {
  "use strict";

  function pintar() {
    if (document.getElementById("demoFranja")) return;
    var f = document.createElement("div");
    f.id = "demoFranja";
    f.innerHTML =
      '<span class="demoFranja__t">Demostración</span>' +
      '<span class="demoFranja__d">Datos de ejemplo. Prueba lo que quieras: ' +
      'nada se guarda fuera de tu navegador.</span>' +
      '<button type="button" id="demoTour" class="demoFranja__b">Recorrido guiado</button>' +
      '<a href="LEEME.html" target="_blank" class="demoFranja__b">Cómo probarla</a>' +
      '<button type="button" id="demoReset" class="demoFranja__b">Empezar de nuevo</button>';
    document.body.insertBefore(f, document.body.firstChild);
    document.getElementById("demoTour").addEventListener("click", function () {
      if (window.DEMO_TUTORIAL) window.DEMO_TUTORIAL.reiniciar();
    });
    document.getElementById("demoReset").addEventListener("click", function () {
      if (confirm("Vuelve a los datos de ejemplo iniciales y se pierde lo que hayas hecho. ¿Seguir?")) {
        try {
          localStorage.removeItem("demoTutorialPaso");
          localStorage.removeItem("demoTutorialCerrado");
        } catch (e) {}
        window.DEMO.reiniciar();
      }
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintar);
  else pintar();
})();
